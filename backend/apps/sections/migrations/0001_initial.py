from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="UserCustomBeam",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        help_text="Owner of this custom section row",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="+",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "is_active",
                    models.BooleanField(
                        default=True,
                        help_text="Soft-delete flag when hard DELETE is deferred",
                    ),
                ),
                ("Designation", models.CharField(max_length=50)),
                ("Mass", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Area", models.DecimalField(decimal_places=2, max_digits=10)),
                ("D", models.DecimalField(decimal_places=2, max_digits=10)),
                ("B", models.DecimalField(decimal_places=2, max_digits=10)),
                ("tw", models.DecimalField(decimal_places=2, max_digits=10)),
                ("T", models.DecimalField(decimal_places=2, max_digits=10)),
                ("FlangeSlope", models.IntegerField()),
                ("R1", models.DecimalField(decimal_places=2, max_digits=10)),
                ("R2", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Iz", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Iy", models.DecimalField(decimal_places=2, max_digits=10)),
                ("rz", models.DecimalField(decimal_places=2, max_digits=10)),
                ("ry", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Zz", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Zy", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Zpz", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Zpy", models.DecimalField(decimal_places=2, max_digits=10)),
                (
                    "It",
                    models.DecimalField(
                        decimal_places=2, max_digits=10, null=True
                    ),
                ),
                (
                    "Iw",
                    models.DecimalField(
                        decimal_places=2, max_digits=10, null=True
                    ),
                ),
                ("Source", models.CharField(max_length=100)),
                ("Type", models.CharField(max_length=100, null=True)),
            ],
            options={
                "db_table": "UserCustomBeam",
                "constraints": [
                    models.UniqueConstraint(
                        fields=("user", "Designation"),
                        name="sections_usercustombeam_user_designation_uniq",
                    ),
                ],
            },
        ),
        migrations.CreateModel(
            name="UserCustomColumn",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        help_text="Owner of this custom section row",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="+",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "is_active",
                    models.BooleanField(
                        default=True,
                        help_text="Soft-delete flag when hard DELETE is deferred",
                    ),
                ),
                ("Designation", models.CharField(max_length=50)),
                ("Mass", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Area", models.DecimalField(decimal_places=2, max_digits=10)),
                ("D", models.DecimalField(decimal_places=2, max_digits=10)),
                ("B", models.DecimalField(decimal_places=2, max_digits=10)),
                ("tw", models.DecimalField(decimal_places=2, max_digits=10)),
                ("T", models.DecimalField(decimal_places=2, max_digits=10)),
                ("FlangeSlope", models.IntegerField()),
                ("R1", models.DecimalField(decimal_places=2, max_digits=10)),
                ("R2", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Iz", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Iy", models.DecimalField(decimal_places=2, max_digits=10)),
                ("rz", models.DecimalField(decimal_places=2, max_digits=10)),
                ("ry", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Zz", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Zy", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Zpz", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Zpy", models.DecimalField(decimal_places=2, max_digits=10)),
                (
                    "It",
                    models.DecimalField(
                        decimal_places=2, max_digits=10, null=True
                    ),
                ),
                (
                    "Iw",
                    models.DecimalField(
                        decimal_places=2, max_digits=10, null=True
                    ),
                ),
                ("Source", models.CharField(max_length=100)),
                ("Type", models.CharField(max_length=100, null=True)),
            ],
            options={
                "db_table": "UserCustomColumn",
                "constraints": [
                    models.UniqueConstraint(
                        fields=("user", "Designation"),
                        name="sections_usercustomcolumn_user_designation_uniq",
                    ),
                ],
            },
        ),
        migrations.CreateModel(
            name="UserCustomAngle",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        help_text="Owner of this custom section row",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="+",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "is_active",
                    models.BooleanField(
                        default=True,
                        help_text="Soft-delete flag when hard DELETE is deferred",
                    ),
                ),
                ("Designation", models.CharField(max_length=50)),
                ("Mass", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Area", models.DecimalField(decimal_places=2, max_digits=10)),
                ("a", models.DecimalField(decimal_places=2, max_digits=10)),
                ("b", models.DecimalField(decimal_places=2, max_digits=10)),
                ("t", models.DecimalField(decimal_places=2, max_digits=10)),
                ("R1", models.DecimalField(decimal_places=2, max_digits=10)),
                ("R2", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Cz", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Cy", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Iz", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Iy", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Alpha", models.DecimalField(decimal_places=2, max_digits=10)),
                ("lumax", models.DecimalField(decimal_places=2, max_digits=10)),
                ("lvmin", models.DecimalField(decimal_places=2, max_digits=10)),
                ("rz", models.DecimalField(decimal_places=2, max_digits=10)),
                ("ry", models.DecimalField(decimal_places=2, max_digits=10)),
                ("rumax", models.DecimalField(decimal_places=2, max_digits=10)),
                ("rvmin", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Zz", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Zy", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Zpz", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Zpy", models.DecimalField(decimal_places=2, max_digits=10)),
                ("It", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Source", models.CharField(max_length=100)),
                ("Type", models.CharField(max_length=100, null=True)),
            ],
            options={
                "db_table": "UserCustomAngle",
                "constraints": [
                    models.UniqueConstraint(
                        fields=("user", "Designation"),
                        name="sections_usercustomangle_user_designation_uniq",
                    ),
                ],
            },
        ),
        migrations.CreateModel(
            name="UserCustomChannel",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        help_text="Owner of this custom section row",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="+",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "is_active",
                    models.BooleanField(
                        default=True,
                        help_text="Soft-delete flag when hard DELETE is deferred",
                    ),
                ),
                ("Designation", models.CharField(max_length=50)),
                ("Mass", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Area", models.DecimalField(decimal_places=2, max_digits=10)),
                ("D", models.DecimalField(decimal_places=2, max_digits=10)),
                ("B", models.DecimalField(decimal_places=2, max_digits=10)),
                ("tw", models.DecimalField(decimal_places=2, max_digits=10)),
                ("T", models.DecimalField(decimal_places=2, max_digits=10)),
                ("FlangeSlope", models.IntegerField()),
                ("R1", models.DecimalField(decimal_places=2, max_digits=10)),
                ("R2", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Cy", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Iz", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Iy", models.DecimalField(decimal_places=2, max_digits=10)),
                ("rz", models.DecimalField(decimal_places=2, max_digits=10)),
                ("ry", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Zz", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Zy", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Zpz", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Zpy", models.DecimalField(decimal_places=2, max_digits=10)),
                ("It", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Iw", models.DecimalField(decimal_places=2, max_digits=10)),
                ("Source", models.CharField(max_length=100)),
                ("Type", models.CharField(max_length=100, null=True)),
            ],
            options={
                "db_table": "UserCustomChannel",
                "constraints": [
                    models.UniqueConstraint(
                        fields=("user", "Designation"),
                        name="sections_usercustomchannel_user_designation_uniq",
                    ),
                ],
            },
        ),
    ]
