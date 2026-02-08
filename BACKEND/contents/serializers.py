
from rest_framework.serializers import ModelSerializer, ValidationError, CharField, ImageField, SerializerMethodField
from django.contrib.auth import get_user_model
from .models import Announcement
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
