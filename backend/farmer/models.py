# pyrefly: ignore [missing-import]
from django.db import models
# pyrefly: ignore [missing-import]
from django.conf import settings
from decimal import Decimal


class Farm(models.Model):
    farmer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='farms',
        verbose_name="Farmer"
    )
    farm_name = models.CharField(max_length=255, verbose_name="Farm Name")
    village = models.CharField(max_length=255, verbose_name="Village")
    taluka = models.CharField(max_length=255, verbose_name="Taluka")
    district = models.CharField(max_length=255, verbose_name="District")
    state = models.CharField(max_length=255, default="Gujarat", verbose_name="State")
    
    total_area = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Total Area")
    area_unit = models.CharField(
        max_length=20,
        choices=[('Acre', 'Acre'), ('Hectare', 'Hectare')],
        verbose_name="Area Unit"
    )
    soil_type = models.CharField(max_length=100, verbose_name="Soil Type")
    irrigation_type = models.CharField(max_length=100, verbose_name="Irrigation Type")
    
    latitude = models.DecimalField(max_digits=12, decimal_places=9, null=True, blank=True, verbose_name="Latitude")
    longitude = models.DecimalField(max_digits=12, decimal_places=9, null=True, blank=True, verbose_name="Longitude")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.farm_name} - {self.village}"


class Crop(models.Model):
    SEASON_CHOICES = [
        ('Kharif', 'Kharif'),
        ('Rabi', 'Rabi'),
        ('Summer', 'Summer'),
    ]

    STATUS_CHOICES = [
        ('Sown', 'Sown'),
        ('Growing', 'Growing'),
        ('Harvested', 'Harvested'),
        ('Sold', 'Sold'),
    ]

    DISEASE_CHOICES = [
        ('Healthy', 'Healthy'),
        ('Healthy (Low Risk)', 'Healthy (Low Risk)'),
        ('Monitored', 'Monitored'),
        ('Diseased', 'Diseased'),
    ]

    farm = models.ForeignKey(
        Farm,
        on_delete=models.CASCADE,
        related_name='crops',
        verbose_name="Farm"
    )
    crop_name = models.CharField(max_length=255, verbose_name="Crop Name")
    crop_variety = models.CharField(max_length=255, verbose_name="Crop Variety")
    season = models.CharField(max_length=20, choices=SEASON_CHOICES, verbose_name="Season")
    sowing_date = models.DateField(verbose_name="Sowing Date")
    expected_harvest_date = models.DateField(verbose_name="Expected Harvest Date")
    harvest_date = models.DateField(null=True, blank=True, verbose_name="Harvest Date")
    
    area_used = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Area Used")
    area_unit = models.CharField(
        max_length=20,
        choices=[('Acre', 'Acre'), ('Hectare', 'Hectare')],
        verbose_name="Area Unit"
    )
    
    expected_yield = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Expected Yield (kg)")
    actual_yield = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="Actual Yield (kg)")
    
    # Cost Breakdown
    seed_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, verbose_name="Seed Cost")
    fertilizer_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, verbose_name="Fertilizer Cost")
    pesticide_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, verbose_name="Pesticide Cost")
    labour_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, verbose_name="Labour Cost")
    other_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, verbose_name="Other Cost")
    total_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, verbose_name="Total Cost")
    
    selling_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Selling Price (per kg)")
    sold_quantity = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="Sold Quantity (kg)")
    
    crop_image = models.ImageField(upload_to='crops/', null=True, blank=True, verbose_name="Crop Image")
    notes = models.TextField(blank=True, verbose_name="Notes")
    
    crop_status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Sown', verbose_name="Crop Status")
    disease_status = models.CharField(max_length=50, choices=DISEASE_CHOICES, default='Healthy', verbose_name="Disease Status")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        # Automatically calculate the total cost
        self.total_cost = (
            self.seed_cost + 
            self.fertilizer_cost + 
            self.pesticide_cost + 
            self.labour_cost + 
            self.other_cost
        )
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.crop_name} ({self.crop_variety}) - {self.farm.farm_name}"

    @property
    def total_expenses(self):
        # Sum of all linked expenses
        val = self.expenses.aggregate(total=models.Sum('amount'))['total']
        return val if val is not None else Decimal(str(0.00))

    @property
    def total_revenues(self):
        # Sum of all linked sales total revenues
        val = self.sales.aggregate(total=models.Sum('total_revenue'))['total']
        return val if val is not None else Decimal(str(0.00))

    @property
    def net_profit(self):
        return self.total_revenues - self.total_expenses


class Expense(models.Model):
    EXPENSE_TYPES = [
        ('Seed', 'Seed'),
        ('Fertilizer', 'Fertilizer'),
        ('Pesticide', 'Pesticide'),
        ('Labour', 'Labour'),
        ('Irrigation', 'Irrigation'),
        ('Machinery', 'Machinery'),
        ('Transportation', 'Transportation'),
        ('Other', 'Other'),
    ]

    crop = models.ForeignKey(
        Crop,
        on_delete=models.CASCADE,
        related_name='expenses',
        verbose_name="Crop"
    )
    expense_type = models.CharField(max_length=50, choices=EXPENSE_TYPES, verbose_name="Expense Type")
    amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Amount")
    expense_date = models.DateField(verbose_name="Expense Date")
    description = models.TextField(blank=True, verbose_name="Description")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    class Meta:
        ordering = ['-expense_date']

    def __str__(self):
        return f"{self.expense_type} - ₹{self.amount} ({self.crop.crop_name})"


class Sales(models.Model):
    crop = models.ForeignKey(
        Crop,
        on_delete=models.CASCADE,
        related_name='sales',
        verbose_name="Crop"
    )
    market_yard = models.CharField(max_length=255, verbose_name="Market Yard")
    sale_date = models.DateField(verbose_name="Sale Date")
    sold_quantity = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Sold Quantity (kg)")
    price_per_kg = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Price Per KG")
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, verbose_name="Total Revenue")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    class Meta:
        ordering = ['-sale_date']

    def save(self, *args, **kwargs):
        self.total_revenue = self.sold_quantity * self.price_per_kg
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Sale: {self.crop.crop_name} - {self.sold_quantity}kg at {self.market_yard}"



