"""
Custom permissions for Django REST Framework
"""

from rest_framework import permissions


class IsEmailVerified(permissions.BasePermission):
    """
    Permission class to check if user's email is verified.
    Requires Firebase authentication middleware to set request.email_verified.
    """
    
    def has_permission(self, request, view):
        """
        Check if user is authenticated and email is verified.
        
        Returns:
            bool: True if user is authenticated and email is verified, False otherwise
        """
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if email_verified was set by FirebaseAuthentication middleware
        # This attribute is set in firebase_auth.py middleware
        email_verified = getattr(request, 'email_verified', False)
        
        return email_verified

