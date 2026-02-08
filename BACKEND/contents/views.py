from rest_framework.generics import CreateAPIView, ListAPIView, UpdateAPIView, DestroyAPIView
from rest_framework.permissions import AllowAny
from .models import Announcement
from .serializers import AnnouncementCreateSerializer, AnnouncementReadSerializer, AnnouncementUpdateSerializer
from django.contrib.auth import get_user_model
from .permissions import CanCreateCommunityContent, CanEditContent
from rest_framework.response import Response
from utils.pagination import StandardPagination


User = get_user_model()
# Create your views here.
class AnnouncementCreateView(CreateAPIView):
    serializer_class = AnnouncementCreateSerializer
    permission_classes = [CanCreateCommunityContent]

class AnnouncementListView(ListAPIView):
    serializer_class = AnnouncementReadSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardPagination

    def get_queryset(self):
        user = self.request.user
        
        # fetching all announcement that is 'public'
        queryset = Announcement.objects.filter(visibility="public")

        # now go on to see if he should see private announcemnt
        if user.is_authenticated:
            if user.role == "community":
                
                private_qs = Announcement.objects.filter(visibility="private", community=user)
                queryset = queryset | private_qs  # shows both public and private 
            
            elif user.role == "student":
                
                membership = getattr(user, 'membership', None)
                if membership:
                    private_qs = Announcement.objects.filter(visibility="private", community=membership.community)
                    queryset = queryset | private_qs

        queryset = queryset.select_related("community").distinct() #distinct prevents from showing duplicates if there is same post in private and public
        
        community_id = self.request.query_params.get("community_id")
        if community_id:
            queryset = queryset.filter(community_id=community_id)
            
        return queryset

class AnnouncementStatsView(ListAPIView):
    permission_classes = [AllowAny]
    
    def get(self, request, *args, **kwargs):
        qs = Announcement.objects.all()
        community_id = request.query_params.get("community_id")
        if community_id:
            qs = qs.filter(community_id=community_id)

        total_announcements = qs.count()
        return Response({
            "total_announcements": total_announcements
        })

class AnnouncementUpdateView(UpdateAPIView):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementUpdateSerializer
    permission_classes = [CanEditContent]

# Delete announcement
class AnnouncementDeleteView(DestroyAPIView):
    queryset = Announcement.objects.all()
    permission_classes = [CanEditContent]