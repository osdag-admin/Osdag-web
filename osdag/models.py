from django.db import models

# postgres imports 
from django.contrib.postgres.fields import ArrayField

# other imports 
from django.contrib.auth.hashers import make_password, check_password

class Design(models.Model):
    """Design Session object in Database."""
    cookie_id = models.CharField(unique=True, max_length=32)
    module_id = models.CharField(max_length=200)
    input_values = models.JSONField(blank=True)
    logs = models.TextField(blank=True)
    output_values = models.JSONField(blank=True)
    design_status = models.BooleanField(blank=True)
    cad_design_status = models.BooleanField(blank=True)
    
    class Meta : 
        db_table = "Design"


#########################################################
# Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) #
#########################################################
class UserAccount(models.Model) : 
    username = models.TextField(blank=True , unique = True)
    password = models.TextField(blank=False)
    email = models.TextField(blank=True, unique = True)
    allInputValueFiles = ArrayField(models.TextField(blank = True))

    class Meta : 
        db_table = "UserAccount"

class Anchor_Bolt(models.Model):
    Diameter = models.TextField()

    class Meta:
        db_table = "Anchor_Bolt"


class Angle_Pitch(models.Model):
    Nominal_Leg = models.IntegerField()
    Max_Bolt_Dia = models.IntegerField()
    Bolt_lines = models.IntegerField()
    S1 = models.IntegerField(null=True)
    S2 = models.IntegerField(null=True)
    S3 = models.IntegerField(null=True)

    class Meta:
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
    lumax = models.DecimalField(max_digits=10, decimal_places=2)
    lvmin = models.DecimalField(max_digits=10, decimal_places=2)
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
        db_table = "Beams"


class Bolt(models.Model):
    id = models.IntegerField(primary_key=True, unique=True)
    Bolt_diameter = models.TextField()

    class Meta:
        db_table = "Bolt"


class Bolt_fy_fu(models.Model):
    Property_Class = models.DecimalField(max_digits=10, decimal_places=2)
    Diameter_min = models.IntegerField()
    Diameter_max = models.IntegerField()
    fy = models.IntegerField()
    fu = models.IntegerField()

    class Meta:
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
        db_table = "UnequalAngle"


class Material(models.Model):
    Grade = models.TextField()
    Yield_Stress_less_than_20 = models.IntegerField(db_column="Yield Stress (< 20)")
    Yield_Stress_between_20_and_neg40 = models.IntegerField(db_column="Yield Stress (20 -40)")
    Yield_Stress_greater_than_40 = models.IntegerField(db_column="Yield Stress (> 40)")
    Ultimate_Tensile_Stress = models.IntegerField(db_column="Ultimate Tensile Stress")
    Elongation = models.IntegerField(db_column="Elongation ", blank=True)

    class Meta:
        db_table = "Material"

class CustomMaterials(models.Model):
    email = models.TextField()
    Grade = models.TextField()
    Yield_Stress_less_than_20 = models.IntegerField(db_column="Yield Stress (< 20)")
    Yield_Stress_between_20_and_neg40 = models.IntegerField(db_column="Yield Stress (20 -40)")
    Yield_Stress_greater_than_40 = models.IntegerField(db_column="Yield Stress (> 40)")
    Ultimate_Tensile_Stress = models.IntegerField(db_column="Ultimate Tensile Stress")
    Elongation = models.IntegerField(db_column="Elongation ", blank=True)

    class Meta:
        db_table = "CustomMaterials"


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
        db_table = "SHS"
