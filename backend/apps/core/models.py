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

class Anchor_Bolt(models.Model):
    Diameter = models.TextField()

    class Meta:
        app_label = 'core'
        db_table = "Anchor_Bolt"


class Angle_Pitch(models.Model):
    Nominal_Leg = models.IntegerField()
    Max_Bolt_Dia = models.IntegerField()
    Bolt_lines = models.IntegerField()
    S1 = models.IntegerField(null=True)
    S2 = models.IntegerField(null=True)
    S3 = models.IntegerField(null=True)

    class Meta:
        app_label = 'core'
        db_table = "Angle_Pitch"


class Angles(models.Model):
    Designation = models.CharField(max_length=50)
    Mass = models.DecimalField(max_digits=10, decimal_places=2)
    Area = models.DecimalField(max_digits=10, decimal_places=2)
    a = models.DecimalField(max_digits=10, decimal_places=2)
    b = models.DecimalField(max_digits=10, decimal_places=2)
    t = models.DecimalField(max_digits=10, decimal_places=2)
    R1 = models.DecimalField(max_digits=10, decimal_places=2)
    R2 = models.DecimalField(max_digits=10, decimal_places=2)
    Cz = models.DecimalField(max_digits=10, decimal_places=2)
    Cy = models.DecimalField(max_digits=10, decimal_places=2)
    Iz = models.DecimalField(max_digits=10, decimal_places=2)
    Iy = models.DecimalField(max_digits=10, decimal_places=2)
    Alpha = models.DecimalField(max_digits=10, decimal_places=2)
    lumax = models.DecimalField(db_column='Iumax', max_digits=10, decimal_places=2)
    lvmin = models.DecimalField(db_column='Ivmin', max_digits=10, decimal_places=2)
    rz = models.DecimalField(max_digits=10, decimal_places=2)
    ry = models.DecimalField(max_digits=10, decimal_places=2)
    rumax = models.DecimalField(max_digits=10, decimal_places=2)
    rvmin = models.DecimalField(max_digits=10, decimal_places=2)
    Zz = models.DecimalField(max_digits=10, decimal_places=2)
    Zy = models.DecimalField(max_digits=10, decimal_places=2)
    Zpz = models.DecimalField(max_digits=10, decimal_places=2)
    Zpy = models.DecimalField(max_digits=10, decimal_places=2)
    It = models.DecimalField(max_digits=10, decimal_places=2)
    Source = models.CharField(max_length=100)
    Type = models.CharField(max_length=100, null=True)

    class Meta:
        app_label = 'core'
        db_table = "Angles"


class Beams(models.Model):
    Designation = models.CharField(max_length=50)
    Mass = models.DecimalField(max_digits=10, decimal_places=2)
    Area = models.DecimalField(max_digits=10, decimal_places=2)
    D = models.DecimalField(max_digits=10, decimal_places=2)
    B = models.DecimalField(max_digits=10, decimal_places=2)
    tw = models.DecimalField(max_digits=10, decimal_places=2)
    T = models.DecimalField(max_digits=10, decimal_places=2)
    FlangeSlope = models.IntegerField()
    R1 = models.DecimalField(max_digits=10, decimal_places=2)
    R2 = models.DecimalField(max_digits=10, decimal_places=2)
    Iz = models.DecimalField(max_digits=10, decimal_places=2)
    Iy = models.DecimalField(max_digits=10, decimal_places=2)
    rz = models.DecimalField(max_digits=10, decimal_places=2)
    ry = models.DecimalField(max_digits=10, decimal_places=2)
    Zz = models.DecimalField(max_digits=10, decimal_places=2)
    Zy = models.DecimalField(max_digits=10, decimal_places=2)
    Zpz = models.DecimalField(max_digits=10, decimal_places=2)
    Zpy = models.DecimalField(max_digits=10, decimal_places=2)
    It = models.DecimalField(null=True, max_digits=10, decimal_places=2)
    Iw = models.DecimalField(null=True, max_digits=10, decimal_places=2)
    Source = models.CharField(max_length=100)
    Type = models.CharField(null=True, max_length=100)

    class Meta:
        app_label = 'core'
        db_table = "Beams"


class Bolt(models.Model):
    id = models.IntegerField(primary_key=True, unique=True)
    Bolt_diameter = models.TextField()

    class Meta:
        app_label = 'core'
        db_table = "Bolt"


class Bolt_fy_fu(models.Model):
    Property_Class = models.DecimalField(max_digits=10, decimal_places=2)
    Diameter_min = models.IntegerField()
    Diameter_max = models.IntegerField()
    fy = models.IntegerField()
    fu = models.IntegerField()

    class Meta:
        app_label = 'core'
        db_table = "Bolt_fy_fu"


class CHS(models.Model):
    Designation = models.CharField(max_length=50)
    NB = models.CharField(max_length=50)
    OD = models.DecimalField(max_digits=10, decimal_places=2)
    T = models.DecimalField(max_digits=10, decimal_places=2)
    W = models.DecimalField(max_digits=10, decimal_places=2)
    A = models.DecimalField(max_digits=10, decimal_places=2)
    V = models.DecimalField(max_digits=10, decimal_places=2)
    Ves = models.DecimalField(max_digits=10, decimal_places=2)
    Vis = models.DecimalField(max_digits=10, decimal_places=2)
    I = models.DecimalField(max_digits=10, decimal_places=2)
    Z = models.DecimalField(max_digits=10, decimal_places=2)
    R = models.DecimalField(max_digits=10, decimal_places=2)
    Rsq = models.DecimalField(max_digits=10, decimal_places=2)
    Source = models.CharField(max_length=50)

    class Meta:
        app_label = 'core'
        db_table = "CHS"


class Channels(models.Model):
    Designation = models.CharField(max_length=50)
    Mass = models.DecimalField(max_digits=10, decimal_places=2)
    Area = models.DecimalField(max_digits=10, decimal_places=2)
    D = models.DecimalField(max_digits=10, decimal_places=2)
    B = models.DecimalField(max_digits=10, decimal_places=2)
    tw = models.DecimalField(max_digits=10, decimal_places=2)
    T = models.DecimalField(max_digits=10, decimal_places=2)
    FlangeSlope = models.IntegerField()
    R1 = models.DecimalField(max_digits=10, decimal_places=2)
    R2 = models.DecimalField(max_digits=10, decimal_places=2)
    Cy = models.DecimalField(max_digits=10, decimal_places=2)
    Iz = models.DecimalField(max_digits=10, decimal_places=2)
    Iy = models.DecimalField(max_digits=10, decimal_places=2)
    rz = models.DecimalField(max_digits=10, decimal_places=2)
    ry = models.DecimalField(max_digits=10, decimal_places=2)
    Zz = models.DecimalField(max_digits=10, decimal_places=2)
    Zy = models.DecimalField(max_digits=10, decimal_places=2)
    Zpz = models.DecimalField(max_digits=10, decimal_places=2)
    Zpy = models.DecimalField(max_digits=10, decimal_places=2)
    It = models.DecimalField(max_digits=10, decimal_places=2)
    Iw = models.DecimalField(max_digits=10, decimal_places=2)
    Source = models.CharField(max_length=100)
    Type = models.CharField(null=True, max_length=100)

    class Meta:
        app_label = 'core'
        db_table = "Channels"


class Columns(models.Model):
    Designation = models.CharField(max_length=50)
    Mass = models.DecimalField(max_digits=10, decimal_places=2)
    Area = models.DecimalField(max_digits=10, decimal_places=2)
    D = models.DecimalField(max_digits=10, decimal_places=2)
    B = models.DecimalField(max_digits=10, decimal_places=2)
    tw = models.DecimalField(max_digits=10, decimal_places=2)
    T = models.DecimalField(max_digits=10, decimal_places=2)
    FlangeSlope = models.IntegerField()
    R1 = models.DecimalField(max_digits=10, decimal_places=2)
    R2 = models.DecimalField(max_digits=10, decimal_places=2)
    Iz = models.DecimalField(max_digits=10, decimal_places=2)
    Iy = models.DecimalField(max_digits=10, decimal_places=2)
    rz = models.DecimalField(max_digits=10, decimal_places=2)
    ry = models.DecimalField(max_digits=10, decimal_places=2)
    Zz = models.DecimalField(max_digits=10, decimal_places=2)
    Zy = models.DecimalField(max_digits=10, decimal_places=2)
    Zpz = models.DecimalField(max_digits=10, decimal_places=2)
    Zpy = models.DecimalField(max_digits=10, decimal_places=2)
    It = models.DecimalField(null=True, max_digits=10, decimal_places=2)
    Iw = models.DecimalField(null=True, max_digits=10, decimal_places=2)
    Source = models.CharField(max_length=100)
    Type = models.CharField(null=True, max_length=100)

    class Meta:
        app_label = 'core'
        db_table = "Columns"


class EqualAngle(models.Model):
    Designation = models.CharField(max_length=50)
    Mass = models.DecimalField(max_digits=10, decimal_places=2)
    Area = models.DecimalField(max_digits=10, decimal_places=2)
    a = models.DecimalField(max_digits=10, decimal_places=2)
    b = models.DecimalField(max_digits=10, decimal_places=2)
    t = models.DecimalField(max_digits=10, decimal_places=2)
    R1 = models.DecimalField(max_digits=10, decimal_places=2)
    R2 = models.DecimalField(max_digits=10, decimal_places=2)
    Cz = models.DecimalField(max_digits=10, decimal_places=2)
    Cy = models.DecimalField(max_digits=10, decimal_places=2)
    Iz = models.DecimalField(max_digits=10, decimal_places=2)
    Iy = models.DecimalField(max_digits=10, decimal_places=2)
    Alpha = models.DecimalField(max_digits=10, decimal_places=2)
    Iu_max = models.DecimalField(max_digits=10, decimal_places=2)
    Iv_min = models.DecimalField(max_digits=10, decimal_places=2)
    rz = models.DecimalField(max_digits=10, decimal_places=2)
    ry = models.DecimalField(max_digits=10, decimal_places=2)
    ru_max = models.DecimalField(max_digits=10, decimal_places=2)
    rv_min = models.DecimalField(max_digits=10, decimal_places=2)
    Zz = models.DecimalField(max_digits=10, decimal_places=2)
    Zy = models.DecimalField(max_digits=10, decimal_places=2)
    Zpz = models.DecimalField(max_digits=10, decimal_places=2)
    Zpy = models.DecimalField(max_digits=10, decimal_places=2)
    Source = models.CharField(max_length=50)
    It = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        app_label = 'core'
        db_table = "EqualAngle"


class UnequalAngle(models.Model):
    Designation = models.CharField(max_length=50)
    Mass = models.DecimalField(max_digits=10, decimal_places=2)
    Area = models.DecimalField(max_digits=10, decimal_places=2)
    a = models.DecimalField(max_digits=10, decimal_places=2)
    b = models.DecimalField(max_digits=10, decimal_places=2)
    t = models.DecimalField(max_digits=10, decimal_places=2)
    R1 = models.DecimalField(max_digits=10, decimal_places=2)
    R2 = models.DecimalField(max_digits=10, decimal_places=2)
    Cz = models.DecimalField(max_digits=10, decimal_places=2)
    Cy = models.DecimalField(max_digits=10, decimal_places=2)
    Iz = models.DecimalField(max_digits=10, decimal_places=2)
    Iy = models.DecimalField(max_digits=10, decimal_places=2)
    Alpha = models.DecimalField(max_digits=10, decimal_places=2)
    Iu_max = models.DecimalField(max_digits=10, decimal_places=2)
    Iv_min = models.DecimalField(max_digits=10, decimal_places=2)
    rz = models.DecimalField(max_digits=10, decimal_places=2)
    ry = models.DecimalField(max_digits=10, decimal_places=2)
    ru_max = models.DecimalField(max_digits=10, decimal_places=2)
    rv_min = models.DecimalField(max_digits=10, decimal_places=2)
    Zz = models.DecimalField(max_digits=10, decimal_places=2)
    Zy = models.DecimalField(max_digits=10, decimal_places=2)
    Zpz = models.DecimalField(max_digits=10, decimal_places=2)
    Zpy = models.DecimalField(max_digits=10, decimal_places=2)
    Source = models.CharField(max_length=50)
    It = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        app_label = 'core'
        db_table = "UnequalAngle"


class Material(models.Model):
    Grade = models.TextField()
    Yield_Stress_less_than_20 = models.IntegerField(db_column="Yield Stress (< 20)")
    Yield_Stress_between_20_and_neg40 = models.IntegerField(db_column="Yield Stress (20 -40)")
    Yield_Stress_greater_than_40 = models.IntegerField(db_column="Yield Stress (> 40)")
    Ultimate_Tensile_Stress = models.IntegerField(db_column="Ultimate Tensile Stress")
    Elongation = models.IntegerField(db_column="Elongation ", blank=True)

    class Meta:
        app_label = 'core'
        db_table = "Material"

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


class RHS(models.Model):
    Designation = models.CharField(max_length=50)
    D = models.DecimalField(max_digits=10, decimal_places=2)
    B = models.DecimalField(max_digits=10, decimal_places=2)
    T = models.DecimalField(max_digits=10, decimal_places=2)
    W = models.DecimalField(max_digits=10, decimal_places=2)
    A = models.DecimalField(max_digits=10, decimal_places=2)
    Izz = models.DecimalField(max_digits=10, decimal_places=2)
    Iyy = models.DecimalField(max_digits=10, decimal_places=2)
    Rzz = models.DecimalField(max_digits=10, decimal_places=2)
    Ryy = models.DecimalField(max_digits=10, decimal_places=2)
    Zzz = models.DecimalField(max_digits=10, decimal_places=2)
    Zyy = models.DecimalField(max_digits=10, decimal_places=2)
    Zpz = models.DecimalField(max_digits=10, decimal_places=2)
    Zpy = models.DecimalField(max_digits=10, decimal_places=2)
    Source = models.CharField(max_length=50)

    class Meta:
        app_label = 'core'
        db_table = "RHS"


class SHS(models.Model):
    Designation = models.CharField(max_length=50)
    D = models.DecimalField(max_digits=10, decimal_places=2)
    B = models.DecimalField(max_digits=10, decimal_places=2)
    T = models.DecimalField(max_digits=10, decimal_places=2)
    W = models.DecimalField(max_digits=10, decimal_places=2)
    A = models.DecimalField(max_digits=10, decimal_places=2)
    Izz = models.DecimalField(max_digits=10, decimal_places=2)
    Iyy = models.DecimalField(max_digits=10, decimal_places=2)
    Rzz = models.DecimalField(max_digits=10, decimal_places=2)
    Ryy = models.DecimalField(max_digits=10, decimal_places=2)
    Zzz = models.DecimalField(max_digits=10, decimal_places=2)
    Zyy = models.DecimalField(max_digits=10, decimal_places=2)
    Zpz = models.DecimalField(max_digits=10, decimal_places=2)
    Zpy = models.DecimalField(max_digits=10, decimal_places=2)
    Source = models.CharField(max_length=50)

    class Meta:
        app_label = 'core'
        db_table = "SHS"
