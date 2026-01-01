from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import CommunityMembership
from datetime import timedelta
from django.utils import timezone


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
        request_user = self.context["request"].user

        if request_user.role != "community":
            raise serializers.ValidationError("Only community accounts can add members.")

        return attrs

    def create(self, validated_data):
        request_user = self.context["request"].user

        # If community account is adding
        if request_user.role == "community":
            community = request_user

        # If leader is adding
        else:
            community = request_user.membership.community

        return CommunityMembership.objects.create(
            community=community,
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
    member_count = serializers.IntegerField(source="members.count", read_only=True)

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

