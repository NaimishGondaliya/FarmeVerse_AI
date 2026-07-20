from django.urls import path
from .views import PingUsersView

app_name = 'users'

urlpatterns = [
    path('ping/', PingUsersView.as_view(), name='ping'),
]
