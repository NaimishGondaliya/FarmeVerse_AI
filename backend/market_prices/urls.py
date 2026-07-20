# pyrefly: ignore [missing-import]
from django.urls import path
from .views import (
    PingMarketPricesView,
    MarketPriceListView,
    MarketPriceQueryView,
    MarketPriceRefreshView,
    MarketDistrictsView,
    MarketsByDistrictView,
    MarketCommoditiesView,
    MarketPriceSearchView
)

app_name = 'market_prices'

urlpatterns = [
    path('', MarketPriceListView.as_view(), name='list'),
    path('ping/', PingMarketPricesView.as_view(), name='ping'),
    path('latest/', MarketPriceListView.as_view(), name='latest'),
    path('by-crop/', MarketPriceQueryView.as_view(), name='by-crop'),
    path('by-market/', MarketPriceQueryView.as_view(), name='by-market'),
    path('refresh/', MarketPriceRefreshView.as_view(), name='refresh'),
    path('districts/', MarketDistrictsView.as_view(), name='districts'),
    path('markets/', MarketsByDistrictView.as_view(), name='markets'),
    path('commodities/', MarketCommoditiesView.as_view(), name='commodities'),
    path('search/', MarketPriceSearchView.as_view(), name='search'),
]
