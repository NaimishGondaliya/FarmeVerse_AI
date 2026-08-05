from farmer.models import Notification

def create_notification(user=None, expert=None, title="", message=""):
    """
    Helper function to dispatch notifications to either a farmer(user)/admin or expert.
    """
    # Defensive check
    if not user and not expert:
        return

    Notification.objects.create(
        user=user,
        expert=expert,
        title=title,
        message=message
    )
