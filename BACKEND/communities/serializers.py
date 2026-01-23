from rest_framework.serializers import ModelSerializer, PrimaryKeyRelatedField, ValidationError, CharField, EmailField, ImageField, IntegerField, ChoiceField, SerializerMethodField, DateTimeField, UUIDField

from django.contrib.auth import get_user_model
from .models import CommunityMembership,CommunityVacancy,Announcement,Event

from datetime import timedelta
from django.utils import timezone




User = get_user_model()
class CommunityVacancySerializer(ModelSerializer):
    community_id = IntegerField(source="community.id", read_only=True)
    class Meta:
        model = CommunityVacancy
        fields = ["id", "title", "description", "is_open", "community_id"]
        read_only_fields = ["id", "community_id"]

    def validate(self, data):
        user = self.context["request"].user

        # Community account → allowed
        if user.role == "community":
            return data

        # Leader → allowed
        community = self.instance.community if self.instance else self.initial_data.get("community")

        if CommunityMembership.objects.filter(user=user,community=community,role="leader").exists():
            return data


        raise ValidationError("Only community accounts or leaders can manage vacancies.")

    def create(self, validated_data):
        user = self.context["request"].user

        if user.role == "community":
            community = user
        else:
            community = user.membership.community

        return CommunityVacancy.objects.create(
            community=community,
            **validated_data
        )
class MembershipApplicationSerializer(ModelSerializer):
    status = CharField(read_only=True)
    role = CharField(read_only=True)
    community_name = CharField(source="community.community_name", read_only=True)
    community_logo = ImageField(source="community.community_logo", read_only=True)


    class Meta:
        model = CommunityMembership
        fields = ["community", "status", "role"]

    def validate(self, data):
        user = self.context["request"].user
        community = data["community"]

        # Enforce Single Community Rule:
        # Check if user has ANY membership (pending or approved) in ANY community
        if CommunityMembership.objects.filter(user=user).exists():
            raise ValidationError("You can only belong to one community at a time.")

        return data

    def create(self, validated_data):
        return CommunityMembership.objects.create(
            user=self.context["request"].user,
            community=validated_data["community"],
            status="pending",
            role="member"
        )


class MembershipApprovalSerializer(ModelSerializer):
    role = ChoiceField(choices=[("member","Member"),("moderator","Moderator")])
    user_id = IntegerField(source="user.id", read_only=True)

    class Meta:
        model = CommunityMembership
        fields = ["id", "user_id", "role", "status"]

    def update(self, instance, validated_data):
        request_user = self.context["request"].user
        if request_user.role != "community" and not CommunityMembership.objects.filter(user=request_user, community=instance.community, role="leader").exists():
            raise ValidationError("Only community accounts or leaders can approve memberships.")

        instance.role = validated_data["role"]
        instance.status = "approved"
        instance.save()
        return instance


class CommunityMembershipCreateSerializer(ModelSerializer):
    user_id = PrimaryKeyRelatedField(queryset=User.objects.filter(role="student"), source="user")
    created_at = DateTimeField(read_only=True)

    class Meta:
        model = CommunityMembership
        fields = ["user_id", "role", "created_at"]

    def validate(self, data):
        request_user = self.context["request"].user
        user_to_add = data["user"]

        # Prevent duplicate membership
        if CommunityMembership.objects.filter(user=user_to_add, community=request_user.membership.community if request_user.role != "community" else request_user).exists():
            raise ValidationError("This user is already a member of the community.")

        # Permission check
        if request_user.role == "community":
            return data
        if CommunityMembership.objects.filter(user=request_user, role="leader").exists():
            return data
        raise ValidationError("Only community accounts or leaders can add members.")
    
    def create(self, validated_data):
        request_user = self.context["request"].user

        # Determine community
        if request_user.role == "community":
            community = request_user
        else:
            community = request_user.membership.community

        return CommunityMembership.objects.create(
            community=community,
            **validated_data
        )




class CommunityMemberListSerializer(ModelSerializer):
    id = UUIDField(source='pk', read_only=True)
    membership_id = IntegerField(source="id", read_only=True)
    username = CharField(source="user.username", read_only=True)
    email = EmailField(source="user.email", read_only=True)
    profile_image = ImageField(source="user.profile_image", read_only=True)
    join_date = SerializerMethodField()

    class Meta:
        model = CommunityMembership
        fields = ["membership_id", "id", "username", "email", "profile_image", "role", "created_at", "join_date"]

    def get_join_date(self, obj):
        return obj.created_at.strftime("%Y-%m-%d") if obj.created_at else None



        
class CommunityListSerializer(ModelSerializer):
    member_count = IntegerField(source="members.count", read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "community_name",
            "community_description",
            "community_logo",
            "community_tag",
            "member_count",
        ]
class CommunityDashboardSerializer(ModelSerializer):
    member_count = IntegerField(source="members.count", read_only=True)
    is_community_owner = SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "community_name",
            "community_description",
            "community_logo",
            "member_count",
            "is_community_owner",
        ]

    def get_is_community_owner(self, obj):
        return obj.role == "community"

class AnnouncementCreateSerializer(ModelSerializer):
    class Meta:
        model = Announcement
        fields = ["title", "description", "image", "visibility"]

    def create(self, validated_data):
        request = self.context["request"]
        user = request.user

        # Community account posting
        if user.role == "community":
            community = user
            created_by_user = None

        # Student (member, moderator, leader) posting
        elif user.role == "student":
            # Correctly fetch membership relations (Foreign Key related_name="memberships")
            membership = user.memberships.first() 
            if not membership:
                raise ValidationError("User is not part of any community")
            community = membership.community
            created_by_user = user

        else:
            raise ValidationError("You are not allowed to post announcements")

        return Announcement.objects.create(
            community=community,
            created_by_user=created_by_user,
            **validated_data
        )

class AnnouncementReadSerializer(ModelSerializer):
    community_name = CharField(source="community.community_name", read_only=True)
    community_logo = ImageField(source="community.community_logo", read_only=True)
    uploaded_by = SerializerMethodField()
    time_since_posted = SerializerMethodField()

    class Meta:
        model = Announcement
        fields = [
            "id",
            "title",
            "description",
            "image",
            "community_name",
            "community_logo",
            "uploaded_by",
            "time_since_posted",
            "time_since_posted",
            "created_at",
            "visibility",
        ]

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
    
class StudentListSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]