from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated
from .models import CommunityMembership
from .serializers import CommunityMembershipCreateSerializer,CommunityMemberListSerializer,CommunityListSerializer
from django.contrib.auth import get_user_model
from .permissions import CanAddCommunityMembers

User = get_user_model()


class AddCommunityMemberView(CreateAPIView):
    serializer_class = CommunityMembershipCreateSerializer
    permission_classes = [CanAddCommunityMembers]

class CommunityMemberListView(ListAPIView):
    serializer_class = CommunityMemberListSerializer
    permission_classes = [IsAuthenticated]  # any logged-in user can see

    def get_queryset(self):
        # Only list members of the requested community
        community_id = self.kwargs.get("community_id")  # pass community id via URL
        return CommunityMembership.objects.filter(
            community_id=community_id
        ).select_related("user")

class CommunityListView(ListAPIView):
    serializer_class = CommunityListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(
            role="community",
            status="active"
        ).order_by("community_name")

