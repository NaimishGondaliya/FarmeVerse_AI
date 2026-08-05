from django.db import models
from django.utils import timezone


class OTP(models.Model):
    """
    Model to store generated 6-digit numeric OTPs linked to a user's mobile number.
    Codes expire in 5 minutes. Used for both registration and forgot-password flows.
    """
    PURPOSE_CHOICES = (
        ('registration', 'Registration'),
        ('forgot_password', 'Forgot Password'),
    )

    mobile = models.CharField(max_length=15, db_index=True)
    otp_code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES, default='forgot_password')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    # Password-reset token fields (populated only after successful forgot-password OTP verification)
    reset_token = models.CharField(max_length=64, null=True, blank=True)
    reset_token_expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'otps'
        verbose_name = 'OTP'
        verbose_name_plural = 'OTPs'

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"OTP ({self.purpose}) for {self.mobile}: {self.otp_code} (Expires: {self.expires_at})"
