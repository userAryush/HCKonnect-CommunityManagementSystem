from rest_framework.generics import CreateAPIView,ListAPIView,RetrieveAPIView,UpdateAPIView,DestroyAPIView,ListCreateAPIView
from rest_framework.response import Response

from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.db.models import Prefetch, Q

from .models import DiscussionPanel, DiscussionReply, Reaction
from .serializers import DiscussionCreateSerializer,DiscussionReadSerializer,DiscussionUpdateSerializer,ReplyCreateSerializer,ReactionSerializer
from .permissions import CanCreateDiscussion, CanAccessDiscussion, IsOwner
from utils.pagination import StandardPagination, CommentPagination


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

        return qs.select_related("created_by","community").prefetch_related(Prefetch("replies",queryset=DiscussionReply.objects.select_related("created_by")))

class DiscussionDetailView(RetrieveAPIView):
    queryset = DiscussionPanel.objects.all()
    serializer_class = DiscussionReadSerializer
    permission_classes = [IsAuthenticated, CanAccessDiscussion]


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

class ReplyListView(ListAPIView):
    serializer_class = ReplyCreateSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = CommentPagination

    def get_queryset(self):
        topic_id = self.request.query_params.get("topic_id")
        if not topic_id:
            return DiscussionReply.objects.none()
        
        # Only top-level replies (those without a parent_reply)
        return DiscussionReply.objects.filter(topic_id=topic_id, parent_reply__isnull=True).order_by("-created_at")



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



