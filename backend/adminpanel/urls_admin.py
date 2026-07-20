from django.urls import path
from .views_profile import (
    AdminProfileView,
    AdminChangePasswordView,
    AdminProfilePhotoView
)

urlpatterns = [
    path('profile/', AdminProfileView.as_view(), name='admin-profile'),
    path('profile/photo/', AdminProfilePhotoView.as_view(), name='admin-profile-photo'),
    path('change-password/', AdminChangePasswordView.as_view(), name='admin-change-password'),
]
