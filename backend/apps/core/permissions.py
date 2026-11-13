from rest_framework import permissions


class IsEmailVerified(permissions.BasePermission):
    """
    Permission class to check if user's email is verified.
    Requires Firebase authentication middleware to set request.email_verified.
    """
    message = 'Please verify your email to access this resource. Check your inbox for the verification link.'
    
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
        email_verified = getattr(request, 'email_verified', False)
        
        return email_verified


class IsEmailVerifiedIfAuthenticated(permissions.BasePermission):
    """
    Permission class to check if user's email is verified if they are authenticated.
    Allows guest (unauthenticated) requests but blocks authenticated requests with unverified emails.
    """
    message = 'Please verify your email to access this resource. Check your inbox for the verification link.'

    def has_permission(self, request, view):
        # Allow guests
        if not request.user or not request.user.is_authenticated:
            return True
            
        # Check if email_verified was set by FirebaseAuthentication middleware
        email_verified = getattr(request, 'email_verified', False)
        
        return email_verified


