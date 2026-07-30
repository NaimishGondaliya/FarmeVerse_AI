from django.urls import path
from .views import (
    PingFarmerView,
    FarmListCreateView, FarmDetailView,
    CropListCreateView, CropDetailView,
    ExpenseListCreateView, ExpenseDetailView,
    SalesListCreateView, SalesDetailView,
    NotificationListView, NotificationDetailView
)
app_name = 'farmer'

urlpatterns = [
    path('ping/', PingFarmerView.as_view(), name='ping'),
    path('farms/', FarmListCreateView.as_view(), name='farms'),
    path('farms/<int:pk>/', FarmDetailView.as_view(), name='farm_detail'),
    path('crops/', CropListCreateView.as_view(), name='crops'),
    path('crops/<int:pk>/', CropDetailView.as_view(), name='crop_detail'),
    path('expenses/', ExpenseListCreateView.as_view(), name='expenses'),
    path('expenses/<int:pk>/', ExpenseDetailView.as_view(), name='expense_detail'),
    path('sales/', SalesListCreateView.as_view(), name='sales'),
    path('sales/<int:pk>/', SalesDetailView.as_view(), name='sales_detail'),
]


