from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver
from .models import User
from farmer.utils import create_notification

@receiver(post_delete, sender=User)
def user_deleted_notification(sender, instance, **kwargs):
    # Only notify for Farmer or Expert deletions if managed via User model.
    if instance.role in ['Farmer', 'Expert']:
        admins = User.objects.filter(role='Admin')
        for admin in admins:
            create_notification(
                user=admin,
                title=f"{instance.role} Account Deleted",
                message=f"The {instance.role.lower()} account for {instance.full_name} ({instance.email}) has been removed."
            )
