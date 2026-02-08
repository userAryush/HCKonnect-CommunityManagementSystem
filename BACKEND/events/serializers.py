from rest_framework.serializers import ModelSerializer, CharField, ImageField, ValidationError
from .models import Event
import json

class EventSerializer(ModelSerializer):
    community_name = CharField(source="community.community_name", read_only=True)
    community_logo = ImageField(source="community.community_logo", read_only=True)

    class Meta:
        model = Event
        fields = ["id","title","description","date","start_time","end_time","location","format","image","speakers","what_to_expect","community","community_name","community_logo","created_by","created_at"]
        read_only_fields = ["id","community","created_by","created_at"]

class EventCreateSerializer(ModelSerializer):
    class Meta:
        model = Event
        fields = ["title", "description", "date", "start_time", "end_time", "location", "format", "image", "speakers", "what_to_expect"]

    def to_internal_value(self, data):
        # Handle FormData which sends everything as strings.
        # unpack QueryDict to a standard dict to avoid list-unpacking issues
        if hasattr(data, 'dict'):
             ret = data.dict()
        else:
             ret = data.copy()

        for field in ['speakers', 'what_to_expect']:
            if field in ret and isinstance(ret[field], str):
                try:
                    ret[field] = json.loads(ret[field])
                except (json.JSONDecodeError, TypeError):
                    pass
        
        return super().to_internal_value(ret)

    def validate(self, data):
        # Simple time validation
        if data.get("end_time") and data.get("start_time"):
            if data["end_time"] <= data["start_time"]:
                raise ValidationError({"end_time": "End time must be after start time."})
        return data

    def create(self, validated_data):
        user = self.context["request"].user
        
        if user.role == "community":
            community = user
            created_by = None
        else:
            # Safer way to access membership
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
    
class EventUpdateSerializer(ModelSerializer):
    class Meta:
        model = Event
        fields = [
            "title",
            "description",
            "date",
            "start_time",
            "end_time",
            "location",
            "format",
            "image",
            "speakers",
            "what_to_expect"
        ]

    def to_internal_value(self, data):
        import json
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
    
class EventRetrieveSerializer(ModelSerializer):
    community_name = CharField(source="community.community_name", read_only=True)
    community_logo = ImageField(source="community.community_logo", read_only=True)

    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "description",
            "date",
            "start_time",
            "end_time",
            "location",
            "format",
            "image",
            "speakers",
            "what_to_expect",
            "community",
            "community_name",
            "community_logo",
            "created_by",
            "created_at"
        ]
        read_only_fields = ["id", "community", "created_by", "created_at"]