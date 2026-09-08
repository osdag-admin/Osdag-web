from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def clear_legacy_custom_materials(apps, schema_editor):
    CustomMaterials = apps.get_model("core", "CustomMaterials")
    CustomMaterials.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0011_project_outputs_json"),
    ]

    operations = [
        migrations.AddField(
            model_name="custommaterials",
            name="user",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="custom_materials",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.RunPython(clear_legacy_custom_materials, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name="custommaterials",
            name="email",
        ),
        migrations.AlterField(
            model_name="custommaterials",
            name="user",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="custom_materials",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddConstraint(
            model_name="custommaterials",
            constraint=models.UniqueConstraint(
                fields=("user", "Grade"),
                name="core_custommaterials_user_grade_uniq",
            ),
        ),
    ]
