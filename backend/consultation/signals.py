from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Consultation, ConsultationReply
from farmer.utils import create_notification

@receiver(post_save, sender=Consultation)
def consultation_status_notification(sender, instance, created, **kwargs):
    if created:
        # Notify Expert when Farmer creates a new consultation
        create_notification(
            expert=instance.expert,
            title="New Consultation Request",
            message=f"New consultation request from {instance.farmer.username or instance.farmer.email} regarding '{instance.subject}'."
        )
    else:
        # Check if status has changed to Closed
        if instance.status == 'Closed':
            create_notification(
                expert=instance.expert,
                title="Consultation Closed",
                message=f"Consultation '{instance.subject}' has been closed by {instance.farmer.username or instance.farmer.email}."
            )
            create_notification(
                user=instance.farmer,
                title="Consultation Closed",
                message=f"Your consultation '{instance.subject}' has been closed."
            )

@receiver(post_save, sender=ConsultationReply)
def consultation_reply_notification(sender, instance, created, **kwargs):
    if created:
        if instance.sender == 'Farmer':
            create_notification(
                expert=instance.consultation.expert,
                title="New Message Received",
                message=f"New message from {instance.consultation.farmer.username or instance.consultation.farmer.email} in '{instance.consultation.subject}'."
            )
        elif instance.sender == 'Expert':
            create_notification(
                user=instance.consultation.farmer,
                title="Expert Reply Received",
                message=f"New reply from Expert {instance.consultation.expert.user.username or instance.consultation.expert.user.email} in '{instance.consultation.subject}'."
            )
