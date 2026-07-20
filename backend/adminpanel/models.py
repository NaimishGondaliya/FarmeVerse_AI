from django.db import models
from django.conf import settings

class AdminProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='admin_profile'
    )
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    language = models.CharField(max_length=10, default='ENG')  # ENG or GUJ
    theme = models.CharField(max_length=10, default='Light')  # Light or Dark

    class Meta:
        db_table = 'admin_profile'

    def __str__(self):
        return f"AdminProfile - {self.user.full_name}"
