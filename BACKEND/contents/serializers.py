
from rest_framework.serializers import ModelSerializer, ValidationError, CharField, ImageField, SerializerMethodField, IntegerField
from django.contrib.auth import get_user_model
from .models import Announcement, Post, PostComment, PostReaction
from django.utils.timesince import timesince
 

User = get_user_model()

# announcements serializers

class AnnouncementCreateSerializer(ModelSerializer):
    class Meta:
        model = Announcement
        fields = ["title", "description", "image", "visibility"]

    def create(self, validated_data):
        user = self.context["request"].user # current user

        # Posted by community
        if user.role == "community":
            community = user
            created_by_user = None # because its community itself
        
        # Posted by representative
        elif user.role == "student":
            membership = getattr(user, 'membership', None) # checking if this user has membership
            # Ensure they are a member AND have the representative role
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
            role = getattr(obj.created_by_user.membership, "role", "Member") # tries to get the role, if missing member default
            return f"{obj.created_by_user.username} ({role})" # Aryush (representative)
        return "Community Admin"


    def get_time_since_posted(self, obj):
        return f"{timesince(obj.created_at)} ago"

# Separate update to avoid changing created_At and community data.    
class AnnouncementUpdateSerializer(ModelSerializer):
    class Meta:
        model = Announcement
        fields = ["title", "description", "image", "visibility"]





class PostCommentReadSerializer(ModelSerializer):
    time_ago = SerializerMethodField()
    author_name = SerializerMethodField()
    user_has_liked = SerializerMethodField()
    replies = SerializerMethodField()

    class Meta:
        model = PostComment
        fields = ["id", "post", "parent_comment", "content", "author", "author_name", "time_ago", "user_has_liked", "replies", "created_at"]

    def get_replies(self, obj):
        if obj.parent_comment is None: # Only one level of nesting
            replies = PostComment.objects.filter(parent_comment=obj)
            return PostCommentReadSerializer(replies, many=True, context=self.context).data
        return []

    def get_user_has_liked(self, obj):
        user = self.context['request'].user
        return PostReaction.objects.filter(user=user, comment=obj).exists() if user.is_authenticated else False

    def get_author_name(self, obj):
        user = obj.author
        return f"{user.first_name} {user.last_name}".strip() or user.username

    def get_time_ago(self, obj):
        return timesince(obj.created_at) + " ago"
    
class PostReadSerializer(ModelSerializer):
    comments = SerializerMethodField()
    comment_count = IntegerField(source="comments.count", read_only=True)
    reaction_count = IntegerField(source="reactions.count", read_only=True)
    time_ago = SerializerMethodField()
    user_has_liked = SerializerMethodField()
    author_name = SerializerMethodField()

    class Meta:
        model = Post
        fields = "__all__"

    def get_author_name(self, obj):
        user = obj.author
        return f"{user.first_name} {user.last_name}".strip() or user.username

    def get_user_has_liked(self, obj):
        user = self.context['request'].user
        return PostReaction.objects.filter(user=user, post=obj).exists() if user.is_authenticated else False

    def get_comments(self, obj):
        # Only return top-level comments (those without a parent)
        comments = obj.comments.filter(parent_comment__isnull=True)
        return PostCommentReadSerializer(comments, many=True, context=self.context).data

    def get_time_ago(self, obj):
        return timesince(obj.created_at) + " ago"

class PostCreateUpdateSerializer(ModelSerializer):
    class Meta:
        model = Post
        fields = ["id", "content", "image", "is_pinned"]

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
    

