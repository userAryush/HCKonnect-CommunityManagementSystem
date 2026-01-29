from rest_framework.serializers import ModelSerializer, CharField, ImageField
from .models import Event

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
        fields = ["title","description","date","start_time","end_time","location","format","image","speakers","what_to_expect"]

    def create(self, validated_data):
        request = self.context["request"]
        user = request.user

        if user.role == "community":
            community = user
            created_by = None
        else:

            community = user.membership.community
            created_by = user

        return Event.objects.create(community=community,created_by=created_by,**validated_data)