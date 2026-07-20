import random
from django.utils import timezone
from datetime import timedelta
from authentication.models import OTP


class OTPService:
    """
    Service to generate, store, and verify 6-digit OTP codes linked to a user's mobile.
    """
    @staticmethod
    def generate_otp(mobile: str) -> str:
        """
        Generate a random 6-digit OTP, invalidate any existing OTPs for the mobile,
        and persist the new OTP in MongoDB.
        """
        # Delete old OTPs for this mobile clean database
        OTP.objects.filter(mobile=mobile).delete()

        # Generate 6-digit numeric code
        otp_code = f"{random.randint(100000, 999999)}"
        
        # Calculate expiry (5 minutes)
        expires_at = timezone.now() + timedelta(minutes=5)
        
        # Save to MongoDB
        OTP.objects.create(
            mobile=mobile,
            otp_code=otp_code,
            expires_at=expires_at
        )
        
        return otp_code

    @staticmethod
    def verify_otp(mobile: str, otp_code: str) -> bool:
        """
        Verify the provided OTP for a mobile number.
        Returns True if matched and valid (not expired), False otherwise.
        """
        try:
            # Query the database
            otp_record = OTP.objects.get(mobile=mobile, otp_code=otp_code)
            
            # Check expiration
            if otp_record.is_expired:
                # Expired OTPs should be removed
                otp_record.delete()
                return False
                
            # If valid, delete it to prevent reuse (single-use token)
            otp_record.delete()
            return True
            
        except OTP.DoesNotExist:
            return False
