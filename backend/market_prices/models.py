from django.db import models

class MarketPrice(models.Model):
    market_name = models.CharField(max_length=100)
    district_name = models.CharField(max_length=100, null=True, blank=True)
    crop_name = models.CharField(max_length=100)
    min_price = models.DecimalField(max_digits=10, decimal_places=2)
    max_price = models.DecimalField(max_digits=10, decimal_places=2)
    modal_price = models.DecimalField(max_digits=10, decimal_places=2)
    arrival_quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0, null=True, blank=True)
    price_date = models.DateField()
    source = models.CharField(max_length=100, default='AGMARKNET')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-price_date', 'market_name', 'crop_name']
        unique_together = ('market_name', 'crop_name', 'price_date')
        indexes = [
            models.Index(fields=['market_name']),
            models.Index(fields=['district_name']),
            models.Index(fields=['crop_name']),
            models.Index(fields=['price_date']),
        ]

    def __str__(self):
        return f"{self.crop_name} @ {self.market_name} ({self.price_date}): {self.modal_price}"
