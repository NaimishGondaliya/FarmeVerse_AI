import secrets
from django.utils import timezone
from datetime import timedelta
from authentication.models import OTP


class OTPService:
    """
    Service to generate, store, and verify 6-digit OTP codes linked to a user's mobile.
    Uses Django ORM with SQLite backend.
    """
    @staticmethod
    def generate_otp(mobile: str, purpose: str = 'forgot_password') -> str:
        """
        Generate a cryptographically secure 6-digit OTP, invalidate any existing
        OTPs of the same purpose for the mobile, and persist using Django ORM.
        """
        # Delete old OTPs of the same purpose for this mobile
        OTP.objects.filter(mobile=mobile, purpose=purpose).delete()

        # Generate cryptographically secure 6-digit numeric code
        otp_code = f"{secrets.randbelow(900000) + 100000}"

        # Calculate expiry (5 minutes)
        expires_at = timezone.now() + timedelta(minutes=5)

        # Save OTP using Django ORM
        OTP.objects.create(
            mobile=mobile,
            otp_code=otp_code,
            purpose=purpose,
            expires_at=expires_at
        )

        return otp_code

    @staticmethod
    def verify_otp(mobile: str, otp_code: str, purpose: str = 'forgot_password') -> bool:
        """
        Verify the provided OTP for a mobile number and purpose.
        Returns True if matched and valid (not expired), False otherwise.
        """
        try:
            otp_record = OTP.objects.get(mobile=mobile, otp_code=otp_code, purpose=purpose)

            # Check expiration
            if otp_record.is_expired:
                otp_record.delete()
                return False

            # If valid, delete it to prevent reuse (single-use token)
            otp_record.delete()
            return True

        except OTP.DoesNotExist:
            return False

    @staticmethod
    def generate_reset_token(mobile: str) -> str:
        """
        After successful forgot-password OTP verification, generate a secure
        single-use reset token with a 10-minute expiry. Stored using Django ORM.
        """
        # Remove any existing reset tokens for this mobile
        OTP.objects.filter(mobile=mobile, reset_token__isnull=False).delete()

        token = secrets.token_urlsafe(32)
        expires_at = timezone.now() + timedelta(minutes=10)

        OTP.objects.create(
            mobile=mobile,
            otp_code='000000',  # placeholder — OTP already consumed
            purpose='forgot_password',
            expires_at=expires_at,
            reset_token=token,
            reset_token_expires_at=expires_at
        )

        return token

    @staticmethod
    def validate_reset_token(mobile: str, token: str) -> bool:
        """
        Validate a password-reset token. If valid, consume it (single-use).
        """
        try:
            record = OTP.objects.get(mobile=mobile, reset_token=token)

            if record.reset_token_expires_at and timezone.now() > record.reset_token_expires_at:
                record.delete()
                return False

            # Consume the token (single-use)
            record.delete()
            return True

        except OTP.DoesNotExist:
            return False

    @staticmethod
    def can_resend(mobile: str, purpose: str) -> bool:
        """
        Rate-limit check: prevent resending OTP within 60 seconds of last generation.
        """
        last_otp = OTP.objects.filter(mobile=mobile, purpose=purpose).order_by('-created_at').first()
        if last_otp:
            elapsed = (timezone.now() - last_otp.created_at).total_seconds()
            if elapsed < 60:
                return False
        return True
