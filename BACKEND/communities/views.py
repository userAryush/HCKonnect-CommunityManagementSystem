from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated
from .models import CommunityMembership
from .serializers import CommunityMembershipCreateSerializer,CommunityMemberListSerializer,CommunityListSerializer
from django.contrib.auth import get_user_model

User = get_user_model()



class AddCommunityMemberView(CreateAPIView):
    serializer_class = CommunityMembershipCreateSerializer
    permission_classes = [IsAuthenticated]


class CommunityMemberListView(ListAPIView):
    serializer_class = CommunityMemberListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role != "community":
            return CommunityMembership.objects.none()

        return CommunityMembership.objects.filter(
            community=user
        ).select_related("user")



class CommunityListView(ListAPIView):
    serializer_class = CommunityListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(
            role="community",
            status="active"
        ).order_by("community_name")
