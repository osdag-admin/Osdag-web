from django.contrib import admin

from apps.sections.models import (
    UserCustomAngle,
    UserCustomBeam,
    UserCustomChannel,
    UserCustomColumn,
)


@admin.register(UserCustomBeam)
class UserCustomBeamAdmin(admin.ModelAdmin):
    list_display = ("id", "Designation", "user", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("Designation",)


@admin.register(UserCustomColumn)
class UserCustomColumnAdmin(admin.ModelAdmin):
    list_display = ("id", "Designation", "user", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("Designation",)


@admin.register(UserCustomAngle)
class UserCustomAngleAdmin(admin.ModelAdmin):
    list_display = ("id", "Designation", "user", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("Designation",)


@admin.register(UserCustomChannel)
class UserCustomChannelAdmin(admin.ModelAdmin):
    list_display = ("id", "Designation", "user", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("Designation",)
