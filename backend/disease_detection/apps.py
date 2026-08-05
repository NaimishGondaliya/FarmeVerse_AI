from django.apps import AppConfig


class DiseaseDetectionConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'disease_detection'

    def ready(self):
        import disease_detection.signals
