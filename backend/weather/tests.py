import os
from unittest.mock import patch
import requests
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from weather.services import get_current_weather, InvalidCityError, WeatherAPITimeoutError, WeatherConnectionError, MissingAPIKeyError

class WeatherAPITests(APITestCase):

    def setUp(self):
        self.url = reverse('weather:current')
        self.mock_weather_data = {
            "coord": {"lon": 70.82, "lat": 22.3},
            "weather": [{"id": 800, "main": "Clear", "description": "clear sky", "icon": "01d"}],
            "main": {"temp": 28.5, "feels_like": 30.2, "temp_min": 28.5, "temp_max": 28.5, "pressure": 1008, "humidity": 65},
            "visibility": 10000,
            "wind": {"speed": 4.1, "deg": 260},
            "clouds": {"all": 10},
            "dt": 1626600000,
            "sys": {"country": "IN", "sunrise": 1626568800, "sunset": 1626616800},
            "name": "Rajkot"
        }

    @patch('weather.services.requests.get')
    def test_current_weather_success(self, mock_get):
        # Mock requests.get to return a successful Response
        mock_response = mock_get.return_value
        mock_response.status_code = 200
        mock_response.json.return_value = self.mock_weather_data

        response = self.client.get(self.url, {'city': 'Rajkot'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verify the returned keys match the requirements
        data = response.json()
        self.assertEqual(data['city'], 'Rajkot')
        self.assertEqual(data['temperature'], 28.5)
        self.assertEqual(data['weather_main'], 'Clear')
        self.assertEqual(data['country'], 'IN')
        self.assertEqual(data['latitude'], 22.3)
        self.assertEqual(data['longitude'], 70.82)
        self.assertEqual(data['timestamp'], 1626600000)

    @patch('weather.services.requests.get')
    def test_invalid_city(self, mock_get):
        # Mock requests.get returning 404 for invalid city
        mock_response = mock_get.return_value
        mock_response.status_code = 404
        mock_response.text = '{"cod":"404","message":"city not found"}'

        response = self.client.get(self.url, {'city': 'InvalidCityName123'})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.json())

    @patch('weather.services.requests.get')
    def test_api_timeout(self, mock_get):
        # Mock requests.get raising Timeout
        mock_get.side_effect = requests.exceptions.Timeout("Timeout error")

        response = self.client.get(self.url, {'city': 'Rajkot'})
        self.assertEqual(response.status_code, status.HTTP_504_GATEWAY_TIMEOUT)
        self.assertIn('error', response.json())

    @patch('weather.services.requests.get')
    def test_internet_failure(self, mock_get):
        # Mock requests.get raising ConnectionError
        mock_get.side_effect = requests.exceptions.ConnectionError("Connection error")

        response = self.client.get(self.url, {'city': 'Rajkot'})
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertIn('error', response.json())

    @patch('weather.services.os.getenv')
    def test_missing_api_key(self, mock_getenv):
        # Mock os.getenv to return None for OPENWEATHER_API_KEY
        mock_getenv.side_effect = lambda key, default=None: None if key == 'OPENWEATHER_API_KEY' else os.environ.get(key, default)

        response = self.client.get(self.url, {'city': 'Rajkot'})
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn('error', response.json())

    def test_missing_city_param(self):
        # Call without city query param
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.json())
