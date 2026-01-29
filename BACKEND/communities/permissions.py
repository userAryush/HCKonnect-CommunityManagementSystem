from rest_framework.permissions import BasePermission

class IsCommunityAccount(BasePermission):
    message = "Only community accounts can perform this action."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "community"






