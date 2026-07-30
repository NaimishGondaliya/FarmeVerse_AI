from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .models import MarketPrice
from .serializers import MarketPriceSerializer
from .services import (
    get_todays_prices,
    refresh_all_scrapers,
    get_markets_by_district,
    get_supported_commodities,
    search_prices,
)


class PingMarketPricesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            {"status": "online", "message": "Welcome to FarmVerse AI - MarketPrices module API"},
            status=status.HTTP_200_OK,
        )


class MarketPriceListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        import datetime

        date_str = request.query_params.get("date", None)
        if date_str:
            try:
                # Some API uses DD-MM-YYYY or YYYY-MM-DD
                try:
                    target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
                except ValueError:
                    target_date = datetime.datetime.strptime(date_str, "%d-%m-%Y").date()
                    
                if not MarketPrice.objects.filter(price_date=target_date).exists():
                    refresh_all_scrapers(target_date)
                prices = MarketPrice.objects.filter(price_date=target_date)
            except Exception as e:
                prices = MarketPrice.objects.none()
        else:
            prices = get_todays_prices()

        prices_list = list(prices)
        today = datetime.date.today()
        for p in prices_list:
            if p.price_date != today:
                p.source = "Official APMC Latest Available"

        serializer = MarketPriceSerializer(prices_list, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MarketPriceQueryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        import datetime

        crop = request.query_params.get("crop", None)
        market = request.query_params.get("market", None)

        queryset = MarketPrice.objects.all().order_by("-price_date")

        if crop:
            queryset = queryset.filter(crop_name__iexact=crop)
        if market:
            queryset = queryset.filter(market_name__iexact=market)

        # Get latest price record per (market, crop)
        prices_list = []
        seen = set()
        for p in queryset:
            key = (p.market_name, p.crop_name)
            if key not in seen:
                seen.add(key)
                prices_list.append(p)
        today = datetime.date.today()
        for p in prices_list:
            if p.price_date != today:
                p.source = "Official APMC Latest Available"

        serializer = MarketPriceSerializer(prices_list, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MarketPriceRefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        import datetime

        result = refresh_all_scrapers()

        # Fetch the latest available records independently per market and crop
        queryset = MarketPrice.objects.all().order_by("-price_date")
        prices_list = []
        seen = set()
        for p in queryset:
            key = (p.market_name, p.crop_name)
            if key not in seen:
                seen.add(key)
                prices_list.append(p)
        today = datetime.date.today()
        for p in prices_list:
            if p.price_date != today:
                p.source = "Official APMC Latest Available"

        serializer = MarketPriceSerializer(prices_list, many=True)

        response_data = {
            "success": result["success"],
            "source": result["source"],
            "latest_date": result["latest_date"],
            "rows_imported": result["rows_imported"],
            "markets_status": result.get("markets_status", {}),
            "message": "Market prices refreshed successfully.",
            "data": serializer.data,
        }
        if "warning" in result:
            response_data["warning"] = result["warning"]

        return Response(response_data, status=status.HTTP_200_OK)


class MarketDistrictsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Return only districts that contain supported APMC markets
        qs = (
            MarketPrice.objects.values_list("district_name", flat=True)
            .exclude(district_name__isnull=True)
            .exclude(district_name="")
            .distinct()
            .order_by("district_name")
        )
        districts = list(qs)
        if not districts:
            # Hardcoded fallback for the 2 supported districts
            districts = ["Rajkot"]
        return Response(districts, status=status.HTTP_200_OK)


class MarketsByDistrictView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        district = request.query_params.get("district", None)
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
        district = request.query_params.get("district", None)
        market = request.query_params.get("market", None)
        commodity = request.query_params.get("commodity", None)
        date_str = request.query_params.get("date", None)

        response_data = search_prices(district, market, commodity, date_str)
        if not response_data["valid"]:
            return Response(
                {"success": False, "message": response_data["error_msg"]},
                status=response_data["status"],
            )

        return Response(response_data["data"], status=status.HTTP_200_OK)


class MarketPriceAnalyticsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        from django.db.models import Max, Min, Avg, Count
        
        market = request.query_params.get("market")
        crop = request.query_params.get("crop")
        from_date = request.query_params.get("from_date")
        to_date = request.query_params.get("to_date")

        qs = MarketPrice.objects.all()

        if market:
            qs = qs.filter(market_name__iexact=market)
        if crop:
            qs = qs.filter(crop_name__iexact=crop)
        if from_date:
            qs = qs.filter(price_date__gte=from_date)
        if to_date:
            qs = qs.filter(price_date__lte=to_date)

        agg = qs.aggregate(
            highest=Max('max_price'),
            lowest=Min('min_price'),
            avg=Avg('modal_price'),
            count=Count('id')
        )

        total_records = agg['count'] or 0
        if total_records == 0:
            return Response({
                "highest_price": 0,
                "lowest_price": 0,
                "average_price": 0,
                "latest_price": 0,
                "price_difference": 0,
                "total_records": 0,
                "trend": "STABLE"
            }, status=status.HTTP_200_OK)

        # Get latest and oldest for trend and difference calculation
        # Order by price_date returning dicts for minimal memory load
        date_bound_qs = qs.order_by('price_date').values_list('modal_price', flat=True)
        oldest_price = date_bound_qs.first()
        latest_price = date_bound_qs.last()
        
        diff = 0
        if latest_price and oldest_price:
            diff = latest_price - oldest_price

        trend = "STABLE"
        if diff > 0:
            trend = "UP"
        elif diff < 0:
            trend = "DOWN"

        return Response({
            "highest_price": round(agg['highest'], 2) if agg['highest'] else 0,
            "lowest_price": round(agg['lowest'], 2) if agg['lowest'] else 0,
            "average_price": round(agg['avg'], 2) if agg['avg'] else 0,
            "latest_price": round(latest_price, 2) if latest_price else 0,
            "price_difference": round(diff, 2),
            "total_records": total_records,
            "trend": trend
        }, status=status.HTTP_200_OK)