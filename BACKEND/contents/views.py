from rest_framework.generics import CreateAPIView, ListAPIView, UpdateAPIView, DestroyAPIView, RetrieveAPIView, RetrieveUpdateDestroyAPIView
from .models import Announcement, Post, PostComment, PostReaction, Resource
from rest_framework.permissions import AllowAny
from django.db.models import Q
from .serializers import (
    AnnouncementCreateSerializer, AnnouncementReadSerializer, AnnouncementUpdateSerializer, 
    PostCreateUpdateSerializer, PostReadSerializer, PostReactionSerializer,
    ResourceReadSerializer, ResourceCreateUpdateSerializer
)
from .permissions import IsPostOwnerOrAdmin
from django.contrib.auth import get_user_model
from .permissions import CanCreateCommunityContent, CanEditContent, IsPostOwnerOrAdmin
from .serializers import PostCommentReadSerializer, PostCommentCreateSerializer
from rest_framework.response import Response
from utils.pagination import StandardPagination, CommentPagination


User = get_user_model()
# Create your views here.
class AnnouncementCreateView(CreateAPIView):
    serializer_class = AnnouncementCreateSerializer
    permission_classes = [CanCreateCommunityContent]

class AnnouncementListView(ListAPIView):
    serializer_class = AnnouncementReadSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardPagination

    def get_queryset(self):
        user = self.request.user
        
        # fetching all announcement that is 'public'
        queryset = Announcement.objects.filter(visibility="public")

        # now go on to see if he should see private announcemnt
        if user.is_authenticated:
            if user.role == "community":
                
                private_qs = Announcement.objects.filter(visibility="private", community=user)
                queryset = queryset | private_qs  # shows both public and private 
            
            elif user.role == "student":
                
                membership = getattr(user, 'membership', None)
                if membership:
                    private_qs = Announcement.objects.filter(visibility="private", community=membership.community)
                    queryset = queryset | private_qs

        queryset = queryset.select_related("community").distinct() #distinct prevents from showing duplicates if there is same post in private and public
        
        community_id = self.request.query_params.get("community_id")
        if community_id:
            queryset = queryset.filter(community_id=community_id)
            
        return queryset

class AnnouncementStatsView(ListAPIView):
    permission_classes = [AllowAny]
    
    def get(self, request, *args, **kwargs):
        qs = Announcement.objects.all()
        community_id = request.query_params.get("community_id")
        if community_id:
            qs = qs.filter(community_id=community_id)

        total_announcements = qs.count()
        return Response({
            "total_announcements": total_announcements
        })

class AnnouncementUpdateView(UpdateAPIView):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementUpdateSerializer
    permission_classes = [CanEditContent]

# Delete announcement
class AnnouncementDeleteView(DestroyAPIView):
    queryset = Announcement.objects.all()
    permission_classes = [CanEditContent]


class PostCreateView(CreateAPIView):
    serializer_class = PostCreateUpdateSerializer
   

class PostListView(ListAPIView):
    serializer_class = PostReadSerializer
    pagination_class = StandardPagination
 

    def get_queryset(self):
        qs = Post.objects.all().select_related('author').prefetch_related('comments', 'reactions')
        
        user_id = self.request.query_params.get('user_id')
        
        # If viewing a specific user's profile, sort by pinned posts first
        if user_id:
            return qs.filter(author_id=user_id).order_by('-is_pinned', '-created_at')
        
        # Otherwise (General Feed), ignore pinning and just show latest
        return qs.order_by('-created_at')

class PostDetailView(RetrieveAPIView):
    queryset = Post.objects.all()
    serializer_class = PostReadSerializer
    

class PostUpdateDeleteView(RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostCreateUpdateSerializer
    permission_classes = [IsPostOwnerOrAdmin]

class PostReactionToggleView(CreateAPIView):
    serializer_class = PostReactionSerializer
   

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        if instance is None:
            return Response({"message": "Reaction removed"}, status=200)
        return Response(serializer.data, status=201)
    
class PostCommentCreateView(CreateAPIView):
    """
    Logic same as ReplyCreateView. 
    Allows users to comment on a post or reply to an existing comment.
    """
    serializer_class = PostCommentCreateSerializer

    def perform_create(self, serializer):
        # Simply save the author as the current user
        serializer.save(author=self.request.user)

class PostCommentUpdateView(UpdateAPIView):
    """
    Logic same as ReplyUpdateView.
    """
    queryset = PostComment.objects.all()
    serializer_class = PostCommentReadSerializer
    permission_classes = [IsPostOwnerOrAdmin]

class PostCommentDeleteView(DestroyAPIView):
    """
    Logic same as ReplyDeleteView.
    """
    queryset = PostComment.objects.all()
    permission_classes = [IsPostOwnerOrAdmin]

class PostCommentListView(ListAPIView):
    serializer_class = PostCommentReadSerializer
    permission_classes = [AllowAny]
    pagination_class = CommentPagination

    def get_queryset(self):
        post_id = self.request.query_params.get("post_id")
        if not post_id:
            return PostComment.objects.none()
        # Only top-level comments for the specific post
        return PostComment.objects.filter(post_id=post_id, parent_comment__isnull=True).order_by("-created_at")

# Resource Views

class ResourceCreateView(CreateAPIView):
    serializer_class = ResourceCreateUpdateSerializer
    permission_classes = [CanCreateCommunityContent]

class ResourceListView(ListAPIView):
    serializer_class = ResourceReadSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardPagination

    def get_queryset(self):
        user = self.request.user
        
        # Base filter: Public resources
        query = Q(visibility="public")

        if user.is_authenticated:
            if user.role == "community":
                # Resources for this community
                query |= Q(visibility="private", community=user)
            elif user.role == "student":
                # Resources for student's community
                membership = getattr(user, 'membership', None)
                if membership:
                    query |= Q(visibility="private", community=membership.community)

        queryset = Resource.objects.filter(query)

        # Apply community_id filter if provided
        community_id = self.request.query_params.get("community_id")
        if community_id:
            try:
                queryset = queryset.filter(community_id=community_id)
            except Exception:
                pass

        # Optimization and order
        return queryset.select_related("community", "created_by_user")\
                       .prefetch_related("created_by_user__membership")\
                       .distinct()\
                       .order_by("-created_at")

class ResourceUpdateDeleteView(RetrieveUpdateDestroyAPIView):
    queryset = Resource.objects.all()
    serializer_class = ResourceCreateUpdateSerializer
    permission_classes = [CanEditContent]