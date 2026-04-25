from django.http.response import JsonResponse
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from firebase_admin import auth as firebase_auth
import firebase_admin
from firebase_admin import credentials
from django.contrib.auth.models import User
import os

# importing data
from .data.design_types import design_type_data, connections_data, shear_connection, moment_connection, b2b_splice, b2column, c2c_splice, base_plate, tension_member


# Create your views here.

# Initialize Firebase Admin SDK
# TODO: Move this to a better place (e.g., AppConfig ready method) and use environment variables for path
if not firebase_admin._apps:
    # Try to find the credential file
    # Prefer service account placed in backend/firebase-service-account.json
    repo_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))  # .../backend
    cred_candidates = [
        os.path.join(repo_root, "firebase-service-account.json"),
        os.path.join(repo_root, "config", "firebase-service-account.json"),
        "osdag_web/firebase-service-account.json",  # legacy location
    ]
    cred_path = next((p for p in cred_candidates if os.path.exists(p)), None)
    
    if cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        print("Warning: Firebase credentials not found. Checked:")
        for p in cred_candidates:
            print(f" - {p}")


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    user = request.user
    return Response({
        "message": f"Welcome {user.username}!",
        "email": user.email,
    })


class FirebaseAuthView(APIView):
    """
    Unified endpoint for all Firebase authentication (Google + Email/Password).
    Syncs Firebase users to Django User model and returns user info.
    """
    authentication_classes = []  # Bypass JWTAuthentication for this endpoint
    permission_classes = []  # Public endpoint
    
    def post(self, request):
        import logging
        logger = logging.getLogger(__name__)
        
        # Log request data for debugging
        logger.info(f"FirebaseAuthView POST request received. Data keys: {list(request.data.keys()) if hasattr(request.data, 'keys') else 'No data'}")
        
        token = request.data.get("token")
        if not token:
            logger.error("FirebaseAuthView: No token provided in request")
            return Response({"error": "No token provided"}, status=400)
        
        logger.info(f"FirebaseAuthView: Token received (length: {len(token) if token else 0})")
        
        try:
            decoded = firebase_auth.verify_id_token(token)
            logger.info(f"FirebaseAuthView: Token verified successfully. UID: {decoded.get('uid')}, Email: {decoded.get('email')}")
            
            uid = decoded.get('uid')
            email = decoded.get('email')
            email_verified = decoded.get('email_verified', False)
            
            if not uid:
                logger.error("FirebaseAuthView: Token decoded but missing UID")
                return Response({"error": "Invalid token: missing UID"}, status=400)
            
            # Sync user to Django (use Firebase UID as username)
            user, created = User.objects.get_or_create(
                username=uid,
                defaults={'email': email or ''}
            )
            logger.info(f"FirebaseAuthView: User {'created' if created else 'retrieved'}. Username: {user.username}, Email: {user.email}")
            
            # Update email if changed
            if email and user.email != email:
                user.email = email
                user.save()
                logger.info(f"FirebaseAuthView: Updated user email to {email}")
            
            # Sync UserAccount if it doesn't exist
            from apps.core.models import UserAccount
            user_account, account_created = UserAccount.objects.get_or_create(
                username=uid,
                defaults={
                    'user': user,
                    'email': email or '',
                    'allInputValueFiles': []
                }
            )
            logger.info(f"FirebaseAuthView: UserAccount {'created' if account_created else 'retrieved'}")
            
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
                logger.info(f"FirebaseAuthView: UserAccount updated")
            
            logger.info(f"FirebaseAuthView: Authentication successful for UID: {uid}")
            return Response({
                'success': True,
                'uid': uid,
                'email': email,
                'email_verified': email_verified,
                'created': created,
                'message': 'Authentication successful'
            }, status=200)
            
        except firebase_auth.InvalidIdTokenError as e:
            logger.error(f"FirebaseAuthView: Invalid Firebase token error: {str(e)}")
            return Response({"error": "Invalid Firebase token"}, status=400)
        except firebase_auth.ExpiredIdTokenError as e:
            logger.error(f"FirebaseAuthView: Expired Firebase token error: {str(e)}")
            return Response({"error": "Firebase token has expired"}, status=400)
        except Exception as e:
            logger.error(f"FirebaseAuthView: Unexpected error: {str(e)}", exc_info=True)
            return Response({"error": str(e)}, status=400)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_design_types(request):
    return JsonResponse({'result': design_type_data}, safe=False)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_connections(request):
    return JsonResponse({'result': connections_data}, safe=False)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_shear_connection(request):
    return JsonResponse({'result': shear_connection}, safe=False)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_moment_connection(request):
    return JsonResponse({'result': moment_connection}, safe=False)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_b2b_splice(request):
    return JsonResponse({'result': b2b_splice}, safe=False)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_b2column(request):
    return JsonResponse({'result': b2column}, safe=False)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_c2c_splice(request):
    return JsonResponse({'result': c2c_splice}, safe=False)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_base_plate(request):
    return JsonResponse({'result': base_plate}, safe=False)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_tension_member(request):
    return JsonResponse({'result': tension_member}, safe=False)

