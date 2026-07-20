from django.urls import path
from .views import PingCommonView

app_name = 'common'

urlpatterns = [
    path('ping/', PingCommonView.as_view(), name='ping'),
]
