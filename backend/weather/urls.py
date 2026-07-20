from django.urls import path
from .views import PingWeatherView, CurrentWeatherView

app_name = 'weather'

urlpatterns = [
    path('ping/', PingWeatherView.as_view(), name='ping'),
    path('current/', CurrentWeatherView.as_view(), name='current'),
]
