from rest_framework.permissions import BasePermission

class IsCommunityAccount(BasePermission):
    message = "Only community accounts can perform this action."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "community"

class IsCommunityManager(BasePermission):
    """
    Allows access if the user is the community account itself
    OR a representative member of that community.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
            
        # 1. Is the user actually the community account?
        if str(request.user.id) == str(obj.id) and request.user.role == "community":
            return True
            
        # 2. Is the user a representative of THIS community?
        # We check the CommunityMembership model
        from .models import CommunityMembership
        return CommunityMembership.objects.filter(
            user=request.user, 
            community=obj, 
            role='representative'
        ).exists()






