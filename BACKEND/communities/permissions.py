from rest_framework import permissions
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

class IsCommunityOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of a community to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the community.
        return obj.id == request.user.id

class IsCommunityRepresentativeOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow community representatives to perform write actions.
    Read-only access for everyone else.
    """
    def has_permission(self, request, view):
        # Allow read-only access for any request (authenticated or not).
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # For write methods (POST, PUT, DELETE), user must be authenticated
        # and a representative of a community.
        return request.user and request.user.is_authenticated and hasattr(request.user, 'membership') and request.user.membership.role == 'representative'

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the representative of the specific community
        # that owns the event.
        if not (request.user and request.user.is_authenticated and hasattr(request.user, 'membership')):
            return False
            
        # Check if the user is a representative of the community associated with the event.
        # The 'obj' here is the Event instance.
        return (
            request.user.membership.role == 'representative' and
            str(request.user.membership.community.id) == str(obj.community.id)
        )

class CanManageVacancy(BasePermission):
    """
    Permission to manage a specific vacancy.
    Only the community that owns it or its representative can manage it.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user.is_authenticated:
            return False

        # Community owner
        if user.role == "community" and obj.community == user:
            return True

        # Representative
        membership = getattr(user, "membership", None)
        if membership and membership.role == "representative" and membership.community == obj.community:
            return True

        return False
