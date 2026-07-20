from django.db import models
from django.conf import settings
from expert.models import AgricultureExpert

class Consultation(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Replied', 'Replied'),
        ('Closed', 'Closed'),
    )

    farmer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='farmer_consultations',
        db_index=True
    )
    expert = models.ForeignKey(
        AgricultureExpert,
        on_delete=models.CASCADE,
        related_name='expert_consultations',
        db_index=True
    )
    subject = models.CharField(max_length=255)
    message = models.TextField()
    image = models.ImageField(upload_to='consultations/', null=True, blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='Pending', db_index=True)
    created_date = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_date = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False, db_index=True)

    class Meta:
        ordering = ['-created_date']
        db_table = 'consultation'

    def __str__(self):
        return f"Consultation {self.id}: {self.subject} ({self.status})"


class ConsultationReply(models.Model):
    SENDER_CHOICES = (
        ('Farmer', 'Farmer'),
        ('Expert', 'Expert'),
    )

    consultation = models.ForeignKey(
        Consultation,
        on_delete=models.CASCADE,
        related_name='replies',
        db_index=True
    )
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES, db_index=True)
    message = models.TextField()
    created_date = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['created_date']
        db_table = 'consultation_reply'

    def __str__(self):
        return f"Reply {self.id} on Consultation {self.consultation_id} by {self.sender}"
