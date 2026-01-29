from rest_framework.serializers import ModelSerializer, PrimaryKeyRelatedField, ValidationError, CharField, EmailField, ImageField, IntegerField, SerializerMethodField, DateTimeField, UUIDField
from django.contrib.auth import get_user_model
from .models import CommunityMembership,CommunityVacancy,Announcement,VacancyApplication
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

        if not user.is_authenticated:
            raise ValidationError("Authentication required.")

        if user.role == "community":
            return data

        if user.role == "student" and user.memberships.filter(role="representative").exists():
            return data

        raise ValidationError("You do not have permission to manage vacancies.")

    def create(self, validated_data):
        user = self.context["request"].user

        if user.role == "community":
            community = user
        else:
            # SAFE because of one-community-per-representative rule
            community = user.memberships.get(role="representative").community

        return CommunityVacancy.objects.create(
            community=community,
            **validated_data
        )

class VacancyApplicationSerializer(ModelSerializer):
    username = CharField(source="user.username", read_only=True)
    community_name = CharField(source="vacancy.community.community_name", read_only=True)

    class Meta:
        model = VacancyApplication
        fields = ["id", "user", "username", "vacancy", "community_name", "resume", "message", "applied_at"]
        read_only_fields = ["id", "username", "community_name", "applied_at"]

    def validate(self, data):
        user = self.context["request"].user
        vacancy = data.get("vacancy")

        # Only students can apply
        if user.role != "student":
            raise ValidationError("Only students can apply to vacancies.")

        # Vacancy must be open
        if not vacancy.is_open:
            raise ValidationError("This vacancy is no longer accepting applications.")

        # Optional: check deadline
        if vacancy.deadline and timezone.now() > vacancy.deadline:
            raise ValidationError("The application deadline has passed.")

        return data

    def create(self, validated_data):
        user = self.context["request"].user
        return VacancyApplication.objects.create(user=user, **validated_data)


class CommunityMembershipCreateSerializer(ModelSerializer):
    user_id = PrimaryKeyRelatedField(queryset=User.objects.filter(role="student"),source="user")
    created_at = DateTimeField(read_only=True)

    class Meta:
        model = CommunityMembership
        fields = ["user_id", "role", "created_at"]

    def validate(self, data):
        request_user = self.context["request"].user
        user_to_add = data["user"]
        role = data.get("role", "member")

        # 🔒 Only community accounts can add members
        if request_user.role != "community":
            raise ValidationError("Only community accounts can add members.")

        # 🚫 Prevent duplicate membership in the same community
        if CommunityMembership.objects.filter(user=user_to_add, community=request_user).exists():
            raise ValidationError("This student is already a member of this community.")

        # 🌐 Prevent membership in multiple communities
        if CommunityMembership.objects.filter(user=user_to_add).exists():
            raise ValidationError("This student already belongs to another community.")

        # 🧱 Option A rule: one representative per user
        if role == "representative":
            if CommunityMembership.objects.filter(user=user_to_add,role="representative").exists():
                raise ValidationError("A user can only be a representative of one community.")

        return data

    def create(self, validated_data):
        request_user = self.context["request"].user

        return CommunityMembership.objects.create(community=request_user,**validated_data)


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

# list of communities
class CommunityListSerializer(ModelSerializer):
    member_count = IntegerField(source="members.count", read_only=True)

    class Meta:
        model = User
        fields = ["id","community_name","community_description","community_logo","community_tag","member_count"]
        
# community account dashboard
class CommunityDashboardSerializer(ModelSerializer):
    member_count = IntegerField(source="members.count", read_only=True)
    is_community_owner = SerializerMethodField()

    class Meta:
        model = User
        fields = ["id","community_name","community_description","community_logo","member_count","is_community_owner"]

    def get_is_community_owner(self, obj):
        return obj.role == "community"


# announcements serializers

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

        return Announcement.objects.create(community=community,created_by_user=created_by_user,**validated_data)

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
    
    

class StudentListSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]