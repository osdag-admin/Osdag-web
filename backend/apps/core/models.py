from django.db import models

# postgres imports 
from django.contrib.postgres.fields import ArrayField

# other imports 
from django.contrib.auth.hashers import make_password, check_password
from django.conf import settings
from django.core.files.storage import FileSystemStorage

# Dedicated storage for .osi files
osi_file_storage = FileSystemStorage(
    location=getattr(settings, 'OSIFILES_ROOT', ''),
    base_url=getattr(settings, 'OSIFILES_URL', '/osifiles/')
)

class Project(models.Model):
    """Project object to store minimal project info and file location."""
    name = models.CharField(max_length=200)
    # Optional module and submodule identifiers for routing/reporting
    module = models.CharField(max_length=200, blank=True, null=True)
    submodule = models.CharField(max_length=200, blank=True, null=True)
    # Design inputs persisted as JSON
    inputs_json = models.JSONField(blank=True, null=True)
    # Design outputs persisted as JSON
    outputs_json = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user_email = models.CharField(max_length=200, blank=True, null=True)
    
    class Meta:
        app_label = 'core'
        db_table = "Project"
        ordering = ['-updated_at']  # Most recent first

    def __str__(self):
        return f"{self.name}"


class OsiFile(models.Model):
    """Stores uploaded .osi files with their storage URL and timestamps."""
    file = models.FileField(upload_to='', storage=osi_file_storage)
    owner_email = models.CharField(max_length=200, blank=True, null=True)
    original_name = models.CharField(max_length=255, blank=True, null=True)
    size_bytes = models.BigIntegerField(blank=True, null=True)
    content_type = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'core'
        db_table = "OsiFile"

    def __str__(self):
        return self.file.name


#########################################################
# Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) #
#########################################################
class UserAccount(models.Model):
    """
    User account model for storing user-specific data.
    
    IMPORTANT: With Firebase Authentication:
    - username field stores Firebase UID (not a traditional username)
    - user field is a ForeignKey to Django User model (which also uses Firebase UID as username)
    - email field stores the user's email address
    - No password field needed (authentication handled by Firebase)
    
    The User model (Django's built-in) stores:
    - username = Firebase UID
    - email = User's email address
    """
    # ForeignKey to Django User model (which uses Firebase UID as username)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='user_account',
        null=True,
        blank=True,
        help_text="Link to Django User (username = Firebase UID)"
    )
    # Firebase UID stored as username (for backward compatibility and direct lookups)
    username = models.TextField(blank=True, unique=True, help_text="Firebase UID")
    email = models.TextField(blank=True, unique=True)

    class Meta:
        app_label = 'core'
        db_table = "UserAccount"
        
    def __str__(self):
        return f"UserAccount: {self.username or self.email or 'No identifier'}"

class CustomMaterials(models.Model):
    user = models.ForeignKey(
        'auth.User',
        on_delete=models.CASCADE,
        related_name='custom_materials',
    )
    Grade = models.TextField()
    Yield_Stress_less_than_20 = models.IntegerField(db_column="Yield Stress (< 20)")
    Yield_Stress_between_20_and_neg40 = models.IntegerField(db_column="Yield Stress (20 -40)")
    Yield_Stress_greater_than_40 = models.IntegerField(db_column="Yield Stress (> 40)")
    Ultimate_Tensile_Stress = models.IntegerField(db_column="Ultimate Tensile Stress")
    Elongation = models.IntegerField(db_column="Elongation ", blank=True)

    class Meta:
        app_label = 'core'
        db_table = "CustomMaterials"
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'Grade'],
                name='core_custommaterials_user_grade_uniq',
            ),
        ]
