from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Announcement
from .serializers import AnnouncementCreateSerializer, AnnouncementReadSerializer
from django.contrib.auth import get_user_model
from .permissions import CanCreateCommunityContent


User = get_user_model()
# Create your views here.
class AnnouncementCreateView(CreateAPIView):
    serializer_class = AnnouncementCreateSerializer
    permission_classes = [CanCreateCommunityContent]

class AnnouncementListView(ListAPIView):
    serializer_class = AnnouncementReadSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = self.request.user
        
        # 1. Start with the base: Public announcements for everyone
        queryset = Announcement.objects.filter(visibility="public")

        # 2. Add private announcements based on role
        if user.is_authenticated:
            if user.role == "community":
                # Add private posts belonging to THIS community
                private_qs = Announcement.objects.filter(visibility="private", community=user)
                queryset = queryset | private_qs
            
            elif user.role == "student":
                # Add private posts from the student's specific community
                membership = getattr(user, 'membership', None)
                if membership:
                    private_qs = Announcement.objects.filter(visibility="private", community=membership.community)
                    queryset = queryset | private_qs

        # 3. Use .distinct() to prevent duplicates if any overlap occurs
        return queryset.distinct()
