from rest_framework import serializers
from django.contrib.auth import get_user_model
from authentication.utils.validators import (
    validate_full_name,
    validate_mobile,
    validate_password_strength
)
from authentication.utils.constants import ROLE_CHOICES

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer to represent user metadata.
    """
    class Meta:
        model = User
        fields = (
            'uuid',
            'full_name',
            'mobile',
            'email',
            'role',
            'is_verified',
            'is_active',
            'created_at',
            'updated_at'
        )
        read_only_fields = fields


class RegisterSerializer(serializers.Serializer):
    """
    Serializer verifying signup request payload.
    """
    full_name = serializers.CharField(
        required=True,
        validators=[validate_full_name]
    )
    mobile = serializers.CharField(
        required=True,
        validators=[validate_mobile]
    )
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password_strength]
    )
    role = serializers.ChoiceField(
        choices=ROLE_CHOICES,
        default='Farmer'
    )


class LoginSerializer(serializers.Serializer):
    """
    Serializer validating credential and password for logins.
    """
    credential = serializers.CharField(
        required=True,
        help_text="Mobile number or Email address"
    )
    password = serializers.CharField(
        required=True,
        write_only=True
    )
    role = serializers.ChoiceField(
        choices=ROLE_CHOICES,
        required=True
    )


class ProfileUpdateSerializer(serializers.Serializer):
    """
    Serializer validating profile modification requests.
    """
    full_name = serializers.CharField(
        required=False,
        validators=[validate_full_name]
    )
    email = serializers.EmailField(required=False)


class ForgotPasswordSerializer(serializers.Serializer):
    """
    Serializer validating mobile numbers on forgot-password triggers.
    """
    mobile = serializers.CharField(
        required=True,
        validators=[validate_mobile]
    )


class VerifyOTPSerializer(serializers.Serializer):
    """
    Serializer validating input otp code and mobile numbers.
    """
    mobile = serializers.CharField(
        required=True,
        validators=[validate_mobile]
    )
    otp_code = serializers.CharField(
        required=True,
        min_length=6,
        max_length=6
    )


class ResetPasswordSerializer(serializers.Serializer):
    """
    Serializer validating reset password fields.
    """
    mobile = serializers.CharField(
        required=True,
        validators=[validate_mobile]
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password_strength]
    )
    confirm_password = serializers.CharField(
        required=True,
        write_only=True
    )

    def validate(self, attrs):
        if attrs.get('new_password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs
class LogoutSerializer(serializers.Serializer):
    """
    Serializer validating logout payload (refresh token).
    """
    refresh = serializers.CharField(required=True)
