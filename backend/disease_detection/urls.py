from django.urls import path
from .views import (
    PingDiseaseDetectionView,
    DiseaseDetectionUploadView,
    DiseaseDetectionPredictView,
    DiseaseDetectionHistoryView,
    DiseaseDetectionDetailView
)

app_name = 'disease_detection'

urlpatterns = [
    path('ping/', PingDiseaseDetectionView.as_view(), name='ping'),
    path('upload/', DiseaseDetectionUploadView.as_view(), name='upload'),
    path('predict/', DiseaseDetectionPredictView.as_view(), name='predict'),
    path('history/', DiseaseDetectionHistoryView.as_view(), name='history'),
    path('history/<int:pk>/', DiseaseDetectionDetailView.as_view(), name='history-detail'),
]

