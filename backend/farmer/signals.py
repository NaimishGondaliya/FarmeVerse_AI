from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Crop, Expense, Sales
from .utils import create_notification

@receiver(post_delete, sender=Crop)
def crop_deleted_notification(sender, instance, **kwargs):
    create_notification(
        user=instance.farm.farmer,
        title="Crop Deleted (પાક દૂર કર્યો)",
        message=f"તમારા ખેતરમાંથી '{instance.crop_name}' નો પાક દૂર કરવામાં આવ્યો છે."
    )

@receiver(post_save, sender=Expense)
def expense_added_notification(sender, instance, created, **kwargs):
    if created and instance.description != 'Auto-synced from crop records':
        create_notification(
            user=instance.crop.farm.farmer,
            title="Expense Added (ખર્ચ નોંધાઈ)",
            message=f"તમારા પાક '{instance.crop.crop_name}' માટે ₹{instance.amount} નો ખર્ચ ({instance.expense_type}) ઉમેરવામાં આવ્યો છે."
        )

# Note: Sales is already triggering notification in its save() method.
# Profit updated logic is naturally a byproduct of Sales added or Expense added.
