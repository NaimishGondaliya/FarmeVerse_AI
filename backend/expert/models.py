from django.db import models

class AgricultureExpert(models.Model):
    name = models.CharField(max_length=255, db_index=True)
    photo = models.CharField(max_length=255, blank=True, null=True)
    qualification = models.CharField(max_length=255)
    specialization = models.CharField(max_length=255, db_index=True)
    experience = models.IntegerField(help_text="Experience in years")
    district = models.CharField(max_length=100, db_index=True)
    phone = models.CharField(max_length=20)
    email = models.EmailField(unique=True, db_index=True)
    password = models.CharField(max_length=255, default='')  # Hashed password string
    bio = models.TextField(blank=True, null=True)
    profile_photo = models.CharField(max_length=255, blank=True, null=True)
    office_address = models.TextField(blank=True, null=True)
    languages = models.CharField(max_length=255, db_index=True, help_text="Comma separated languages", default='Gujarati, English')
    availability = models.CharField(max_length=255, default='Mon-Fri 9:00 AM - 5:00 PM')
    google_map_link = models.URLField(blank=True, null=True)
    rating = models.FloatField(default=0.0)
    review_count = models.IntegerField(default=0)
    total_consultations = models.IntegerField(default=0)
    active_status = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'expert_agriculture_experts'
        verbose_name = 'Agriculture Expert'
        verbose_name_plural = 'Agriculture Experts'

    @property
    def is_authenticated(self):
        return True

    def __str__(self):
        return f"{self.name} ({self.specialization})"


