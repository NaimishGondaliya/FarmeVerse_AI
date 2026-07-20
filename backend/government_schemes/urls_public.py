from django.urls import path
from .views import SchemePublicListView, GovernmentSchemeDetailView

urlpatterns = [
    path('', SchemePublicListView.as_view(), name='public-list'),
    path('<int:pk>/', GovernmentSchemeDetailView.as_view(), name='public-detail'),
]
