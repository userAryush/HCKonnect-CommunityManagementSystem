from rest_framework.serializers import ModelSerializer, PrimaryKeyRelatedField, ValidationError, CharField, EmailField, ImageField, IntegerField, SerializerMethodField, DateTimeField, UUIDField
from django.contrib.auth import get_user_model
from .models import CommunityMembership,CommunityVacancy,VacancyApplication
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

        # 1. Only students can apply
        if user.role != "student":
            raise ValidationError("Only students can apply to vacancies.")

        # 2. EXCLUSIVITY CHECK: Must not be in any community
        # This checks if a membership record exists for this student
        if CommunityMembership.objects.filter(user=user).exists():
            raise ValidationError("You are already a member of a community and cannot apply to new vacancies.")

        # 3. Vacancy must be open and not past deadline
        if not vacancy.is_open:
            raise ValidationError("This vacancy is no longer accepting applications.")
            
        if vacancy.deadline and timezone.now() > vacancy.deadline:
            raise ValidationError("The application deadline has passed.")

        # 4. Prevent double application to the same vacancy
        if VacancyApplication.objects.filter(user=user, vacancy=vacancy).exists():
            raise ValidationError("You have already applied for this vacancy.")

        return data

    def create(self, validated_data):
        user = self.context["request"].user
        return VacancyApplication.objects.create(user=user, **validated_data)


class CommunityMembershipCreateSerializer(ModelSerializer):
    # restricting to users with 'student' role.
    # 'source="user"' ensures that the primary key provided is mapped to the 'user' field in our model.
    
    user_id = PrimaryKeyRelatedField(queryset=User.objects.filter(role="student"),source="user")
    created_at = DateTimeField(read_only=True) # handled by model but we keep it read_only so api user cant change it

    class Meta:
        model = CommunityMembership
        fields = ["user_id", "role", "created_at"]

    def validate(self, data):
        """
        Custom validation logic to enforce the 'One Community per Student' rule and strict role-based access.
        """
        request_user = self.context["request"].user
        user_to_add = data["user"]
        role = data.get("role", "member")

        #                       ROLE HIERARCHY CHECK
        # this is already hndled in permissions but also checking it here
        # It ensures that only a user with the 'community' role can execute this serializer.
        if request_user.role != "community":
            raise ValidationError("Only community accounts can add members.")

        #                       DUPLICATE CHECK (Internal)
        # Prevents the same community from adding the same student twice.
        if CommunityMembership.objects.filter(user=user_to_add, community=request_user).exists():
            raise ValidationError("This student is already a member of your community.")

        #                        EXCLUSIVITY CHECK (System-wide)
        #  A student cannot belong to Community A and Community B.
        # If any membership record exists for this user, block the creation.
        if CommunityMembership.objects.filter(user=user_to_add).exists():
            raise ValidationError("This student already belongs to another community.")

        return data

    def create(self, validated_data):
        """
        The community account doesn't need to 'tell' the API which community to add the student to.
        We automatically use the 'request_user' (the community itself) as the owner.
        """
        request_user = self.context["request"].user
        # This prevents a Community Account from requesting to add a user to a DIFFERENT community.
        return CommunityMembership.objects.create(community=request_user,**validated_data)


class CommunityMemberListSerializer(ModelSerializer):
    # 'source=pk' gives us the UUID of the membership record.
    id = UUIDField(source='pk', read_only=True)
    # We provide the database integer ID as well, just in case the frontend needs it for simple indexing.
    membership_id = IntegerField(source="id", read_only=True)
    #                              RELATIONAL MAPPING
    # These fields 'reach into' the related User model to grab profile info.
    # This saves the frontend from having to make two API calls (one for membership, one for user info).
    username = CharField(source="user.username", read_only=True)
    first_name = CharField(source="user.first_name", read_only=True)
    last_name = CharField(source="user.last_name", read_only=True)
    email = EmailField(source="user.email", read_only=True)
    profile_image = ImageField(source="user.profile_image", read_only=True)
    join_date = SerializerMethodField()

    class Meta:
        model = CommunityMembership
        fields = ["membership_id", "id", "username","first_name", "last_name",  "email", "profile_image", "role", "created_at", "join_date"]

    def get_join_date(self, obj):
        """
        Converts the complex 'created_at' timestamp into a simple YYYY-MM-DD format.
        """
        return obj.created_at.strftime("%Y-%m-%d") if obj.created_at else None

class StudentListSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]
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

