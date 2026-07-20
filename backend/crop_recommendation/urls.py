from django.urls import path
from .views import PingCropRecommendationView, CropRecommendationPredictView

app_name = 'crop_recommendation'

urlpatterns = [
    path('ping/', PingCropRecommendationView.as_view(), name='ping'),
    path('predict/', CropRecommendationPredictView.as_view(), name='predict'),
]
