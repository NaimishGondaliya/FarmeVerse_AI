from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .models import MarketPrice
from .serializers import MarketPriceSerializer
from .services import AgmarknetService, get_markets_by_district, get_supported_commodities, search_prices


class PingMarketPricesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            {"status": "online", "message": "Welcome to FarmVerse AI - MarketPrices module API"}, 
            status=status.HTTP_200_OK
        )

class MarketPriceListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        import datetime
        date_str = request.query_params.get('date', None)
        if date_str:
            try:
                prices = MarketPrice.objects.filter(price_date=date_str)
            except Exception:
                prices = MarketPrice.objects.none()
        else:
            prices = AgmarknetService.get_todays_prices()
            
        prices_list = list(prices)
        today = datetime.date.today()
        for p in prices_list:
            if p.price_date != today:
                p.source = "Showing latest available Government market data"
        
        serializer = MarketPriceSerializer(prices_list, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class MarketPriceQueryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        import datetime
        crop = request.query_params.get('crop', None)
        market = request.query_params.get('market', None)
        
        queryset = MarketPrice.objects.all()
        latest_date = queryset.order_by('-price_date').first()
        if latest_date:
            queryset = queryset.filter(price_date=latest_date.price_date)
            
        if crop:
            queryset = queryset.filter(crop_name__iexact=crop)
        if market:
            queryset = queryset.filter(market_name__iexact=market)
            
        prices_list = list(queryset)
        today = datetime.date.today()
        for p in prices_list:
            if p.price_date != today:
                p.source = "Showing latest available Government market data"
            
        serializer = MarketPriceSerializer(prices_list, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class MarketPriceRefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        import datetime
        result = AgmarknetService.refresh_prices()
        
        latest_date = datetime.date.fromisoformat(result["latest_date"])
        prices = MarketPrice.objects.filter(price_date=latest_date)
        
        prices_list = list(prices)
        today = datetime.date.today()
        for p in prices_list:
            if p.price_date != today:
                p.source = "Showing latest available Government market data"
                
        serializer = MarketPriceSerializer(prices_list, many=True)
        
        response_data = {
            "success": result["success"],
            "source": result["source"],
            "latest_date": result["latest_date"],
            "rows_imported": result["rows_imported"],
            "message": "Market prices refreshed successfully.",
            "data": serializer.data
        }
        if "warning" in result:
            response_data["warning"] = result["warning"]
            
        return Response(response_data, status=status.HTTP_200_OK)

class MarketDistrictsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        qs = MarketPrice.objects.values_list('district_name', flat=True).exclude(district_name__isnull=True).exclude(district_name='').distinct().order_by('district_name')
        districts = list(qs)
        if not districts:
            districts = [
                "Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha",
                "Bharuch", "Bhavnagar", "Botad", "Chhota Udepur", "Dahod",
                "Dang", "Devbhumi Dwarka", "Gandhinagar", "Gir Somnath",
                "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar",
                "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal",
                "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat",
                "Surendranagar", "Tapi", "Vadodara", "Valsad"
            ]
        return Response(districts, status=status.HTTP_200_OK)

class MarketsByDistrictView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        district = request.query_params.get('district', None)
        markets = get_markets_by_district(district)
        return Response(markets, status=status.HTTP_200_OK)


class MarketCommoditiesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        commodities = get_supported_commodities()
        return Response(commodities, status=status.HTTP_200_OK)


class MarketPriceSearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        district = request.query_params.get('district', None)
        market = request.query_params.get('market', None)
        commodity = request.query_params.get('commodity', None)
        date_str = request.query_params.get('date', None)
        
        response_data = search_prices(district, market, commodity, date_str)
        if not response_data["valid"]:
            return Response(
                {"success": False, "message": response_data["error_msg"]},
                status=response_data["status"]
            )
            
        return Response(response_data["data"], status=status.HTTP_200_OK)