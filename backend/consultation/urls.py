from django.urls import path
from .views import (
    PingConsultationView,
    ConsultationCreateListView,
    ExpertInboxView,
    ConsultationDetailView,
    ConsultationReplyView,
    ConsultationCloseView
)

app_name = 'consultation'

urlpatterns = [
    path('ping/', PingConsultationView.as_view(), name='ping'),
    path('', ConsultationCreateListView.as_view(), name='create-list'),
    path('farmer/', ConsultationCreateListView.as_view(), name='farmer-list'),
    path('expert/', ExpertInboxView.as_view(), name='expert-list'),
    path('<int:pk>/', ConsultationDetailView.as_view(), name='detail'),
    path('<int:pk>/reply/', ConsultationReplyView.as_view(), name='reply'),
    path('<int:pk>/close/', ConsultationCloseView.as_view(), name='close'),
]
