"""
FarmVerse AI URL Configuration

The `urlpatterns` list routes URLs to api endpoints. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from authentication.views import create_admin_view

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Temporary secure endpoint to create production superuser
    path('create-admin/', create_admin_view, name='create-admin'),
    
    # Unified API Endpoints for FarmVerse AI modules
    path('api/auth/', include('authentication.urls')),
    path('api/users/', include('users.urls')),
    path('api/farmer/', include('farmer.urls')),
    path('api/expert/', include('expert.urls')),
    path('api/adminpanel/', include('adminpanel.urls')),
    path('api/crop-management/', include('crop_management.urls')),
    path('api/farm-records/', include('farm_records.urls')),
    path('api/market-prices/', include('market_prices.urls')),
    path('api/weather/', include('weather.urls')),
    path('api/disease-detection/', include('disease_detection.urls')),
    path('api/crop-recommendation/', include('crop_recommendation.urls')),
    path('api/government-schemes/', include('government_schemes.urls')),
    path('api/schemes/', include('government_schemes.urls_public')),
    path('api/admin/schemes/', include('government_schemes.urls_admin')),
    path('api/admin/', include('adminpanel.urls_admin')),
    path('api/analytics/', include('analytics.urls')),
    path('api/admin/analytics/', include(('analytics.urls', 'admin_analytics'), namespace='admin_analytics')),
    path('api/consultation/', include('consultation.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
