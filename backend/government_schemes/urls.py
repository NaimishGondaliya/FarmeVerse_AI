from django.urls import path
from .views import (
    PingGovernmentSchemesView,
    GovernmentSchemeListView,
    GovernmentSchemeSearchView,
    GovernmentSchemeCategoriesView,
    GovernmentSchemeDetailView
)

app_name = 'government_schemes'

urlpatterns = [
    path('ping/', PingGovernmentSchemesView.as_view(), name='ping'),
    path('', GovernmentSchemeListView.as_view(), name='list'),
    path('search/', GovernmentSchemeSearchView.as_view(), name='search'),
    path('categories/', GovernmentSchemeCategoriesView.as_view(), name='categories'),
    path('<int:pk>/', GovernmentSchemeDetailView.as_view(), name='detail'),
]
