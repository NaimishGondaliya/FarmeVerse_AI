from django.db import models
from django.conf import settings

class WeatherRequestLog(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='weather_requests',
        verbose_name="Farmer"
    )
    city = models.CharField(max_length=100, verbose_name="City")
    temperature = models.FloatField(null=True, blank=True, verbose_name="Temperature (°C)")
    condition = models.CharField(max_length=100, null=True, blank=True, verbose_name="Condition")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Weather search for {self.city} ({self.temperature}°C) at {self.created_at}"
