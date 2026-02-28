from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    actor_name = serializers.ReadOnlyField(source='actor.username')
    actor_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'actor', 'actor_name', 'actor_image', 'type', 'title', 
            'message', 'metadata', 'is_read', 'created_at'
        ]

    def get_actor_image(self, obj):
        if obj.actor:
            if obj.actor.role == 'community':
                return obj.actor.community_logo.url if obj.actor.community_logo else None
            return obj.actor.profile_image.url if obj.actor.profile_image else None
        return None
