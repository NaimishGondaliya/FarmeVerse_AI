from django.urls import path
from .views import PingCropManagementView

app_name = 'crop_management'

urlpatterns = [
    path('ping/', PingCropManagementView.as_view(), name='ping'),
]
