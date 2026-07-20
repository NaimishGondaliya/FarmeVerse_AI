from django.db import models
from django.conf import settings

class CropRecommendationLog(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='crop_recommendations',
        verbose_name="Farmer"
    )
    city = models.CharField(max_length=100, verbose_name="City")
    district = models.CharField(max_length=100, verbose_name="District")
    soil_type = models.CharField(max_length=100, verbose_name="Soil Type")
    season = models.CharField(max_length=50, verbose_name="Season")
    rainfall = models.FloatField(default=0.0, verbose_name="Rainfall (mm)")
    recommended_crop = models.CharField(max_length=100, verbose_name="Recommended Crop")
    confidence = models.FloatField(verbose_name="Confidence (%)")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.recommended_crop} in {self.city} ({self.confidence}%)"
