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

        community_id = getattr(obj, "community_id", None)
        if community_id is not None and str(community_id) == str(user.id):
            return True

        created_by = getattr(obj, "created_by_user", None)
        if created_by is not None and created_by == user:
            return True

        membership = getattr(user, "membership", None)
        if (
            membership
            and membership.role == "representative"
            and community_id is not None
            and str(membership.community_id) == str(community_id)
        ):
            return True

        if user.role == "admin":
            return True

        return False


class IsPostOwnerOrAdmin(BasePermission):
    """
    Allows only the author of the post or an admin to edit/delete.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        # Check if the object has 'author' (Post) or 'created_by' (Comment/Reaction)
        owner = getattr(obj, 'author', getattr(obj, 'created_by', None))
        return owner == request.user or request.user.role == "admin"