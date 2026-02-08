from django.shortcuts import render
from rest_framework.generics import CreateAPIView, ListAPIView, UpdateAPIView, DestroyAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny
from contents.permissions import CanCreateCommunityContent
from .serializers import EventCreateSerializer, EventSerializer, EventUpdateSerializer, EventRetrieveSerializer
from events.models import Event
from rest_framework.response import Response
from utils.pagination import StandardPagination
from rest_framework_simplejwt.authentication import JWTAuthentication

# Create your views here.
class EventCreateView(CreateAPIView):
    serializer_class = EventCreateSerializer
    permission_classes = [CanCreateCommunityContent]

class EventListView(ListAPIView):
    serializer_class = EventSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardPagination

    def get_queryset(self):
        community_id = self.request.query_params.get("community_id")
        qs = Event.objects.all()
        if community_id:
            qs = qs.filter(community_id=community_id)
        return qs

class EventStatsView(ListAPIView):
    permission_classes = [AllowAny]
    
    def get(self, request, *args, **kwargs):
        from django.utils import timezone
        community_id = request.query_params.get("community_id")
        qs = Event.objects.all()
        if community_id:
            qs = qs.filter(community_id=community_id)

        total_events = qs.count()
        upcoming_events = qs.filter(date__gte=timezone.now().date()).count()
        
        return Response({
            "total_events": total_events,
            "upcoming_events": upcoming_events
        })

class EventRetrieveView(RetrieveAPIView):
    serializer_class = EventRetrieveSerializer
    permission_classes = [AllowAny]
    queryset = Event.objects.select_related("community")


class EventUpdateView(UpdateAPIView):

    serializer_class = EventUpdateSerializer
    permission_classes = [CanCreateCommunityContent]
    queryset = Event.objects.all()
    
class EventDeleteView(DestroyAPIView):

    permission_classes = [CanCreateCommunityContent]
    queryset = Event.objects.all()