from rest_framework.generics import CreateAPIView,ListAPIView,RetrieveAPIView,UpdateAPIView,DestroyAPIView,ListCreateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError as DRFValidationError
from django.db.models import Prefetch, Q, Count

from .models import DiscussionPanel, DiscussionReply, Reaction
from .serializers import DiscussionCreateSerializer,DiscussionReadSerializer,DiscussionUpdateSerializer,ReplyCreateSerializer,ReplyReadSerializer,ReactionSerializer
from .permissions import CanCreateDiscussion, CanAccessDiscussion, IsOwner
from utils.pagination import StandardPagination
from utils.comment_cursor import (
    apply_comment_cursor_filter,
    collect_discussion_reply_tree_ids,
    cursor_paginated_comment_response,
    parse_limit,
)


# =====================================================
# DISCUSSION
# =====================================================

class DiscussionCreateView(CreateAPIView):
    serializer_class = DiscussionCreateSerializer
    permission_classes = [CanCreateDiscussion]


class DiscussionListView(ListAPIView):
    serializer_class = DiscussionReadSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPagination

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["omit_nested_replies"] = True
        return ctx

    def get_serializer_context_for_page(self, page_objects):
        ctx = self.get_serializer_context()
        pks = [obj.pk for obj in page_objects]
        if self.request.user.is_authenticated and pks:
            ctx["liked_topic_ids"] = set(
                Reaction.objects.filter(
                    user=self.request.user,
                    topic_id__in=pks,
                    reply__isnull=True,
                ).values_list("topic_id", flat=True)
            )
        else:
            ctx["liked_topic_ids"] = set()
        return ctx

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(
                page,
                many=True,
                context=self.get_serializer_context_for_page(page),
            )
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(
            queryset,
            many=True,
            context=self.get_serializer_context_for_page(queryset),
        )
        return Response(serializer.data)

    def get_queryset(self):
        user = self.request.user

        qs = DiscussionPanel.objects.all()

        visibility_filter = Q(visibility="public")

        if user.role == "community":
            visibility_filter |= Q(community=user)

        elif user.role == "student":
            membership = getattr(user, "membership", None)
            if membership:
                visibility_filter |= Q(community=membership.community)

        qs = qs.filter(visibility_filter)

        community_id = self.request.query_params.get("community_id")
        if community_id:
            qs = qs.filter(community_id=community_id)

        return (
            qs.select_related("created_by", "community", "created_by__membership__community")
            .annotate(
                _reply_count_total=Count("replies", distinct=True),
                _topic_reaction_count_total=Count("reactions", distinct=True),
            )
            .order_by("-is_pinned", "-created_at")
        )

class DiscussionDetailView(RetrieveAPIView):
    serializer_class = DiscussionReadSerializer
    permission_classes = [IsAuthenticated, CanAccessDiscussion]

    def get_queryset(self):
        # Replies are loaded by ReplyListView (cursor API). Avoid deep prefetch + nested serialization here.
        return (
            DiscussionPanel.objects.select_related("created_by", "community")
            .prefetch_related("reactions")
            .annotate(_reply_count_total=Count("replies"))
        )

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["omit_nested_replies"] = True
        return ctx


class DiscussionUpdateView(UpdateAPIView):
    queryset = DiscussionPanel.objects.all()
    serializer_class = DiscussionUpdateSerializer
    permission_classes = [IsOwner]


class DiscussionDeleteView(DestroyAPIView):
    queryset = DiscussionPanel.objects.all()
    permission_classes = [IsOwner]


# =====================================================
# REPLY
# =====================================================

class ReplyCreateView(CreateAPIView):
    serializer_class = ReplyCreateSerializer
    permission_classes = [IsAuthenticated]
    def perform_create(self, serializer):
        topic = serializer.validated_data["topic"]

        permission = CanAccessDiscussion()
        if not permission.has_object_permission(self.request, self, topic):
            
            raise PermissionDenied("You cannot reply to this discussion.")

        serializer.save(created_by=self.request.user)



class ReplyUpdateView(UpdateAPIView):
    queryset = DiscussionReply.objects.all()
    serializer_class = ReplyCreateSerializer
    permission_classes = [IsAuthenticated, IsOwner]



class ReplyDeleteView(DestroyAPIView):
    queryset = DiscussionReply.objects.all()
    permission_classes = [IsAuthenticated, IsOwner]

class ReplyListView(APIView):
    """
    Cursor-based list: ?topic_id=&cursor=&limit=22
    Response: { comments, next_cursor, has_more } — same envelope as post comments.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        topic_id = request.query_params.get("topic_id")
        if not topic_id:
            return Response({"comments": [], "next_cursor": None, "has_more": False})

        limit = parse_limit(request.query_params.get("limit"), default=12)
        cursor = request.query_params.get("cursor") or None

        try:
            grandchild_qs = (
                DiscussionReply.objects.select_related("created_by", "created_by__membership__community")
                .prefetch_related("reactions")
                .order_by("-created_at", "-id")
            )
            child_qs = (
                DiscussionReply.objects.select_related("created_by", "created_by__membership__community")
                .prefetch_related(Prefetch("children", queryset=grandchild_qs), "reactions")
                .order_by("-created_at", "-id")
            )
            qs = (
                DiscussionReply.objects.filter(topic_id=topic_id, parent_reply__isnull=True)
                .select_related("created_by", "topic", "created_by__membership__community")
                .prefetch_related(Prefetch("children", queryset=child_qs), "reactions")
                .order_by("-created_at", "-id")
            )
            qs = apply_comment_cursor_filter(qs, cursor)

            def like_context(page_objs, req):
                if not req.user.is_authenticated or not page_objs:
                    return {}
                ids = collect_discussion_reply_tree_ids(page_objs)
                if not ids:
                    return {}
                return {
                    "liked_reply_ids": set(
                        Reaction.objects.filter(user=req.user, reply_id__in=ids).values_list(
                            "reply_id", flat=True
                        )
                    )
                }

            return cursor_paginated_comment_response(
                qs,
                ReplyReadSerializer,
                request,
                limit=limit,
                extra_context_callback=like_context,
            )
        except DRFValidationError as e:
            return Response({"detail": e.detail}, status=400)



# =====================================================
# REACTION (toggle)
# =====================================================

class ReactionCreateView(CreateAPIView):
    serializer_class = ReactionSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Check permissions early
        topic = serializer.validated_data.get("topic")
        reply = serializer.validated_data.get("reply")
        target = topic if topic else (reply.topic if reply else None)
        
        if not target:
            return Response({"error": "Topic or Reply is required."}, status=400)

        permission = CanAccessDiscussion()
        if not permission.has_object_permission(self.request, self, target):
            raise PermissionDenied("You cannot react here.")

        instance = serializer.save()
        
        if instance is None:
            # This means it was toggled off (deleted)
            return Response({"message": "Reaction removed"}, status=200)
            
        return Response(serializer.data, status=201)

    def perform_create(self, serializer):
        # Already handled in create for toggle logic
        pass



