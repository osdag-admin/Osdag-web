# Generated by Django 3.2.19 on 2023-06-08 04:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('osdag', '0008_alter_equalangle_source'),
    ]

    operations = [
        migrations.AlterField(
            model_name='equalangle',
            name='Source',
            field=models.CharField(max_length=50),
        ),
    ]
