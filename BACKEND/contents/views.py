from rest_framework.generics import CreateAPIView, ListAPIView, UpdateAPIView, DestroyAPIView, RetrieveAPIView, RetrieveUpdateDestroyAPIView, GenericAPIView
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError as DRFValidationError
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
from django.db.models import Prefetch, Count
from .permissions import CanCreateCommunityContent, CanEditContent, IsPostOwnerOrAdmin
from .serializers import PostCommentReadSerializer, PostCommentCreateSerializer
from rest_framework.response import Response
from utils.pagination import StandardPagination
from utils.comment_cursor import (
    apply_comment_cursor_filter,
    collect_post_comment_tree_ids,
    cursor_paginated_comment_response,
    parse_limit,
)
from discussion.models import DiscussionPanel
from discussion.serializers import DiscussionReadSerializer
from events.models import Event
from events.serializers import EventSerializer
from communities.models import CommunityVacancy
from communities.serializers import CommunityVacancySerializer


User = get_user_model()
# Create your views here.
class FeedPagination(StandardPagination):
    page_size = 20


class FeedListView(GenericAPIView):
    permission_classes = [AllowAny]
    pagination_class = FeedPagination

    def get(self, request, *args, **kwargs):
        content_type = request.query_params.get("type", "all")
        user = request.user
        items = []

        if content_type in {"all", "announcement"}:
            announcements_qs = Announcement.objects.filter(visibility="public")
            if user.is_authenticated:
                if user.role == "community":
                    announcements_qs = announcements_qs | Announcement.objects.filter(visibility="private", community=user)
                elif user.role == "student":
                    membership = getattr(user, "membership", None)
                    if membership:
                        announcements_qs = announcements_qs | Announcement.objects.filter(
                            visibility="private", community=membership.community
                        )

            announcements = AnnouncementReadSerializer(
                announcements_qs.select_related("community").distinct(),
                many=True,
                context={"request": request},
            ).data
            for item in announcements:
                item["type"] = "announcement"
            items.extend(announcements)

        if content_type in {"all", "post"}:
            posts = PostReadSerializer(
                Post.objects.all()
                .select_related("author")
                .prefetch_related("comments", "reactions")
                .annotate(_comment_count_total=Count("comments")),
                many=True,
                context={"request": request},
            ).data
            for item in posts:
                item["type"] = "post"
            items.extend(posts)

        if content_type in {"all", "discussion"}:
            discussions_qs = DiscussionPanel.objects.all()
            visibility_filter = Q(visibility="public")
            if user.is_authenticated:
                if user.role == "community":
                    visibility_filter |= Q(community=user)
                elif user.role == "student":
                    membership = getattr(user, "membership", None)
                    if membership:
                        visibility_filter |= Q(community=membership.community)
            discussions_qs = discussions_qs.filter(visibility_filter)

            discussions = DiscussionReadSerializer(
                discussions_qs.select_related("created_by", "community")
                .prefetch_related("replies")
                .annotate(_reply_count_total=Count("replies")),
                many=True,
                context={"request": request},
            ).data
            for item in discussions:
                item["type"] = "discussion"
            items.extend(discussions)

        if content_type in {"all", "event"}:
            events = EventSerializer(
                Event.objects.all().select_related("community"),
                many=True,
                context={"request": request},
            ).data
            for item in events:
                item["type"] = "event"
            items.extend(events)

        if content_type in {"all", "vacancy"}:
            vacancies_qs = CommunityVacancy.objects.select_related("community").filter(status=CommunityVacancy.STATUS_OPEN)
            vacancies = CommunityVacancySerializer(
                vacancies_qs,
                many=True,
                context={"request": request},
            ).data
            for item in vacancies:
                item["type"] = "vacancy"
            items.extend(vacancies)

        items.sort(key=lambda x: x.get("created_at") or "", reverse=True)
        page = self.paginate_queryset(items)
        return self.get_paginated_response(page)

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
        qs = (
            Post.objects.all()
            .select_related("author")
            .prefetch_related("comments", "reactions")
            .annotate(_comment_count_total=Count("comments"))
        )

        user_id = self.request.query_params.get('user_id')

        if user_id:
            return qs.filter(author_id=user_id).order_by('-is_pinned', '-created_at')

        return qs.order_by('-created_at')

class PostDetailView(RetrieveAPIView):
    serializer_class = PostReadSerializer

    def get_queryset(self):
        # Comments load via PostCommentListView (cursor). Skip embedding + comments prefetch here.
        return (
            Post.objects.all()
            .select_related("author")
            .prefetch_related("reactions")
            .annotate(_comment_count_total=Count("comments"))
        )

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["omit_nested_comments"] = True
        return ctx


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

class PostCommentListView(APIView):
    """
    Cursor-based list: ?post_id=&cursor=&limit=22
    Response: { comments, next_cursor, has_more } — ordered by -created_at, -id.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        post_id = request.query_params.get("post_id")
        if not post_id:
            return Response({"comments": [], "next_cursor": None, "has_more": False})

        limit = parse_limit(request.query_params.get("limit"), default=22)
        cursor = request.query_params.get("cursor") or None

        try:
            grandchild_qs = (
                PostComment.objects.select_related("author", "author__membership__community")
                .prefetch_related("reactions")
                .order_by("-created_at", "-id")
            )
            child_qs = (
                PostComment.objects.select_related("author", "author__membership__community")
                .prefetch_related(Prefetch("replies", queryset=grandchild_qs), "reactions")
                .order_by("-created_at", "-id")
            )
            qs = (
                PostComment.objects.filter(post_id=post_id, parent_comment__isnull=True)
                .select_related("author", "author__membership__community")
                .prefetch_related(Prefetch("replies", queryset=child_qs), "reactions")
                .order_by("-created_at", "-id")
            )
            qs = apply_comment_cursor_filter(qs, cursor)

            def post_comment_like_context(page_objs, req):
                if not req.user.is_authenticated or not page_objs:
                    return {}
                ids = collect_post_comment_tree_ids(page_objs)
                if not ids:
                    return {}
                return {
                    "liked_comment_ids": set(
                        PostReaction.objects.filter(user=req.user, comment_id__in=ids).values_list(
                            "comment_id", flat=True
                        )
                    )
                }

            return cursor_paginated_comment_response(
                qs,
                PostCommentReadSerializer,
                request,
                limit=limit,
                extra_context_callback=post_comment_like_context,
            )
        except DRFValidationError as e:
            return Response({"detail": e.detail}, status=400)

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