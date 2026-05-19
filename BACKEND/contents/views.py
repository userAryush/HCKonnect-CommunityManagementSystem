from rest_framework.generics import CreateAPIView, ListAPIView, UpdateAPIView, DestroyAPIView, RetrieveAPIView, RetrieveUpdateDestroyAPIView, GenericAPIView
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError as DRFValidationError
from .models import Announcement, Post, PostComment, PostReaction, Resource
from services.cache import invalidate_community_page_caches, invalidate_post_caches
from services.cache.community_page_cache import (
    build_paginated_list_payload,
    dashboard_page_params_match,
    get_cached_community_page,
)
from .feed_cache import apply_user_likes_to_feed, get_cached_community_feed
from services.cache.cache_trace import log_uncached_fetch
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
        community_id = request.query_params.get("community_id")

        if not community_id and content_type == "all":
            from .feed_summary import _fetch_timeline_page

            try:
                page = max(int(request.query_params.get("page", "1")), 1)
                page_size = max(min(int(request.query_params.get("page_size", "20")), 100), 1)
            except (TypeError, ValueError):
                page, page_size = 1, 20
            # Redis key: user_feed:timeline:u{user_id}:p{page}:ps{page_size}
            return Response(_fetch_timeline_page(request, page, page_size))

        if community_id and content_type == "all":
            cached_items = get_cached_community_feed(
                community_id,
                lambda: self._build_feed_items(request, community_id, content_type),
                request=request,
            )
            items = apply_user_likes_to_feed(cached_items, request.user)
            page = self.paginate_queryset(items)
            return self.get_paginated_response(page)

        log_uncached_fetch(
            "community_feed",
            community_id=community_id or "none",
            type=content_type,
            page=request.query_params.get("page", "1"),
            page_size=request.query_params.get("page_size", "20"),
            reason="cache_disabled",
        )
        items = self._build_feed_items(request, community_id, content_type)
        page = self.paginate_queryset(items)
        return self.get_paginated_response(page)

    def _build_feed_items(self, request, community_id, content_type):
        user = request.user
        items = []

        if content_type in {"all", "announcement"}:
            announcements_qs = Announcement.objects.filter(visibility="public")
            if user.is_authenticated:
                if user.role == "community":
                    announcements_qs = announcements_qs | Announcement.objects.filter(
                        visibility="private", community=user
                    )
                elif user.role == "student":
                    membership = getattr(user, "membership", None)
                    if membership:
                        announcements_qs = announcements_qs | Announcement.objects.filter(
                            visibility="private", community=membership.community
                        )
            if community_id:
                announcements_qs = announcements_qs.filter(community_id=community_id)

            announcements = AnnouncementReadSerializer(
                announcements_qs.select_related("community", "created_by_user").distinct(),
                many=True,
                context={"request": request},
            ).data
            for item in announcements:
                item["type"] = "announcement"
            items.extend(announcements)

        if content_type in {"all", "post"}:
            posts_qs = (
                Post.objects.all()
                .select_related("author", "author__membership__community")
                .annotate(
                    _comment_count_total=Count("comments", distinct=True),
                    _reaction_count_total=Count("reactions", distinct=True),
                )
            )
            if community_id:
                posts_qs = posts_qs.filter(
                    Q(author_id=community_id)
                    | Q(author__membership__community_id=community_id)
                )

            post_page = list(posts_qs)
            post_context = {"request": request, "omit_nested_comments": True}
            if user.is_authenticated and post_page:
                post_context["liked_post_ids"] = set(
                    PostReaction.objects.filter(
                        user=user,
                        post_id__in=[p.pk for p in post_page],
                        comment__isnull=True,
                    ).values_list("post_id", flat=True)
                )

            posts = PostReadSerializer(
                post_page,
                many=True,
                context=post_context,
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
            if community_id:
                discussions_qs = discussions_qs.filter(community_id=community_id)

            discussions = DiscussionReadSerializer(
                discussions_qs.select_related(
                    "created_by", "community", "created_by__membership__community"
                )
                .annotate(
                    _reply_count_total=Count("replies", distinct=True),
                    _topic_reaction_count_total=Count("reactions", distinct=True),
                ),
                many=True,
                context={"request": request, "omit_nested_replies": True},
            ).data
            for item in discussions:
                item["type"] = "discussion"
            items.extend(discussions)

        if content_type in {"all", "event"}:
            events_qs = Event.objects.all().select_related("community", "created_by")
            if community_id:
                events_qs = events_qs.filter(community_id=community_id)
            events = EventSerializer(
                events_qs,
                many=True,
                context={"request": request},
            ).data
            for item in events:
                item["type"] = "event"
            items.extend(events)

        if content_type in {"all", "vacancy"}:
            vacancies_qs = CommunityVacancy.objects.select_related("community").filter(
                status=CommunityVacancy.STATUS_OPEN
            )
            if community_id:
                vacancies_qs = vacancies_qs.filter(community_id=community_id)
            vacancies = CommunityVacancySerializer(
                vacancies_qs,
                many=True,
                context={"request": request},
            ).data
            for item in vacancies:
                item["type"] = "vacancy"
            items.extend(vacancies)

        items.sort(key=lambda x: x.get("created_at") or "", reverse=True)
        return items

class AnnouncementCreateView(CreateAPIView):
    serializer_class = AnnouncementCreateSerializer
    permission_classes = [CanCreateCommunityContent]

    def perform_create(self, serializer):
        announcement = serializer.save()
        if announcement.community_id:
            invalidate_community_page_caches(announcement.community_id)


class AnnouncementListView(ListAPIView):
    serializer_class = AnnouncementReadSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardPagination

    def list(self, request, *args, **kwargs):
        community_id = request.query_params.get("community_id")
        if community_id and dashboard_page_params_match(request):
            user_id = (
                request.user.id
                if request.user.is_authenticated
                else "anonymous"
            )
            suffix = f"announcements:p1:ps20:u{user_id}"
            data = get_cached_community_page(
                community_id,
                suffix,
                lambda: build_paginated_list_payload(self),
                log_label="announcements",
            )
            return Response(data)
        return super().list(request, *args, **kwargs)

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

    def _build_stats(self, community_id=None):
        qs = Announcement.objects.all()
        if community_id:
            qs = qs.filter(community_id=community_id)
        return {"total_announcements": qs.count()}

    def get(self, request, *args, **kwargs):
        community_id = request.query_params.get("community_id")
        if community_id:
            data = get_cached_community_page(
                community_id,
                "announcements:stats",
                lambda: self._build_stats(community_id),
                log_label="announcements_stats",
            )
            return Response(data)
        return Response(self._build_stats())

class AnnouncementUpdateView(UpdateAPIView):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementUpdateSerializer
    permission_classes = [CanEditContent]

    def perform_update(self, serializer):
        announcement = serializer.save()
        if announcement.community_id:
            invalidate_community_page_caches(announcement.community_id)

# Delete announcement
class AnnouncementDeleteView(DestroyAPIView):
    queryset = Announcement.objects.all()
    permission_classes = [CanEditContent]

    def perform_destroy(self, instance):
        community_id = instance.community_id
        instance.delete()
        if community_id:
            invalidate_community_page_caches(community_id)


class PostCreateView(CreateAPIView):
    serializer_class = PostCreateUpdateSerializer

    def perform_create(self, serializer):
        post = serializer.save()
        invalidate_post_caches(post)


class PostListView(ListAPIView):
    serializer_class = PostReadSerializer
    pagination_class = StandardPagination

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["omit_nested_comments"] = True
        return ctx

    def get_serializer_context_for_page(self, page_objects):
        ctx = self.get_serializer_context()
        pks = [obj.pk for obj in page_objects]
        if self.request.user.is_authenticated and pks:
            ctx["liked_post_ids"] = set(
                PostReaction.objects.filter(
                    user=self.request.user,
                    post_id__in=pks,
                    comment__isnull=True,
                ).values_list("post_id", flat=True)
            )
        else:
            ctx["liked_post_ids"] = set()
        return ctx

    def list(self, request, *args, **kwargs):
        log_uncached_fetch(
            "post_list",
            user_id=request.query_params.get("user_id", "all"),
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
        qs = (
            Post.objects.all()
            .select_related("author", "author__membership__community")
            .annotate(
                _comment_count_total=Count("comments", distinct=True),
                _reaction_count_total=Count("reactions", distinct=True),
            )
        )

        user_id = self.request.query_params.get('user_id')

        if user_id:
            return qs.filter(author_id=user_id).order_by('-is_pinned', '-created_at')

        return qs.order_by('-created_at')

class PostDetailView(RetrieveAPIView):
    serializer_class = PostReadSerializer

    def retrieve(self, request, *args, **kwargs):
        log_uncached_fetch("post_detail", post_id=kwargs.get("pk"))
        return super().retrieve(request, *args, **kwargs)

    def get_queryset(self):
        # Comments load via PostCommentListView (cursor). Skip embedding + comments prefetch here.
        return (
            Post.objects.all()
            .select_related("author", "author__membership__community")
            .prefetch_related("reactions")
            .annotate(
                _comment_count_total=Count("comments", distinct=True),
                _reaction_count_total=Count("reactions", distinct=True),
            )
        )

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["omit_nested_comments"] = True
        return ctx


class PostUpdateDeleteView(RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostCreateUpdateSerializer
    permission_classes = [IsPostOwnerOrAdmin]

    def perform_update(self, serializer):
        post = serializer.save()
        invalidate_post_caches(post)

    def perform_destroy(self, instance):
        invalidate_post_caches(instance)
        instance.delete()

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

        log_uncached_fetch(
            "post_comments",
            post_id=post_id,
            cursor=cursor or "none",
            limit=limit,
        )

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