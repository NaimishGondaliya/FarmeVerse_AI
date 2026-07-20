from django.urls import path
from .views import PingFarmRecordsView

app_name = 'farm_records'

urlpatterns = [
    path('ping/', PingFarmRecordsView.as_view(), name='ping'),
]
