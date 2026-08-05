from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError, AuthenticationFailed
from authentication.services.otp_service import OTPService
from authentication.services.email_service import EmailService
from authentication.services.jwt_service import JWTService
from django.contrib.auth.hashers import check_password

from django.db import transaction

User = get_user_model()


def _mask_email(email: str) -> str:
    """Mask email address for display, e.g. na*****@gmail.com"""
    if not email or '@' not in email:
        return '***@***.***'
    local, domain = email.rsplit('@', 1)
    if len(local) <= 2:
        masked_local = local[0] + '*****'
    else:
        masked_local = local[:2] + '*****'
    return f"{masked_local}@{domain}"


class AuthService:
    """
    Facade service coordinating authentication operations, business logic rules,
    and credentials verification.
    """
    @staticmethod
    def register_user(validated_data: dict) -> dict:
        """
        Validate uniqueness, hash password, generate verification OTP, and save user.
        Raises ValidationError if email fails, rolling back the database transaction.
        Returns dict with user and masked email for frontend OTP screen.
        """
        mobile = validated_data.get('mobile')
        email = validated_data.get('email')

        # Check duplicate mobile
        if User.objects.filter(mobile=mobile).exists():
            raise ValidationError({'mobile': 'This mobile number is already registered.'})

        # Check duplicate email
        if User.objects.filter(email=email).exists():
            raise ValidationError({'email': 'This email address is already registered.'})

        with transaction.atomic():
            # Create user — explicitly NOT verified
            user = User.objects.create_user(
                mobile=mobile,
                email=email,
                full_name=validated_data.get('full_name'),
                role=validated_data.get('role', 'Farmer'),
                password=validated_data.get('password'),
                is_verified=False,
            )

            # Generate registration OTP
            otp_code = OTPService.generate_otp(mobile, purpose='registration')

            # Send OTP email
            sent = EmailService.send_otp_email(user.email, otp_code)
            if not sent:
                raise ValidationError({'email': 'Unable to send verification email. Please try again.'})

        return {
            'user': user,
            'masked_email': _mask_email(user.email),
        }

    @staticmethod
    def verify_registration_otp(mobile: str, otp_code: str) -> bool:
        """
        Verify the registration OTP and mark user as verified.
        """
        user = User.objects.filter(mobile=mobile).first()
        if not user:
            raise ValidationError("No registered user found with this mobile number.")

        if user.is_verified:
            raise ValidationError("This account is already verified.")

        # Verify the OTP (purpose = registration)
        is_valid = OTPService.verify_otp(mobile, otp_code, purpose='registration')
        if not is_valid:
            raise ValidationError("Invalid or expired OTP code. Please try again or request a new OTP.")

        # Mark user as verified
        user.is_verified = True
        user.save(update_fields=['is_verified'])
        return True

    @staticmethod
    def resend_registration_otp(mobile: str) -> bool:
        """
        Resend registration OTP with cooldown protection.
        """
        user = User.objects.filter(mobile=mobile).first()
        if not user:
            raise ValidationError("No registered user found with this mobile number.")

        if user.is_verified:
            raise ValidationError("This account is already verified.")

        # Rate-limit check (60 seconds)
        if not OTPService.can_resend(mobile, purpose='registration'):
            raise ValidationError("Please wait at least 60 seconds before requesting a new OTP.")

        # Generate new OTP (old OTPs are deleted inside generate_otp)
        otp_code = OTPService.generate_otp(mobile, purpose='registration')

        # Send via email
        sent = EmailService.send_otp_email(user.email, otp_code)
        if not sent:
            raise ValidationError("Unable to send verification email. Please try again.")

        return True

    @staticmethod
    def authenticate_user(credential: str, password_raw: str, role_scope: str) -> dict:
        """
        Look up user by mobile OR email, check password, verify active/role status,
        and generate JWT tokens.
        """
        # Try finding by mobile first, then email
        user = None
        if credential.isdigit() or len(credential) <= 15:
            user = User.objects.filter(mobile=credential).first()

        if not user:
            user = User.objects.filter(email=credential).first()

        if not user:
            raise AuthenticationFailed("Invalid mobile number or email credentials.")

        # Check password
        if not user.check_password(password_raw):
            raise AuthenticationFailed("Incorrect password code.")

        # Validate role matches requested login portal
        if user.role != role_scope:
            raise AuthenticationFailed(f"Unauthorized. You do not have permissions to access the {role_scope} portal.")

        # Validate active status
        if not user.is_active:
            raise AuthenticationFailed("Your account is disabled. Please contact administrator.")

        # REQUIRE email verification before login (Farmer role)
        if not user.is_verified:
            raise AuthenticationFailed("Please verify your email before logging in.")

        # Generate JWT tokens
        tokens = JWTService.generate_tokens_for_user(user)

        return {
            'tokens': tokens,
            'user': {
                'uuid': str(user.uuid),
                'full_name': user.full_name,
                'mobile': user.mobile,
                'email': user.email,
                'role': user.role,
                'is_verified': user.is_verified
            }
        }

    @staticmethod
    def request_forgot_password(mobile: str) -> bool:
        """
        Check if user exists with mobile, generate OTP, send OTP code via email.
        """
        user = User.objects.filter(mobile=mobile).first()
        if not user:
            raise ValidationError("No registered user found with this mobile number.")

        # Generate OTP (purpose = forgot_password)
        otp_code = OTPService.generate_otp(mobile, purpose='forgot_password')

        # Dispatch to email
        sent = EmailService.send_otp_email(user.email, otp_code)

        return sent

    @staticmethod
    def verify_forgot_password_otp(mobile: str, otp_code: str) -> str:
        """
        Validate the recovery OTP. On success, generate and return a reset token.
        """
        # Verify otp (purpose = forgot_password)
        is_valid = OTPService.verify_otp(mobile, otp_code, purpose='forgot_password')
        if not is_valid:
            raise ValidationError("Invalid or expired OTP code.")

        # Generate a secure reset token
        reset_token = OTPService.generate_reset_token(mobile)
        return reset_token

    @staticmethod
    def reset_password(mobile: str, new_password_raw: str, reset_token: str) -> bool:
        """
        Reset user's password — requires a valid reset token from OTP verification.
        """
        # Validate the reset token first
        if not reset_token:
            raise ValidationError("Reset token is required. Please verify OTP first.")

        is_valid = OTPService.validate_reset_token(mobile, reset_token)
        if not is_valid:
            raise ValidationError("Invalid or expired reset token. Please verify OTP again.")

        user = User.objects.filter(mobile=mobile).first()
        if not user:
            raise ValidationError("User not found.")

        user.set_password(new_password_raw)
        user.save(update_fields=['password'])
        return True

    @staticmethod
    def update_profile(user, validated_data: dict) -> "User":
        """
        Update user profile information.
        """
        full_name = validated_data.get('full_name')
        email = validated_data.get('email')

        # Check duplicate email if it changes
        if email and email != user.email:
            if User.objects.filter(email=email).exists():
                raise ValidationError({'email': 'This email address is already taken.'})
            user.email = email

        if full_name:
            user.full_name = full_name

        user.save()
        return user
