from django.urls import path
from .views import (
    PingAdminpanelView,
    AdminExpertStatsView,
    AdminExpertListCreateView,
    AdminExpertDetailView,
    AdminExpertStatusView,
    AdminConsultationStatsView,
    AdminConsultationListView,
    AdminConsultationDetailView,
    AdminConsultationStatusView
)

app_name = 'adminpanel'

urlpatterns = [
    path('ping/', PingAdminpanelView.as_view(), name='ping'),

    # Expert Management
    path('experts/stats/', AdminExpertStatsView.as_view(), name='expert-stats'),
    path('experts/', AdminExpertListCreateView.as_view(), name='expert-list-create'),
    path('experts/<int:pk>/', AdminExpertDetailView.as_view(), name='expert-detail'),
    path('experts/<int:pk>/status/', AdminExpertStatusView.as_view(), name='expert-status'),

    # Consultation Center Management
    path('consultations/stats/', AdminConsultationStatsView.as_view(), name='consultation-stats'),
    path('consultations/', AdminConsultationListView.as_view(), name='consultation-list'),
    path('consultations/<int:pk>/', AdminConsultationDetailView.as_view(), name='consultation-detail'),
    path('consultations/<int:pk>/status/', AdminConsultationStatusView.as_view(), name='consultation-status'),
]
