"""
User-owned custom section rows.

Catalog shapes mirror apps.core.models: Angles, Beams, Channels, Columns.
Global Beams/Columns/Angles/Channels tables are not mutated from here.
"""

from django.conf import settings
from django.db import models


class UserOwnedSectionBase(models.Model):
    """Shared ownership and lifecycle fields for all UserCustom* tables."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="+",
        help_text="Owner of this custom section row",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(
        default=True,
        help_text="Soft-delete flag when hard DELETE is deferred",
    )

    class Meta:
        abstract = True


class UserCustomBeam(UserOwnedSectionBase):
    """Mirrors core.models.Beams — one row per user-owned custom beam section."""

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
        db_table = "UserCustomBeam"
        constraints = [
            models.UniqueConstraint(
                fields=["user", "Designation"],
                name="sections_usercustombeam_user_designation_uniq",
            ),
        ]

    def __str__(self):
        return f"UserCustomBeam({self.Designation}, user={self.user_id})"


class UserCustomColumn(UserOwnedSectionBase):
    """Mirrors core.models.Columns."""

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
        db_table = "UserCustomColumn"
        constraints = [
            models.UniqueConstraint(
                fields=["user", "Designation"],
                name="sections_usercustomcolumn_user_designation_uniq",
            ),
        ]

    def __str__(self):
        return f"UserCustomColumn({self.Designation}, user={self.user_id})"


class UserCustomAngle(UserOwnedSectionBase):
    """Mirrors core.models.Angles."""

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
        db_table = "UserCustomAngle"
        constraints = [
            models.UniqueConstraint(
                fields=["user", "Designation"],
                name="sections_usercustomangle_user_designation_uniq",
            ),
        ]

    def __str__(self):
        return f"UserCustomAngle({self.Designation}, user={self.user_id})"


class UserCustomChannel(UserOwnedSectionBase):
    """Mirrors core.models.Channels."""

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
        db_table = "UserCustomChannel"
        constraints = [
            models.UniqueConstraint(
                fields=["user", "Designation"],
                name="sections_usercustomchannel_user_designation_uniq",
            ),
        ]

    def __str__(self):
        return f"UserCustomChannel({self.Designation}, user={self.user_id})"


TABLE_TO_USER_MODEL = {
    "Columns": UserCustomColumn,
    "Beams": UserCustomBeam,
    "Angles": UserCustomAngle,
    "Channels": UserCustomChannel,
}
