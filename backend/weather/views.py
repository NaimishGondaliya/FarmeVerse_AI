from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .services import (
    get_current_weather,
    WeatherServiceError,
    MissingAPIKeyError,
    InvalidCityError,
    WeatherAPITimeoutError,
    WeatherConnectionError,
    OpenWeatherAPIError
)

class PingWeatherView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            {"status": "online", "message": "Welcome to FarmVerse AI - Weather module API placeholder"}, 
            status=status.HTTP_200_OK
        )

class CurrentWeatherView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        city = request.query_params.get('city')
        lat = request.query_params.get('lat')
        lon = request.query_params.get('lon')

        if not city and not (lat and lon):
            return Response(
                {"error": "City or lat/lon parameters are required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            weather_data = get_current_weather(city=city, lat=lat, lon=lon)
            # Save telemetry log record
            try:
                from .models import WeatherRequestLog
                user_val = request.user if request.user and request.user.is_authenticated else None
                temp = weather_data.get('main', {}).get('temp') if isinstance(weather_data, dict) else None
                cond = weather_data.get('weather', [{}])[0].get('main') if isinstance(weather_data, dict) and weather_data.get('weather') else None
                WeatherRequestLog.objects.create(
                    user=user_val,
                    city=city,
                    temperature=temp,
                    condition=cond
                )
            except Exception as log_err:
                pass
                
            return Response(weather_data, status=status.HTTP_200_OK)
        except MissingAPIKeyError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except InvalidCityError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_404_NOT_FOUND
            )
        except WeatherAPITimeoutError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_504_GATEWAY_TIMEOUT
            )
        except WeatherConnectionError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except OpenWeatherAPIError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_502_BAD_GATEWAY
            )
        except WeatherServiceError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            return Response(
                {"error": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
