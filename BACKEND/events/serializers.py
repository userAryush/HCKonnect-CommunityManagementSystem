from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import Event, EventRegistration
from django.utils import timezone
from django.contrib.auth import get_user_model
import json

User = get_user_model()


class EventSerializer(serializers.ModelSerializer):
    community_name = serializers.CharField(source='community.community_name', read_only=True)
    community_logo = serializers.ImageField(source='community.community_logo', read_only=True)
    is_registered = serializers.SerializerMethodField()
    registered_count = serializers.SerializerMethodField()
    speakers = serializers.JSONField(required=False)
    what_to_expect = serializers.JSONField(required=False)

    class Meta:
        model = Event
        fields = [
            'id', 'community', 'community_name', 'community_logo', 'title', 'description', 
            'date', 'start_time', 'end_time', 'location', 'format', 'image', 
            'created_at', 'created_by', 'is_registered', 'registered_count',
            'registration_deadline', 'max_participants', 'speakers', 'what_to_expect'
        ]
        read_only_fields = ['created_by']

    def get_is_registered(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return obj.registrations.filter(user=request.user).exists()
        return False

    def get_registered_count(self, obj):
        return obj.registrations.count()

    def to_internal_value(self, data):
        if hasattr(data, 'dict'):
            ret = data.dict()
        else:
            ret = data.copy() if hasattr(data, 'copy') else data

        for field in ['speakers', 'what_to_expect']:
            if field in ret and isinstance(ret[field], str):
                try:
                    ret[field] = json.loads(ret[field])
                except (json.JSONDecodeError, TypeError):
                    pass
        
        return super().to_internal_value(ret)

    def create(self, validated_data):
        user = self.context["request"].user
        
        # Remove these if present in validated_data to avoid duplicate kwargs
        validated_data.pop('community', None)
        validated_data.pop('created_by', None)
        
        if user.role == "community":
            community = user
            created_by = None
        else:
            membership = getattr(user, 'membership', None)
            if not membership or membership.role != 'representative':
                raise ValidationError("Only community accounts or representatives can create events.")
            
            community = membership.community
            created_by = user

        return Event.objects.create(
            community=community, 
            created_by=created_by, 
            **validated_data
        )


class EventUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['title', 'description', 'date', 'start_time', 'end_time', 'location', 'format', 'image', 'registration_deadline', 'max_participants', 'speakers', 'what_to_expect']

    def to_internal_value(self, data):
        if hasattr(data, 'dict'):
             data = data.dict()
        elif hasattr(data, 'copy'):
             data = data.copy()
        
        for field in ['speakers', 'what_to_expect']:
             if field in data and isinstance(data[field], str):
                try:
                    data[field] = json.loads(data[field])
                except (json.JSONDecodeError, TypeError):
                    pass
        return super().to_internal_value(data)

    def validate(self, data):
        start_time = data.get("start_time")
        end_time = data.get("end_time")
        if start_time and end_time and end_time <= start_time:
            raise ValidationError({"end_time": "End time must be after start time."})
        return data


# --- Registration and Participant Management Serializers ---

class EventRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventRegistration
        fields = ['id', 'event', 'user', 'registered_at']
        read_only_fields = ['user', 'event']

    def validate(self, data):
        # event is read_only so it's not in validated data; get it from initial_data
        from .models import Event
        event_id = self.initial_data.get('event')
        try:
            event = Event.objects.get(pk=event_id)
        except Event.DoesNotExist:
            raise ValidationError("Event not found.")

        user = self.context['request'].user

        # 1. Reject if already registered
        if EventRegistration.objects.filter(event=event, user=user).exists():
            raise ValidationError("You are already registered for this event.")

        # 2. Reject if deadline passed
        if event.registration_deadline and event.registration_deadline < timezone.now():
            raise ValidationError("Registration deadline for this event has passed.")

        # 3. Reject if max participants reached
        if event.max_participants:
            count = event.registrations.count()
            if count >= event.max_participants:
                raise ValidationError("This event has reached its maximum capacity.")

        data['event'] = event
        return data


class EventParticipantSerializer(serializers.ModelSerializer):
    """Serializer for listing event participants with nested user details."""
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    profile_image = serializers.ImageField(source='user.profile_image', read_only=True, allow_null=True)
    course = serializers.CharField(source='user.course', read_only=True, allow_null=True)

    class Meta:
        model = EventRegistration
        fields = ['id', 'user_id', 'username', 'first_name', 'last_name', 'email', 'profile_image', 'course', 'registered_at', 'attendance']


class AttendanceUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventRegistration
        fields = ['attendance']


class ManualAddParticipantSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)

    class Meta:
        model = EventRegistration
        fields = ['email']

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value, role='student')
            return user
        except User.DoesNotExist:
            raise ValidationError("No student found with this email address.")

    def create(self, validated_data):
        user = validated_data['email']
        event = self.context['event']
        
        if EventRegistration.objects.filter(event=event, user=user).exists():
            raise ValidationError("This student is already registered for the event.")
            
        return EventRegistration.objects.create(event=event, user=user)
