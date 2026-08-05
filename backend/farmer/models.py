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

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            Notification.objects.create(
                user=self.farmer,
                title="New Farm Added (નવું ખેતર)",
                message=f"તમારું ખેતર '{self.farm_name}' ({self.village}) નોંધાઈ ગયું છે."
            )

    def __str__(self):
        return f"{self.farm_name} - {self.village}"

    @property
    def used_area(self):
        active_crops = self.crops.filter(crop_status__in=['Sown', 'Growing'])
        used_acres = Decimal('0.00')
        for c in active_crops:
            c_area = c.area_used
            if c.area_unit == 'Hectare':
                c_area *= Decimal('2.47105')
            used_acres += c_area
            
        if self.area_unit == 'Hectare':
            return round(used_acres / Decimal('2.47105'), 2)
        return round(used_acres, 2)

    @property
    def available_area(self):
        avail = self.total_area - self.used_area
        return max(Decimal('0.00'), avail)




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
        is_new = self.pk is None
        old_status = None
        if not is_new:
            try:
                old_status = Crop.objects.get(pk=self.pk).crop_status
            except Crop.DoesNotExist:
                pass
                
        # Automatically calculate the total cost
        self.total_cost = (
            self.seed_cost + 
            self.fertilizer_cost + 
            self.pesticide_cost + 
            self.labour_cost + 
            self.other_cost
        )
        super().save(*args, **kwargs)

        if is_new:
            Notification.objects.create(
                user=self.farm.farmer,
                title="Crop Added (નવો પાક)",
                message=f"તમારા ખેતરમાં '{self.crop_name}' નો નવો પાક ઉમેરવામાં આવ્યો છે."
            )
        elif old_status != self.crop_status:
            if self.crop_status == 'Harvested':
                Notification.objects.create(
                    user=self.farm.farmer,
                    title="Crop Harvested (પાક લણણી)",
                    message=f"તમારો પાક '{self.crop_name}' સફળતાપૂર્વક લણવામાં આવ્યો છે."
                )
            elif self.crop_status == 'Sold':
                Notification.objects.create(
                    user=self.farm.farmer,
                    title="Crop Sold (પાક વેચાણ)",
                    message=f"તમારો પાક '{self.crop_name}' વેચાઈ ગયો છે."
                )
                

        # Automatic expense integration
        expense_mapping = {
            'Seed': self.seed_cost,
            'Fertilizer': self.fertilizer_cost, # Included for completeness
            'Pesticide': self.pesticide_cost,
            'Labour': self.labour_cost,
            'Other': self.other_cost
        }

        for expense_type, amount in expense_mapping.items():
            if amount > 0:
                Expense.objects.update_or_create(
                    crop=self,
                    expense_type=expense_type,
                    defaults={
                        'amount': amount,
                        'expense_date': self.sowing_date,
                        'description': 'Auto-synced from crop records'
                    }
                )
            else:
                # Remove if amount was reduced to 0
                Expense.objects.filter(crop=self, expense_type=expense_type, description='Auto-synced from crop records').delete()

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
        is_new = self.pk is None
        self.total_revenue = self.sold_quantity * self.price_per_kg
        super().save(*args, **kwargs)
        
        # Push sale updates up to the Crop model automatically
        self.crop.crop_status = 'Sold'
        self.crop.selling_price = self.price_per_kg
        self.crop.sold_quantity = self.sold_quantity
        # Optional: could also set harvest date if not set, but not explicitly requested
        self.crop.save()
        
        if is_new:
            Notification.objects.create(
                user=self.crop.farm.farmer,
                title="Sale Recorded (વેચાણ નોંધાઈ)",
                message=f"તમારા પાક '{self.crop.crop_name}' નું {self.sold_quantity}kg નું વેચાણ ₹{self.total_revenue} માં નોંધાયું છે."
            )



    def __str__(self):
        return f"Sale: {self.crop.crop_name} - {self.sold_quantity}kg at {self.market_yard}"


class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True, verbose_name="User")
    expert = models.ForeignKey('expert.AgricultureExpert', on_delete=models.CASCADE, related_name='notifications', null=True, blank=True, verbose_name="Expert")
    title = models.CharField(max_length=255, verbose_name="Title")
    message = models.TextField(verbose_name="Message")
    is_read = models.BooleanField(default=False, verbose_name="Is Read")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.user.email}"
