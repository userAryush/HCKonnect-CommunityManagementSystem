from rest_framework import serializers
from .models import DiscussionPanel, DiscussionReply, Reaction
from django.utils.timesince import timesince





# -----------------------
# DISCUSSION CREATE
# -----------------------
class DiscussionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiscussionPanel
        fields = [
            "id",
            "topic",
            "content",
            "community",
            "visibility",
            "is_pinned",
        ]

    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)


# -----------------------
# DISCUSSION READ
# -----------------------
class ReplyReadSerializer(serializers.ModelSerializer):
    time_ago = serializers.SerializerMethodField()
    author_name = serializers.SerializerMethodField()
    author_role = serializers.SerializerMethodField()
    author_image = serializers.SerializerMethodField()
    author_community = serializers.SerializerMethodField()
    user_has_liked = serializers.SerializerMethodField()

    class Meta:
        model = DiscussionReply
        fields = "__all__"

    def get_user_has_liked(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return Reaction.objects.filter(user=user, reply=obj).exists()
        return False

    def get_author_name(self, obj):
        user = obj.created_by
        if not user: return "User"
        if getattr(user, 'role', '') == 'community':
            return getattr(user, 'community_name', '') or user.username
        full_name = f"{getattr(user, 'first_name', '')} {getattr(user, 'last_name', '')}".strip()
        return full_name if full_name else getattr(user, "username", str(user))

    def get_author_role(self, obj):
        return getattr(obj.created_by, 'role', 'student') if obj.created_by else 'student'

    def get_author_image(self, obj):
        user = obj.created_by
        if not user: return None
        request = self.context.get('request')
        if getattr(user, 'role', '') == 'community' and getattr(user, 'community_logo', None):
            return request.build_absolute_uri(user.community_logo.url) if request else user.community_logo.url
        if getattr(user, 'profile_image', None):
            return request.build_absolute_uri(user.profile_image.url) if request else user.profile_image.url
        return None

    def get_author_community(self, obj):
        user = obj.created_by
        if not user: return ''
        if getattr(user, 'role', '') == 'community':
            return getattr(user, 'community_name', '')
        if hasattr(user, 'membership') and getattr(user.membership, 'community', None):
            return user.membership.community.community_name
        return ''

    def get_time_ago(self, obj):
        return timesince(obj.created_at) + " ago"


class DiscussionReadSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField()
    reply_count = serializers.IntegerField(source="replies.count", read_only=True)
    reaction_count = serializers.IntegerField(source="reactions.count", read_only=True)
    time_ago = serializers.SerializerMethodField()
    user_has_liked = serializers.SerializerMethodField()
    
    author_name = serializers.SerializerMethodField()
    author_role = serializers.SerializerMethodField()
    author_image = serializers.SerializerMethodField()
    author_community = serializers.SerializerMethodField()
    community_name = serializers.CharField(source="community.community_name", read_only=True)

    class Meta:
        model = DiscussionPanel
        fields = "__all__"

    def get_author_name(self, obj):
        user = obj.created_by
        if not user: return "User"
        if getattr(user, 'role', '') == 'community':
            return getattr(user, 'community_name', '') or user.username
        full_name = f"{getattr(user, 'first_name', '')} {getattr(user, 'last_name', '')}".strip()
        return full_name if full_name else getattr(user, "username", str(user))

    def get_author_role(self, obj):
        return getattr(obj.created_by, 'role', 'student') if obj.created_by else 'student'

    def get_author_image(self, obj):
        user = obj.created_by
        if not user: return None
        request = self.context.get('request')
        if getattr(user, 'role', '') == 'community' and getattr(user, 'community_logo', None):
            return request.build_absolute_uri(user.community_logo.url) if request else user.community_logo.url
        if getattr(user, 'profile_image', None):
            return request.build_absolute_uri(user.profile_image.url) if request else user.profile_image.url
        return None

    def get_author_community(self, obj):
        user = obj.created_by
        if not user: return ''
        if getattr(user, 'role', '') == 'community':
            return getattr(user, 'community_name', '')
        if hasattr(user, 'membership') and getattr(user.membership, 'community', None):
            return user.membership.community.community_name
        return ''

    def get_user_has_liked(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return Reaction.objects.filter(user=user, topic=obj).exists()
        return False

    def get_time_ago(self, obj):
        if not obj.created_at:
             return ""
        return timesince(obj.created_at) + " ago"

    def get_replies(self, obj):
        replies = obj.replies.filter(parent_reply__isnull=True).order_by("-created_at")[:10]
        return ReplyReadSerializer(replies, many=True, context=self.context).data


# -----------------------
# DISCUSSION UPDATE
# -----------------------
class DiscussionUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiscussionPanel
        fields = ["topic", "content", "visibility", "is_pinned"]


# -----------------------
# REPLY
# -----------------------
class ReplyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiscussionReply
        fields = ["id", "topic", "parent_reply", "reply_content"]

    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)


# -----------------------
# REACTION (toggle)
# -----------------------
class ReactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reaction
        fields = ["id", "topic", "reply"]

    def create(self, validated_data):
        user = self.context["request"].user

        obj, created = Reaction.objects.get_or_create(
            user=user,
            topic=validated_data.get("topic"),
            reply=validated_data.get("reply"),
        )

        if not created:
            obj.delete()  # toggle unlike
            return None

        return obj

