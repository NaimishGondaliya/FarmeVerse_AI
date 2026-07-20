from django.db import models
from django.utils import timezone


class OTP(models.Model):
    """
    Model to store generated 6-digit numeric OTPs linked to a user's mobile number.
    Codes expire in 5 minutes.
    """
    mobile = models.CharField(max_length=15, db_index=True)
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = 'otps'
        verbose_name = 'OTP'
        verbose_name_plural = 'OTPs'

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"OTP for {self.mobile}: {self.otp_code} (Expires: {self.expires_at})"
