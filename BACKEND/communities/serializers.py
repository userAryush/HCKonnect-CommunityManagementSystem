from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import CommunityMembership

User = get_user_model()

class CommunityMembershipCreateSerializer(serializers.ModelSerializer):
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role="student"),
        source="user"
    )

    class Meta:
        model = CommunityMembership
        fields = ["user_id", "role"]

    def validate(self, attrs):
        community = self.context["request"].user
        user = attrs["user"]

        if community.role != "community":
            raise serializers.ValidationError("Only community accounts can add members.")

        if CommunityMembership.objects.filter(user=user, community=community).exists():
            raise serializers.ValidationError("User is already a member of this community.")

        return attrs

    def create(self, validated_data):
        return CommunityMembership.objects.create(
            community=self.context["request"].user,
            **validated_data
        )


class CommunityMemberListSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    profile_image = serializers.ImageField(source="user.profile_image", read_only=True)

    class Meta:
        model = CommunityMembership
        fields = ["id", "username", "email", "profile_image", "role", "created_at"]

        
class CommunityListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id","community_name","community_description","community_logo","community_tag"]

