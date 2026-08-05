from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import AgricultureExpert # Wait, the model is just AgricultureExpert
from django.contrib.auth import get_user_model
from farmer.utils import create_notification

User = get_user_model()

@receiver(post_save, sender=AgricultureExpert)
def expert_saved_notification(sender, instance, created, **kwargs):
    if created:
        admins = User.objects.filter(role='Admin')
        for admin in admins:
            create_notification(
                user=admin,
                title="New Expert Registered",
                message=f"Expert '{instance.name}' ({instance.specialization}) has been registered."
            )
        create_notification(
            expert=instance,
            title="Profile Created",
            message=f"Welcome {instance.name}! Your expert profile is now active on FarmVerse."
        )
    else:
        # Profile Updated
        create_notification(
            expert=instance,
            title="Profile Updated",
            message=f"Your expert profile has been successfully updated."
        )

@receiver(post_delete, sender=AgricultureExpert)
def expert_deleted_notification(sender, instance, **kwargs):
    admins = User.objects.filter(role='Admin')
    for admin in admins:
        create_notification(
            user=admin,
            title="Expert Deleted",
            message=f"Expert '{instance.name}' ({instance.email}) was deleted from the system."
        )
