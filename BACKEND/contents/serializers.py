
from rest_framework.serializers import ModelSerializer, ValidationError, CharField, ImageField, SerializerMethodField
from django.contrib.auth import get_user_model
from .models import Announcement
from datetime import timedelta
from django.utils import timezone
User = get_user_model()

# announcements serializers

class AnnouncementCreateSerializer(ModelSerializer):
    class Meta:
        model = Announcement
        fields = ["title", "description", "image", "visibility"]

    def create(self, validated_data):
        user = self.context["request"].user

        if user.role == "community":
            community = user
            created_by_user = None
        elif user.role == "student":
            membership = getattr(user, 'membership', None)
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
    uploaded_by = SerializerMethodField()
    time_since_posted = SerializerMethodField()

    class Meta:
        model = Announcement
        fields = ["id","title","description","image","community_name","community_logo","uploaded_by","time_since_posted","time_since_posted","created_at","visibility"]

    def get_uploaded_by(self, obj):
        if obj.created_by_user:
            role = getattr(obj.created_by_user.membership, "role", "Member")
            return f"{obj.created_by_user.username} ({role})"
        return "Community Admin"


    def get_time_since_posted(self, obj):
        now = timezone.now()
        diff = now - obj.created_at

        if diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f"{minutes} minutes ago"

        if diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f"{hours} hours ago"

        if diff < timedelta(days=7):
            return f"{diff.days} days ago"

        weeks = diff.days // 7
        return f"{weeks} weeks ago"
    