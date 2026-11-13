"""DRF serializers for `UserCustom*` rows."""

from rest_framework import serializers

from apps.sections.models import (
    UserCustomAngle,
    UserCustomBeam,
    UserCustomChannel,
    UserCustomColumn,
)
from apps.sections.validation import can_insert_custom_section


class _InjectUserOnCreateMixin:
    """Attach `request.user` on create (field excluded from serializer input)."""

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class _UserCustomSectionSerializerMixin:
    """Shared duplicate checks; expects `table` on subclass Meta."""

    table: str

    def validate(self, attrs):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user is None or not user.is_authenticated:
            raise serializers.ValidationError(
                {"non_field_errors": ["Authentication required."]}
            )
        designation = attrs.get("Designation")
        if designation is None and getattr(self, "instance", None) is not None:
            designation = self.instance.Designation
        exclude_pk = getattr(self.instance, "pk", None) if getattr(
            self, "instance", None
        ) is not None else None
        ok, code = can_insert_custom_section(
            self.table, designation, user, exclude_user_section_pk=exclude_pk
        )
        if not ok:
            if code == "missing_designation":
                raise serializers.ValidationError(
                    {"Designation": "Designation is required."}
                )
            if code == "catalog_duplicate":
                raise serializers.ValidationError(
                    {
                        "Designation": (
                            "This designation already exists in the standard catalog."
                        )
                    }
                )
            if code == "user_duplicate":
                raise serializers.ValidationError(
                    {
                        "Designation": (
                            "You already have a custom section with this designation."
                        )
                    }
                )
            raise serializers.ValidationError({"Designation": code})
        return attrs


class UserCustomBeamSerializer(
    _InjectUserOnCreateMixin,
    _UserCustomSectionSerializerMixin,
    serializers.ModelSerializer,
):
    table = "Beams"

    class Meta:
        model = UserCustomBeam
        exclude = ("user",)


class UserCustomColumnSerializer(
    _InjectUserOnCreateMixin,
    _UserCustomSectionSerializerMixin,
    serializers.ModelSerializer,
):
    table = "Columns"

    class Meta:
        model = UserCustomColumn
        exclude = ("user",)


class UserCustomAngleSerializer(
    _InjectUserOnCreateMixin,
    _UserCustomSectionSerializerMixin,
    serializers.ModelSerializer,
):
    table = "Angles"

    class Meta:
        model = UserCustomAngle
        exclude = ("user",)


class UserCustomChannelSerializer(
    _InjectUserOnCreateMixin,
    _UserCustomSectionSerializerMixin,
    serializers.ModelSerializer,
):
    table = "Channels"

    class Meta:
        model = UserCustomChannel
        exclude = ("user",)


USER_SECTION_SERIALIZER_BY_TABLE = {
    "Beams": UserCustomBeamSerializer,
    "Columns": UserCustomColumnSerializer,
    "Angles": UserCustomAngleSerializer,
    "Channels": UserCustomChannelSerializer,
}


def get_user_section_serializer(table: str):
    if table not in USER_SECTION_SERIALIZER_BY_TABLE:
        raise ValueError(f"Unknown table: {table!r}")
    return USER_SECTION_SERIALIZER_BY_TABLE[table]
