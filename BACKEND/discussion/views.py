from rest_framework.generics import CreateAPIView,ListAPIView,RetrieveAPIView,UpdateAPIView,DestroyAPIView,ListCreateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError as DRFValidationError
from django.db.models import Q, Count

from .models import DiscussionPanel, DiscussionReply, Reaction
from .serializers import DiscussionCreateSerializer,DiscussionReadSerializer,DiscussionUpdateSerializer,ReplyCreateSerializer,ReplyReadSerializer,ReactionSerializer
from .permissions import CanCreateDiscussion, CanAccessDiscussion, IsOwner
from services.cache import invalidate_community_page_caches, invalidate_discussion_reply_caches
from .reply_cache import (
    apply_user_likes_to_replies,
    get_cached_discussion_replies,
    paginate_serialized_replies,
)
from .thread_summary import get_cached_discussion_detail
from utils.pagination import StandardPagination
from utils.comment_cursor import parse_limit
from services.cache.cache_trace import log_uncached_fetch


# =====================================================
# DISCUSSION
# =====================================================

class DiscussionCreateView(CreateAPIView):
    serializer_class = DiscussionCreateSerializer
    permission_classes = [CanCreateDiscussion]

    def perform_create(self, serializer):
        discussion = serializer.save()
        if discussion.community_id:
            invalidate_community_page_caches(discussion.community_id)


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
        log_uncached_fetch(
            "discussion_list",
            community_id=request.query_params.get("community_id", "all"),
            page=request.query_params.get("page", "1"),
            page_size=request.query_params.get("page_size", "12"),
        )
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

    def retrieve(self, request, *args, **kwargs):
        topic_id = kwargs.get("pk")
        data = get_cached_discussion_detail(request, topic_id)
        return Response(data)

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

        reply = serializer.save(created_by=self.request.user)
        invalidate_discussion_reply_caches(reply)


class ReplyUpdateView(UpdateAPIView):
    queryset = DiscussionReply.objects.all()
    serializer_class = ReplyCreateSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def perform_update(self, serializer):
        reply = serializer.save()
        invalidate_discussion_reply_caches(reply)


class ReplyDeleteView(DestroyAPIView):
    queryset = DiscussionReply.objects.all()
    permission_classes = [IsAuthenticated, IsOwner]

    def perform_destroy(self, instance):
        invalidate_discussion_reply_caches(instance)
        instance.delete()

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

        # Cache trace: discussion_replies (hit/miss/set) logged in reply_cache.get_cached_discussion_replies
        try:
            cached_replies = get_cached_discussion_replies(
                topic_id, request, ReplyReadSerializer
            )
            replies = apply_user_likes_to_replies(cached_replies, request.user)
            page, next_cursor, has_more = paginate_serialized_replies(
                replies, cursor, limit
            )
            return Response(
                {
                    "comments": page,
                    "next_cursor": next_cursor,
                    "has_more": has_more,
                }
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



