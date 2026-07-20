from django.urls import path
from .views import (
    PingExpertView,
    ExpertListView,
    ExpertSearchView,
    ExpertDistrictsView,
    ExpertDetailView,
    ExpertRegisterView,
    ExpertLoginView,
    ExpertDashboardView
)

app_name = 'expert'

urlpatterns = [
    path('ping/', PingExpertView.as_view(), name='ping'),
    path('', ExpertListView.as_view(), name='list'),
    path('register/', ExpertRegisterView.as_view(), name='register'),
    path('login/', ExpertLoginView.as_view(), name='login'),
    path('dashboard/', ExpertDashboardView.as_view(), name='dashboard'),
    path('search/', ExpertSearchView.as_view(), name='search'),
    path('districts/', ExpertDistrictsView.as_view(), name='districts'),
    path('<int:pk>/', ExpertDetailView.as_view(), name='detail'),
]


