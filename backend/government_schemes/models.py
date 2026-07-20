from django.db import models

class GovernmentScheme(models.Model):
    SCHEME_TYPE_CHOICES = [
        ('Central', 'Central'),
        ('Gujarat', 'Gujarat'),
    ]
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Active', 'Active'),
        ('Expired', 'Expired'),
    ]

    scheme_name = models.CharField(max_length=255, unique=True, db_index=True)
    title = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    gujarati_name = models.CharField(max_length=255, blank=True, null=True)
    scheme_type = models.CharField(max_length=50, choices=SCHEME_TYPE_CHOICES, default='Central', db_index=True)
    department = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    description = models.TextField()
    eligibility = models.TextField()
    benefits = models.TextField()
    required_documents = models.TextField(blank=True, null=True)
    official_website = models.URLField(max_length=500, blank=True, null=True)
    apply_link = models.URLField(max_length=500, blank=True, null=True)
    farmer_category = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    crop_category = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    category = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    district = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active', db_index=True)
    start_date = models.DateField(blank=True, null=True, db_index=True)
    end_date = models.DateField(blank=True, null=True, db_index=True)
    featured = models.BooleanField(default=False, db_index=True)
    is_deleted = models.BooleanField(default=False, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.scheme_name and self.title:
            self.scheme_name = self.title
        elif not self.title and self.scheme_name:
            self.title = self.scheme_name
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title or self.scheme_name

    class Meta:
        ordering = ['-featured', 'scheme_name']

