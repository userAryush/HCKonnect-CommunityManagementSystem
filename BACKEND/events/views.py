from rest_framework import viewsets, permissions, status
from rest_framework.generics import ListAPIView, CreateAPIView, UpdateAPIView, DestroyAPIView, GenericAPIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from rest_framework.exceptions import PermissionDenied
from .serializers import (
    EventSerializer, 
    EventUpdateSerializer,
    EventRegistrationSerializer, 
    EventParticipantSerializer,
    AttendanceUpdateSerializer,
    ManualAddParticipantSerializer,
)
from .models import Event, EventRegistration
from communities.permissions import IsCommunityRepresentativeOrReadOnly
from contents.permissions import CanCreateCommunityContent
from utils.pagination import StandardPagination
from django.shortcuts import get_object_or_404
from django.utils import timezone


class IsEventCreator(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        event_id = view.kwargs.get('pk') or view.kwargs.get('event_id')
        event = get_object_or_404(Event, id=event_id)
        
        if request.user.role == 'community':
            return event.community == request.user
        
        membership = getattr(request.user, 'membership', None)
        return membership and membership.role == 'representative' and membership.community == event.community


# --- Generic API Views (used by existing URL patterns) ---

class EventListView(ListAPIView):
    serializer_class = EventSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardPagination

    def get_queryset(self):
        community_id = self.request.query_params.get("community_id")
        qs = Event.objects.all().select_related("community")
        if community_id:
            qs = qs.filter(community_id=community_id)
        return qs


class EventStatsView(ListAPIView):
    permission_classes = [AllowAny]
    
    def get(self, request, *args, **kwargs):
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


class EventCreateView(CreateAPIView):
    serializer_class = EventSerializer
    permission_classes = [CanCreateCommunityContent]


class EventRetrieveView(GenericAPIView):
    """Retrieve a single event with registration status for the current user."""
    serializer_class = EventSerializer
    permission_classes = [AllowAny]
    queryset = Event.objects.select_related("community")

    def get(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class EventUpdateView(UpdateAPIView):
    serializer_class = EventUpdateSerializer
    permission_classes = [CanCreateCommunityContent]
    queryset = Event.objects.all()
    

class EventDeleteView(DestroyAPIView):
    permission_classes = [CanCreateCommunityContent]
    queryset = Event.objects.all()


# --- Registration and Management Views ---

class EventRegistrationView(GenericAPIView):
    serializer_class = EventRegistrationSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """Register for an event"""
        event = get_object_or_404(Event, pk=pk)
        serializer = self.get_serializer(data={'event': event.id})
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user, event=event)
        return Response({"message": "Successfully registered for the event."}, status=status.HTTP_201_CREATED)

    def delete(self, request, pk):
        """Unregister from an event"""
        registration = get_object_or_404(EventRegistration, event_id=pk, user=request.user)
        registration.delete()
        return Response({"message": "Successfully unregistered from the event."}, status=status.HTTP_204_NO_CONTENT)


class ParticipantListView(ListAPIView):
    serializer_class = EventParticipantSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPagination

    def get_queryset(self):
        event_id = self.kwargs.get('event_id')
        return EventRegistration.objects.filter(event_id=event_id).select_related('user').order_by('-registered_at')


class AttendanceUpdateView(UpdateAPIView):
    serializer_class = AttendanceUpdateSerializer
    permission_classes = [IsAuthenticated]
    queryset = EventRegistration.objects.all()

    def get_object(self):
        obj = super().get_object()
        event = obj.event
        user = self.request.user
        
        is_creator = False
        if user.role == 'community':
            is_creator = (event.community == user)
        else:
            membership = getattr(user, 'membership', None)
            is_creator = (membership and membership.role == 'representative' and membership.community == event.community)
            
        if not is_creator:
            raise PermissionDenied("You do not have permission to update attendance for this event.")
            
        return obj


class ManualAddParticipantView(CreateAPIView):
    serializer_class = ManualAddParticipantSerializer
    permission_classes = [IsEventCreator]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['event'] = get_object_or_404(Event, id=self.kwargs.get('event_id'))
        return context

    def perform_create(self, serializer):
        serializer.save()


# --- ViewSets (new router-based approach) ---

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('-date')
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsCommunityRepresentativeOrReadOnly]

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return EventUpdateSerializer
        return EventSerializer

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'community':
            serializer.save(created_by=None, community=user)
        elif hasattr(user, 'membership') and user.membership and user.membership.community:
            serializer.save(created_by=user, community=user.membership.community)
        else:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You are not associated with a community to create an event.")


class EventRegistrationViewSet(viewsets.ModelViewSet):
    queryset = EventRegistration.objects.all()
    serializer_class = EventRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = EventRegistration.objects.all()
        event_id = self.request.query_params.get('event_id')
        if event_id is not None:
            queryset = queryset.filter(event__id=event_id)
        return queryset
