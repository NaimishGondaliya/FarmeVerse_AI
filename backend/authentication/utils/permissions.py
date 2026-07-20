from rest_framework.permissions import BasePermission
from authentication.utils.constants import ROLE_FARMER, ROLE_EXPERT, ROLE_ADMIN


class IsFarmer(BasePermission):
    """
    Allows access only to authenticated users with the Farmer role.
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == ROLE_FARMER
        )


class IsExpert(BasePermission):
    """
    Allows access only to authenticated users with the Expert role.
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == ROLE_EXPERT
        )


class IsAdmin(BasePermission):
    """
    Allows access only to authenticated users with the Admin role.
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == ROLE_ADMIN or request.user.is_superuser)
        )
