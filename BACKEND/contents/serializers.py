
from rest_framework.serializers import ModelSerializer, ValidationError, CharField, ImageField, SerializerMethodField
from django.contrib.auth import get_user_model
from .models import Announcement, Post, PostComment, PostReaction, Resource
from django.utils.timesince import timesince
from communities.platform import is_platform_community, enforce_public_visibility, get_content_community
from utils.description_limits import validate_description_length, validate_resource_description_length
from utils.comment_limits import validate_comment_length
from .resource_utils import build_resource_file_url, extension_from_name, resource_download_url

User = get_user_model()

# announcements serializers

class AnnouncementCreateSerializer(ModelSerializer):
    class Meta:
        model = Announcement
        fields = ["title", "description", "image", "visibility"]

    def validate_description(self, value):
        return validate_description_length(value, "Description")

    def validate(self, data):
        user = self.context["request"].user
        community = get_content_community(user)
        if not community:
            raise ValidationError("Unauthorized role.")
        visibility = data.get("visibility", "public")
        enforce_public_visibility(community, visibility)
        if is_platform_community(community):
            data["visibility"] = "public"
        return data

    def create(self, validated_data):
        user = self.context["request"].user

        if user.role == "community":
            community = user
            created_by_user = None
        elif user.role == "student":
            membership = getattr(user, 'membership', None)
            if not membership or membership.role != "representative":
                raise ValidationError("Only community representatives can post announcements.")
            community = membership.community
            created_by_user = user
        else:
            raise ValidationError("Unauthorized role.")

        return Announcement.objects.create(community=community, created_by_user=created_by_user, **validated_data)

class AnnouncementReadSerializer(ModelSerializer):
    community_name = CharField(source="community.community_name", read_only=True)
    community_logo = ImageField(source="community.community_logo", read_only=True)
    uploaded_by = SerializerMethodField() # serializermethodfield tells that value comes from custom method in this serializer
    time_since_posted = SerializerMethodField()

    class Meta:
        model = Announcement
        fields = ["id","community","title","description","image","community_name","community_logo","uploaded_by","time_since_posted","created_at","visibility"]

    def get_uploaded_by(self, obj):
        if obj.created_by_user:
            membership = getattr(obj.created_by_user, 'membership', None)
            role = getattr(membership, "role", "Member") if membership else "Member"
            return f"{obj.created_by_user.username} ({role})" # Aryush (representative)
        return "Community Admin"


    def get_time_since_posted(self, obj):
        time_str = timesince(obj.created_at)
        if "0 minutes" in time_str:
            return "Just now"
        return f"{time_str} ago"

# Separate update to avoid changing created_At and community data.    
class AnnouncementUpdateSerializer(ModelSerializer):
    class Meta:
        model = Announcement
        fields = ["title", "description", "image", "visibility"]

    def validate_description(self, value):
        return validate_description_length(value, "Description")

    def validate(self, data):
        community = self.instance.community
        visibility = data.get("visibility", self.instance.visibility)
        enforce_public_visibility(community, visibility)
        if is_platform_community(community):
            data["visibility"] = "public"
        return data





class PostCommentReadSerializer(ModelSerializer):
    def validate_content(self, value):
        return validate_comment_length(value, "Comment")

    time_ago = SerializerMethodField()
    author_name = SerializerMethodField()
    author_role = SerializerMethodField()
    author_image = SerializerMethodField()
    author_community = SerializerMethodField()
    user_has_liked = SerializerMethodField()
    replies = SerializerMethodField()

    class Meta:
        model = PostComment
        fields = ["id", "post", "parent_comment", "content", "author", "author_name", "author_role", "author_image", "author_community", "time_ago", "user_has_liked", "replies", "created_at", "updated_at"]

    def get_replies(self, obj):
        replies = PostComment.objects.filter(parent_comment=obj).order_by("-created_at")
        return PostCommentReadSerializer(replies, many=True, context=self.context).data

    def get_user_has_liked(self, obj):
        user = self.context["request"].user
        if not user.is_authenticated:
            return False
        liked_ids = self.context.get("liked_comment_ids")
        if liked_ids is not None:
            return obj.pk in liked_ids
        return PostReaction.objects.filter(user=user, comment=obj).exists()

    def get_author_name(self, obj):
        user = obj.author
        if not user: return "User"
        if getattr(user, 'role', '') == 'community':
            return getattr(user, 'community_name', '') or user.username
        full_name = f"{getattr(user, 'first_name', '')} {getattr(user, 'last_name', '')}".strip()
        return full_name if full_name else getattr(user, "username", str(user))

    def get_author_role(self, obj):
        return getattr(obj.author, 'role', 'student') if obj.author else 'student'

    def get_author_image(self, obj):
        user = obj.author
        if not user: return None
        if getattr(user, 'role', '') == 'community' and getattr(user, 'community_logo', None):
            request = self.context.get('request')
            return request.build_absolute_uri(user.community_logo.url) if request else user.community_logo.url
        if getattr(user, 'profile_image', None):
            request = self.context.get('request')
            return request.build_absolute_uri(user.profile_image.url) if request else user.profile_image.url
        return None

    def get_author_community(self, obj):
        user = obj.author
        if not user: return ''
        if getattr(user, 'role', '') == 'community':
            return getattr(user, 'community_name', '')
        if hasattr(user, 'membership') and getattr(user.membership, 'community', None):
            return user.membership.community.community_name
        return ''

    def get_time_ago(self, obj):
        return timesince(obj.created_at) + " ago"
    
class PostReadSerializer(ModelSerializer):
    comments = SerializerMethodField()
    # Must not use source="comments.count": with prefetch_related, .count() uses cache length only.
    comment_count = SerializerMethodField()
    reaction_count = SerializerMethodField()
    time_ago = SerializerMethodField()
    user_has_liked = SerializerMethodField()
    author_name = SerializerMethodField()
    author_role = SerializerMethodField()
    author_image = SerializerMethodField()
    author_community = SerializerMethodField()
    author_is_platform_community = SerializerMethodField()

    class Meta:
        model = Post
        fields = "__all__"

    def get_author_name(self, obj):
        user = obj.author
        if not user: return "User"
        if getattr(user, 'role', '') == 'community':
            return getattr(user, 'community_name', '') or user.username
        full_name = f"{getattr(user, 'first_name', '')} {getattr(user, 'last_name', '')}".strip()
        return full_name if full_name else getattr(user, "username", str(user))

    def get_author_role(self, obj):
        return getattr(obj.author, 'role', 'student') if obj.author else 'student'

    def get_author_is_platform_community(self, obj):
        return is_platform_community(obj.author) if obj.author else False

    def get_author_image(self, obj):
        user = obj.author
        if not user: return None
        if getattr(user, 'role', '') == 'community' and getattr(user, 'community_logo', None):
            request = self.context.get('request')
            return request.build_absolute_uri(user.community_logo.url) if request else user.community_logo.url
        if getattr(user, 'profile_image', None):
            request = self.context.get('request')
            return request.build_absolute_uri(user.profile_image.url) if request else user.profile_image.url
        return None

    def get_author_community(self, obj):
        user = obj.author
        if not user: return ''
        if getattr(user, 'role', '') == 'community':
            return getattr(user, 'community_name', '')
        if hasattr(user, 'membership') and getattr(user.membership, 'community', None):
            return user.membership.community.community_name
        return ''

    def get_user_has_liked(self, obj):
        user = self.context["request"].user
        if not user.is_authenticated:
            return False
        liked_ids = self.context.get("liked_post_ids")
        if liked_ids is not None:
            return obj.pk in liked_ids
        return PostReaction.objects.filter(user=user, post=obj, comment__isnull=True).exists()

    def get_reaction_count(self, obj):
        n = getattr(obj, "_reaction_count_total", None)
        if n is not None:
            return n
        return obj.reactions.filter(comment__isnull=True).count()

    def get_comments(self, obj):
        if self.context.get("omit_nested_comments"):
            return []
        comments = obj.comments.filter(parent_comment__isnull=True).order_by("-created_at")[:10]
        return PostCommentReadSerializer(comments, many=True, context=self.context).data

    def get_comment_count(self, obj):
        # Prefer queryset annotation from views (feed/list/detail) to avoid N+1 and prefetch bugs.
        n = getattr(obj, "_comment_count_total", None)
        if n is not None:
            return n
        return PostComment.objects.filter(post_id=obj.pk).count()

    def get_time_ago(self, obj):
        return timesince(obj.created_at) + " ago"

class PostCreateUpdateSerializer(ModelSerializer):
    class Meta:
        model = Post
        fields = ["id", "content", "image", "is_pinned"]

    def validate_content(self, value):
        return validate_description_length(value, "Content")

    def create(self, validated_data):
        validated_data["author"] = self.context["request"].user
        return super().create(validated_data)
    

class PostCommentCreateSerializer(ModelSerializer):
    """
    FIXED: Changed 'topic' to 'post' and 'parent_reply' to 'parent_comment'
    to match the PostComment model fields.
    """
    class Meta:
        model = PostComment
        fields = ["id", "post", "parent_comment", "content"]

    def validate_content(self, value):
        return validate_comment_length(value, "Comment")

    def create(self, validated_data):
        
        validated_data["author"] = self.context["request"].user
        return super().create(validated_data)


class PostReactionSerializer(ModelSerializer):
    class Meta:
        model = PostReaction
        fields = ["id", "post", "comment", "reaction_type"]

    def create(self, validated_data):
        user = self.context["request"].user
        obj, created = PostReaction.objects.get_or_create(
            user=user,
            post=validated_data.get("post"),
            comment=validated_data.get("comment"),
        )
        if not created:
            obj.delete() # Toggle logic
            return None
        return obj
    


# Resource Serializers

class ResourceCreateUpdateSerializer(ModelSerializer):
    class Meta:
        model = Resource
        fields = ["title", "description", "file", "video_url", "visibility", "category"]

    def validate_description(self, value):
        return validate_resource_description_length(value)

    def validate_file(self, value):
        if value:
            # 15MB limit (15 * 1024 * 1024)
            if value.size > 15 * 1024 * 1024:
                raise ValidationError("File size cannot exceed 15MB.")
        return value

    def validate(self, data):
        category = data.get('category')
        file = data.get('file')
        video_url = data.get('video_url')

        if category == 'video':
            if not video_url:
                raise ValidationError({"video_url": "Video URL is required for video category."})
            if file:
                raise ValidationError({"file": "File should not be uploaded for video category (links only)."})
        else:
            if not file and not self.instance: # If creating
                raise ValidationError({"file": "File is required for this category."})
            if video_url:
                raise ValidationError({"video_url": "Video URL is only for video category."})

        user = self.context["request"].user
        community = get_content_community(user)
        if community:
            visibility = data.get("visibility", getattr(self.instance, "visibility", "public"))
            enforce_public_visibility(community, visibility)
            if is_platform_community(community):
                data["visibility"] = "public"

        return data

    def create(self, validated_data):
        user = self.context["request"].user

        if user.role == "community":
            community = user
            created_by_user = None
        elif user.role == "student":
            membership = getattr(user, 'membership', None)
            if not membership or membership.role != "representative":
                raise ValidationError("Only community representatives can post resources.")
            community = membership.community
            created_by_user = user
        else:
            raise ValidationError("Unauthorized role.")

        uploaded = validated_data.get("file")
        if uploaded is not None:
            validated_data["file_size_bytes"] = getattr(uploaded, "size", 0) or 0
            validated_data["original_filename"] = getattr(uploaded, "name", "") or ""

        return Resource.objects.create(community=community, created_by_user=created_by_user, **validated_data)

    def update(self, instance, validated_data):
        uploaded = validated_data.get("file")
        if uploaded is not None:
            validated_data["file_size_bytes"] = getattr(uploaded, "size", 0) or 0
            validated_data["original_filename"] = getattr(uploaded, "name", "") or ""
        return super().update(instance, validated_data)

class ResourceReadSerializer(ModelSerializer):
    community_name = CharField(source="community.community_name", read_only=True)
    community_logo = ImageField(source="community.community_logo", read_only=True)
    author_name = SerializerMethodField()
    time_ago = SerializerMethodField()
    file = SerializerMethodField()
    file_download = SerializerMethodField()
    file_serve_url = SerializerMethodField()
    file_size = SerializerMethodField()
    file_extension = SerializerMethodField()

    class Meta:
        model = Resource
        fields = [
            "id", "community", "title", "description", "file", "file_download", "file_serve_url", "video_url",
            "community_name", "community_logo", "author_name",
            "created_at", "time_ago", "file_size", "file_extension", "visibility", "category"
        ]

    def get_author_name(self, obj):
        try:
            if obj.created_by_user:
                membership = getattr(obj.created_by_user, 'membership', None)
                role = getattr(membership, "role", "Member") if membership else "Member"
                name = f"{obj.created_by_user.first_name} {obj.created_by_user.last_name}".strip() or obj.created_by_user.username
                return f"{name} ({role})"
        except Exception:
            pass
        return "Community Admin"

    def get_time_ago(self, obj):
        try:
            time_str = timesince(obj.created_at)
            if "0 minutes" in time_str:
                return "Just now"
            return f"{time_str} ago"
        except Exception:
            return "Recently"

    def _file_url(self, obj):
        if not obj.file:
            return None
        try:
            request = self.context.get("request")
            url = obj.file.url
            if request and url and url.startswith("/"):
                url = request.build_absolute_uri(url)
            return url
        except Exception:
            return None

    def get_file(self, obj):
        return build_resource_file_url(obj)

    def get_file_download(self, obj):
        return resource_download_url(obj)

    def get_file_serve_url(self, obj):
        request = self.context.get("request")
        if not request or not obj.file:
            return None
        path = f"/contents/resources/{obj.id}/file/"
        return request.build_absolute_uri(path)

    def get_file_size(self, obj):
        return obj.file_size

    def get_file_extension(self, obj):
        ext = obj.file_extension
        if ext:
            return ext
        ext = extension_from_name(obj.original_filename)
        if ext:
            return ext
        try:
            url = obj.file.url if obj.file else ""
            if url and "/resources/" in url and "/image/upload/" in url:
                return "pdf"
        except Exception:
            pass
        return ""
