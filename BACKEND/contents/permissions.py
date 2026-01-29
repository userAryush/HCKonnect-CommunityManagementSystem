from rest_framework.permissions import BasePermission

class CanViewAnnouncement(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
# For creation
class CanCreateCommunityContent(BasePermission):
    message = "You do not have permission to create content for this community."

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        if user.role == "community":
            return True

        membership = getattr(user, "membership", None)
        if membership and membership.role == "representative":
            return True

        return False