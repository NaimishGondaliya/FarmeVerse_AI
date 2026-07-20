from django.db import models
from django.conf import settings
from farmer.models import Farm

class DiseaseDetection(models.Model):
    STATUS_CHOICES = [
        ('Healthy', 'Healthy'),
        ('Diseased', 'Diseased'),
    ]

    farmer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='disease_detections',
        verbose_name="Farmer"
    )
    farm = models.ForeignKey(
        Farm,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='disease_detections',
        verbose_name="Farm"
    )
    crop = models.CharField(max_length=100, verbose_name="Crop")
    image = models.ImageField(upload_to='diseases/', verbose_name="Crop Leaf Image")
    prediction = models.CharField(max_length=255, verbose_name="Prediction")
    confidence = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="Confidence (%)")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Healthy', verbose_name="Status")
    treatment = models.TextField(blank=True, verbose_name="Treatment")
    prevention = models.TextField(blank=True, verbose_name="Prevention")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.crop} - {self.prediction} ({self.confidence}%)"

