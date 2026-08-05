from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import DiseaseDetection
from farmer.utils import create_notification

@receiver(post_save, sender=DiseaseDetection)
def disease_detected_notification(sender, instance, created, **kwargs):
    # Only notify if created, to avoid duplicate notifications on updates
    if created:
        status_gu = 'બીમાર' if instance.status == 'Diseased' else 'તંદુરસ્ત'
        msg = f"રોગ નિદાન પૂર્ણ: તમારું {instance.crop} નું પાન {status_gu} છે. ({instance.prediction})"
        create_notification(
            user=instance.farmer,
            title="Disease Diagnosis Completed (રોગ નિદાન)",
            message=msg
        )
