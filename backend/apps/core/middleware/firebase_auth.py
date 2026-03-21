"""
Firebase Authentication Middleware for Django REST Framework
Verifies Firebase tokens and syncs users to Django User model
"""

from firebase_admin import auth as firebase_auth
from django.contrib.auth.models import User
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


class FirebaseAuthentication(BaseAuthentication):
    """
    Custom authentication class for Firebase tokens.
    Verifies Firebase ID tokens and syncs users to Django User model.
    """
    
    def authenticate(self, request):
        """
        Authenticate request using Firebase token.
        
        Returns:
            tuple: (user, None) if authenticated, None otherwise
        """
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split('Bearer ')[1]
        
        if not token:
            return None
        
        try:
            # Verify Firebase token
            decoded = firebase_auth.verify_id_token(token)
            uid = decoded.get('uid')
            email = decoded.get('email')
            email_verified = decoded.get('email_verified', False)
            
            if not uid:
                raise AuthenticationFailed('Invalid token: missing UID')
            
            # Sync to Django User (use Firebase UID as username)
            user, created = User.objects.get_or_create(
                username=uid,
                defaults={
                    'email': email or '',
                }
            )
            
            # Update email if changed
            if email and user.email != email:
                user.email = email
                user.save()
            
            # Sync UserAccount if it doesn't exist (for backward compatibility)
            from apps.core.models import UserAccount
            user_account, _ = UserAccount.objects.get_or_create(
                username=uid,
                defaults={
                    'user': user,
                    'email': email or '',
                    'allInputValueFiles': []
                }
            )
            
            # Update UserAccount if user link is missing or email changed
            needs_save = False
            if not user_account.user:
                user_account.user = user
                needs_save = True
            if email and user_account.email != email:
                user_account.email = email
                needs_save = True
            if user_account.user != user:
                user_account.user = user
                needs_save = True
            
            if needs_save:
                user_account.save()
            
            # Attach Firebase metadata to request for use in views
            request.firebase_uid = uid
            request.email_verified = email_verified
            
            return (user, None)
            
        except firebase_auth.InvalidIdTokenError:
            raise AuthenticationFailed('Invalid Firebase token')
        except firebase_auth.ExpiredIdTokenError:
            raise AuthenticationFailed('Firebase token has expired')
        except Exception as e:
            raise AuthenticationFailed(f'Authentication failed: {str(e)}')

