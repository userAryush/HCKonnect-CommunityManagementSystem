from django.shortcuts import render
from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework.permissions import AllowAny
from communities.permissions import CanCreateCommunityContent
from .serializers import EventCreateSerializer, EventSerializer
from events.models import Event
# Create your views here.
class EventCreateView(CreateAPIView):
    serializer_class = EventCreateSerializer
    permission_classes = [CanCreateCommunityContent]

class EventListView(ListAPIView):
    serializer_class = EventSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        community_id = self.request.query_params.get("community_id")
        qs = Event.objects.all()
        if community_id:
            qs = qs.filter(community_id=community_id)
        return qs