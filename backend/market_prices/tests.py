from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from datetime import date
from decimal import Decimal
from unittest.mock import patch

from .models import MarketPrice

class MarketPriceModelTest(TestCase):
    def setUp(self):
        self.price = MarketPrice.objects.create(
            market_name="Gondal APMC",
            crop_name="Cotton",
            min_price=Decimal("6000.00"),
            max_price=Decimal("7500.00"),
            modal_price=Decimal("6800.00"),
            arrival_quantity=Decimal("150.00"),
            price_date=date.today(),
            source="AGMARKNET (Cached Fallback)"
        )

    def test_market_price_creation(self):
        self.assertEqual(self.price.market_name, "Gondal APMC")
        self.assertEqual(self.price.crop_name, "Cotton")
        self.assertEqual(self.price.modal_price, Decimal("6800.00"))
        self.assertEqual(str(self.price), "Cotton @ Gondal APMC ({}): 6800.00".format(date.today()))


class MarketPriceAPITests(APITestCase):
    def setUp(self):
        self.price1 = MarketPrice.objects.create(
            market_name="Gondal APMC",
            crop_name="Cotton",
            min_price=Decimal("6000.00"),
            max_price=Decimal("7500.00"),
            modal_price=Decimal("6800.00"),
            arrival_quantity=Decimal("150.00"),
            price_date=date.today(),
            source="AGMARKNET Live"
        )
        self.price2 = MarketPrice.objects.create(
            market_name="Rajkot APMC",
            crop_name="Groundnut",
            min_price=Decimal("6500.00"),
            max_price=Decimal("8000.00"),
            modal_price=Decimal("7250.00"),
            arrival_quantity=Decimal("120.00"),
            price_date=date.today(),
            source="AGMARKNET Live"
        )

    def test_get_latest_prices(self):
        url = reverse('market_prices:latest')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should return both records
        self.assertEqual(len(response.data), 2)

    def test_get_prices_by_crop(self):
        url = reverse('market_prices:by-crop')
        response = self.client.get(url, {'crop': 'Cotton'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['crop_name'], 'Cotton')

    def test_get_prices_by_market(self):
        url = reverse('market_prices:by-market')
        response = self.client.get(url, {'market': 'Rajkot APMC'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['market_name'], 'Rajkot APMC')

    def test_post_refresh_prices(self):
        url = reverse('market_prices:refresh')
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)
        self.assertIn("data", response.data)
        # Verify database is populated for today's date
        self.assertTrue(MarketPrice.objects.filter(price_date=date.today()).exists())

    def test_get_prices_by_date(self):
        from datetime import timedelta
        yesterday = date.today() - timedelta(days=1)
        MarketPrice.objects.create(
            market_name="Gondal APMC",
            crop_name="Wheat",
            min_price=Decimal("2200.00"),
            max_price=Decimal("2600.00"),
            modal_price=Decimal("2400.00"),
            arrival_quantity=Decimal("300.00"),
            price_date=yesterday,
            source="AGMARKNET Live"
        )
        
        # Test base route GET /api/market-prices/?date=YYYY-MM-DD
        url = reverse('market_prices:list')
        
        # 1. Fetch yesterday's
        response = self.client.get(url, {'date': str(yesterday)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['crop_name'], 'Wheat')
        
        # 2. Fetch today's
        response = self.client.get(url, {'date': str(date.today())})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        
        # 3. Fetch future date (empty)
        tomorrow = date.today() + timedelta(days=1)
        response = self.client.get(url, {'date': str(tomorrow)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_get_districts(self):
        url = reverse('market_prices:districts')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("Ahmedabad", response.data)
        self.assertIn("Valsad", response.data)
        self.assertEqual(len(response.data), 33)

    def test_get_markets(self):
        url = reverse('market_prices:markets')
        
        # Test valid district: Rajkot
        response = self.client.get(url, {'district': 'Rajkot'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 5)
        self.assertEqual(response.data[0]['id'], 'Gondal')
        self.assertEqual(response.data[0]['name'], 'Gondal APMC')
        self.assertEqual(response.data[1]['id'], 'Rajkot')
        self.assertEqual(response.data[1]['name'], 'Rajkot APMC')
        
        # Test case-insensitivity: rajkot
        response_case = self.client.get(url, {'district': 'rajkot'})
        self.assertEqual(response_case.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response_case.data), 5)
        
        # Test invalid district
        response_invalid = self.client.get(url, {'district': 'InvalidDistrict'})
        self.assertEqual(response_invalid.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response_invalid.data), 0)

        # Test empty parameter
        response_empty = self.client.get(url)
        self.assertEqual(response_empty.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response_empty.data), 0)

    def test_get_commodities(self):
        url = reverse('market_prices:commodities')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 6)
        
        # Verify first item
        self.assertEqual(response.data[0]['id'], 'Cotton')
        self.assertEqual(response.data[0]['name'], 'Cotton')
        self.assertEqual(response.data[0]['gujarati'], 'કપાસ')
        
        # Verify specific item presence
        commodity_ids = [item['id'] for item in response.data]
        self.assertIn('Groundnut', commodity_ids)
        self.assertIn('Cumin', commodity_ids)
        self.assertIn('Wheat', commodity_ids)
        self.assertIn('Mustard', commodity_ids)
        self.assertIn('Castor Seed', commodity_ids)

    def test_search_prices_validation_error(self):
        url = reverse('market_prices:search')
        
        # Missing date
        response = self.client.get(url, {'district': 'Rajkot', 'market': 'Gondal', 'commodity': 'Cotton'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('Missing query parameters', response.data['message'])
        
        # Invalid date format
        response = self.client.get(url, {'district': 'Rajkot', 'market': 'Gondal', 'commodity': 'Cotton', 'date': '09-07-2026'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('Invalid date format', response.data['message'])

        # Invalid district
        response = self.client.get(url, {'district': 'InvalidDistrict', 'market': 'Gondal', 'commodity': 'Cotton', 'date': '2026-07-09'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('not supported', response.data['message'])

    def test_search_prices_success_db(self):
        # Create historical record
        historical_date = date(2026, 7, 8)
        MarketPrice.objects.create(
            market_name="Gondal APMC",
            crop_name="Cotton",
            min_price=Decimal("5600.00"),
            max_price=Decimal("7800.00"),
            modal_price=Decimal("7000.00"),
            arrival_quantity=Decimal("120.00"),
            price_date=historical_date,
            source="AGMARKNET"
        )
        
        url = reverse('market_prices:search')
        response = self.client.get(url, {
            'district': 'Rajkot',
            'market': 'Gondal',
            'commodity': 'Cotton',
            'date': '2026-07-08'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['district'], 'Rajkot')
        self.assertEqual(response.data['market'], 'Gondal APMC')
        self.assertEqual(response.data['commodity'], 'Cotton')
        self.assertEqual(response.data['minimum_price'], 5600)
        self.assertEqual(response.data['maximum_price'], 7800)
        self.assertEqual(response.data['modal_price'], 7000)
        self.assertEqual(response.data['arrival_quantity'], 120)
        self.assertEqual(response.data['source'], 'AGMARKNET')

    def test_search_prices_not_found(self):
        url = reverse('market_prices:search')
        response = self.client.get(url, {
            'district': 'Rajkot',
            'market': 'Gondal',
            'commodity': 'Cotton',
            'date': '2026-07-01'  # No historical record
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['success'])
        self.assertEqual(response.data['message'], 'No market prices available for selected date.')

    @patch('market_prices.services.scrape_live_agmarknet')
    def test_search_prices_today_success(self, mock_scrape):
        today_date_str = str(date.today())
        # Setup mock scraper data
        mock_scrape.return_value = [
            {
                "market_name": "Gondal APMC",
                "crop_name": "Cotton",
                "min_price": Decimal("5700.00"),
                "max_price": Decimal("7810.00"),
                "modal_price": Decimal("7050.00"),
                "arrival_quantity": Decimal("128.00"),
                "source": "AGMARKNET"
            }
        ]
        
        url = reverse('market_prices:search')
        response = self.client.get(url, {
            'district': 'Rajkot',
            'market': 'Gondal',
            'commodity': 'Cotton',
            'date': today_date_str
        })
        
        mock_scrape.assert_called_once()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['district'], 'Rajkot')
        self.assertEqual(response.data['market'], 'Gondal APMC')
        self.assertEqual(response.data['minimum_price'], 5700)
        self.assertEqual(response.data['maximum_price'], 7810)
        self.assertEqual(response.data['modal_price'], 7050)
        self.assertEqual(response.data['arrival_quantity'], 128)
        self.assertEqual(response.data['source'], 'AGMARKNET')
        
        # Verify db cache write
        db_record = MarketPrice.objects.get(
            market_name="Gondal APMC",
            crop_name="Cotton",
            price_date=date.today()
        )
        self.assertEqual(db_record.modal_price, Decimal("7050.00"))

    @patch('market_prices.services.scrape_live_agmarknet')
    def test_search_prices_today_agmarknet_failure(self, mock_scrape):
        today_date_str = str(date.today())
        mock_scrape.return_value = None  # Simulate failure
        
        url = reverse('market_prices:search')
        response = self.client.get(url, {
            'district': 'Rajkot',
            'market': 'Gondal',
            'commodity': 'Cotton',
            'date': today_date_str
        })
        
        mock_scrape.assert_called_once()
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertFalse(response.data['success'])
        self.assertEqual(response.data['message'], 'Unable to fetch live AGMARKNET data.')




