from rest_framework.permissions import BasePermission
    
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
    


class CanEditContent(BasePermission):
    """
    Permission to edit/delete content.
    Works for:
    - Community content: community admin or creator can edit
    - Personal content: creator can edit
    """

    message = "You do not have permission to edit or delete this content."

    def has_object_permission(self, request, view, obj):
        user = request.user

        if not user.is_authenticated:
            return False

        # Check community ownership (if exists)
        if getattr(obj, "community", None) == user:
            return True

        # Check creator ownership (if exists)
        if getattr(obj, "created_by_user", None) == user:
            return True

        return False

