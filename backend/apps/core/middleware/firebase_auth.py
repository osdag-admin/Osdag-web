"""
Firebase Authentication Middleware for Django REST Framework
Verifies Firebase tokens and syncs users to Django User model
"""

import hashlib
import time
from firebase_admin import auth as firebase_auth
from django.contrib.auth.models import User
from django.core.cache import cache
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


class FirebaseAuthentication(BaseAuthentication):
    """
    Custom authentication class for Firebase tokens.
    Verifies Firebase ID tokens and syncs users to Django User model.
    """
    
    def authenticate_header(self, request):
        """
        Return Bearer to trigger 401 Unauthorized instead of 403 Forbidden
        when authentication fails.
        """
        return 'Bearer'
        
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
            
        # Compute a fast cache key based on a hash of the token
        token_hash = hashlib.sha256(token.encode('utf-8')).hexdigest()
        cache_key = f"firebase_token:{token_hash}"
        
        # Check cache first
        cached_data = cache.get(cache_key)
        if cached_data:
            uid = cached_data.get('uid')
            email = cached_data.get('email')
            email_verified = cached_data.get('email_verified', False)
            
            # Retrieve the corresponding Django user
            user = User.objects.filter(username=uid).first()
            if user:
                if not user.is_active:
                    raise AuthenticationFailed('User account is disabled.')
                # Attach Firebase metadata to request for use in views
                request.firebase_uid = uid
                request.email_verified = email_verified
                return (user, None)
        
        # Cache miss or user not found in local DB -> perform standard validation
        try:
            # Verify Firebase token
            decoded = firebase_auth.verify_id_token(token)
            uid = decoded.get('uid')
            email = decoded.get('email')
            email_verified = decoded.get('email_verified', False)
            exp = decoded.get('exp', 0)
            
            if not uid:
                raise AuthenticationFailed('Invalid token: missing UID')
            
            # Sync to Django User (use Firebase UID as username)
            user, created = User.objects.get_or_create(
                username=uid,
                defaults={
                    'email': email or '',
                }
            )
            
            if not user.is_active:
                raise AuthenticationFailed('User account is disabled.')
            
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
            
            # Cache the successful validation result matching the token's lifetime
            current_time = int(time.time())
            timeout = max(0, exp - current_time)
            if timeout > 0:
                cache.set(cache_key, {
                    'uid': uid,
                    'email': email,
                    'email_verified': email_verified
                }, timeout=timeout)
            
            return (user, None)
            
        except firebase_auth.InvalidIdTokenError:
            raise AuthenticationFailed('Invalid Firebase token')
        except firebase_auth.ExpiredIdTokenError:
            raise AuthenticationFailed('Firebase token has expired')
        except Exception as e:
            raise AuthenticationFailed(f'Authentication failed: {str(e)}')

