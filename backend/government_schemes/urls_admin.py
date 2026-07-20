from django.urls import path
from .views import AdminSchemeStatsView, AdminSchemeListView, AdminSchemeDetailView

urlpatterns = [
    path('stats/', AdminSchemeStatsView.as_view(), name='admin-stats'),
    path('', AdminSchemeListView.as_view(), name='admin-list'),
    path('<int:pk>/', AdminSchemeDetailView.as_view(), name='admin-detail'),
]
