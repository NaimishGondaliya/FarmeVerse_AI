from django.urls import path
from .views import (
    PingAnalyticsView,
    AdminAnalyticsDashboardView,
    AdminAnalyticsChartsView,
    AdminAnalyticsExportView
)

app_name = 'analytics'

urlpatterns = [
    path('ping/', PingAnalyticsView.as_view(), name='ping'),
    path('dashboard/', AdminAnalyticsDashboardView.as_view(), name='dashboard'),
    path('charts/', AdminAnalyticsChartsView.as_view(), name='charts'),
    path('export/', AdminAnalyticsExportView.as_view(), name='export'),
]
