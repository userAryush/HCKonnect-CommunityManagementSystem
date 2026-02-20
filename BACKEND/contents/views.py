from rest_framework.generics import CreateAPIView, ListAPIView, UpdateAPIView, DestroyAPIView, RetrieveAPIView, RetrieveUpdateDestroyAPIView
from .models import Announcement, Post, PostComment, PostReaction
from rest_framework.permissions import AllowAny
from .serializers import AnnouncementCreateSerializer, AnnouncementReadSerializer, AnnouncementUpdateSerializer, PostCreateUpdateSerializer, PostReadSerializer, PostReactionSerializer
from .permissions import IsPostOwnerOrAdmin
from django.contrib.auth import get_user_model
from .permissions import CanCreateCommunityContent, CanEditContent, IsPostOwnerOrAdmin
from .serializers import PostCommentReadSerializer, PostCommentCreateSerializer
from rest_framework.response import Response
from utils.pagination import StandardPagination


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