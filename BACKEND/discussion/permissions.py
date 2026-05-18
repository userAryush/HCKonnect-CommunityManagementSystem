from rest_framework.permissions import BasePermission
from communities.platform import is_platform_community
from django.contrib.auth import get_user_model

User = get_user_model()


class CanCreateDiscussion(BasePermission):

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        visibility = request.data.get("visibility")

        # PUBLIC → anyone
        if visibility == "public":
            return True

        # PRIVATE → only community, representative, or member (not platform communities)
        if visibility == "private":
            community_id = request.data.get("community")
            community = User.objects.filter(id=community_id, role="community").first()
            if community and is_platform_community(community):
                return False

            if user.role in ["community", "admin"]:
                if is_platform_community(user):
                    return False
                return str(user.id) == str(community_id)

            membership = getattr(user, "membership", None)
            if membership and membership.role in ["representative", "member"]:
                if is_platform_community(membership.community):
                    return False
                return str(membership.community_id) == str(community_id)

        return False



class CanAccessDiscussion(BasePermission):

    def has_object_permission(self, request, view, obj):
        user = request.user

        if not user.is_authenticated:
            return False

        # obj may be topic or reply
        topic = obj if hasattr(obj, "visibility") else obj.topic

        # public → anyone authenticated
        if topic.visibility == "public":
            return True

        # private → must belong to same community
        if user.role in ["community", "admin"]:
            return topic.community_id == user.id

        membership = getattr(user, "membership", None)
        if membership:
            return membership.community_id == topic.community_id

        return False





class CanEditDiscussion(BasePermission):

    def has_object_permission(self, request, view, obj):
        return (
            request.user.is_authenticated and
            (obj.created_by == request.user or request.user.role == "admin")
        )




class IsOwner(BasePermission):

    def has_object_permission(self, request, view, obj):
        return obj.created_by == request.user
