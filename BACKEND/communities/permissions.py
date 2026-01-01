from rest_framework.permissions import BasePermission

class CanAddCommunityMembers(BasePermission):
    def has_permission(self, request, view):
        user = request.user

        if not user.is_authenticated:
            return False

        # Case 1: community account
        if user.role == "community":
            return True

        # Case 2: student leader
        if user.role == "student":
            membership = getattr(user, "membership", None)
            if membership and membership.role == "leader":
                return True

        return False



# For creation
class CanPostAnnouncement(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False
        if user.role == "community":
            return True
        membership = getattr(user, "membership", None)
        if membership and membership.role in ["leader", "moderator"]:
            return True
        return False

# For viewing
class CanViewAnnouncement(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated
