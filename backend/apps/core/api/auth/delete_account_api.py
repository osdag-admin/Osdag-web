from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from apps.core.permissions import IsEmailVerified
from django.utils import timezone
from django.db import transaction, IntegrityError
from django.contrib.auth.models import User
from apps.core.models import UserAccount, Project, OsiFile
from firebase_admin import auth as firebase_auth
import logging

logger = logging.getLogger(__name__)

class DeleteAccountAPIView(APIView):
    """
    Endpoint to immediately and permanently delete a user account and all associated data.
    """
    permission_classes = [IsAuthenticated, IsEmailVerified]

    def delete(self, request):
        user = request.user
        uid = user.username  # Firebase UID is stored as username
        user_email = user.email

        # 1. Delete from Firebase Auth
        try:
            firebase_auth.delete_user(uid)
            logger.info(f"Successfully deleted user {uid} from Firebase Auth.")
        except Exception as fe:
            logger.warning(f"Firebase delete failed/skipped for {uid}: {fe}")

        # 2. Hard delete user's projects, OSI files, and Django user record
        try:
            with transaction.atomic():
                if user_email:
                    Project.objects.filter(user_email=user_email).delete()
                    OsiFile.objects.filter(owner_email=user_email).delete()
                user.delete()

            logger.info(f"Successfully deleted Django user account and all associated data for {user_email} (UID: {uid})")
            return Response({
                "success": True,
                "message": "Account and all associated data deleted successfully."
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error deleting account: {e}", exc_info=True)
            return Response({
                "success": False,
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

