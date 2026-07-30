from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from datetime import date, timedelta
from decimal import Decimal
from unittest.mock import patch, MagicMock

from .models import MarketPrice


class MarketPriceModelTest(TestCase):
    def setUp(self):
        self.price = MarketPrice.objects.create(
            market_name="Rajkot APMC",
            district_name="Rajkot",
            crop_name="Cotton",
            crop_name_gu="કપાસ",
            min_price=Decimal("6000.00"),
            max_price=Decimal("7500.00"),
            modal_price=Decimal("6800.00"),
            arrival_quantity=Decimal("150.00"),
            price_date=date.today(),
            source="Official APMC",
        )

    def test_market_price_creation(self):
        self.assertEqual(self.price.market_name, "Rajkot APMC")
        self.assertEqual(self.price.crop_name, "Cotton")
        self.assertEqual(self.price.modal_price, Decimal("6800.00"))
        self.assertEqual(
            str(self.price),
            "Cotton @ Rajkot APMC ({}): 6800.00".format(date.today()),
        )

    def test_unique_together_constraint(self):
        """Cannot create duplicate market + crop + date."""
        from django.db import IntegrityError

        with self.assertRaises(IntegrityError):
            MarketPrice.objects.create(
                market_name="Rajkot APMC",
                crop_name="Cotton",
                crop_name_gu="કપાસ",
                min_price=Decimal("6100.00"),
                max_price=Decimal("7600.00"),
                modal_price=Decimal("6900.00"),
                price_date=date.today(),
                source="Official APMC",
            )


class MarketPriceAPITests(APITestCase):
    def setUp(self):
        self.price1 = MarketPrice.objects.create(
            market_name="Rajkot APMC",
            district_name="Rajkot",
            crop_name="Cotton",
            min_price=Decimal("6000.00"),
            max_price=Decimal("7500.00"),
            modal_price=Decimal("6800.00"),
            arrival_quantity=Decimal("150.00"),
            price_date=date.today(),
            source="Official APMC",
        )
        self.price2 = MarketPrice.objects.create(
            market_name="Rajkot APMC",
            district_name="Rajkot",
            crop_name="Groundnut",
            min_price=Decimal("6500.00"),
            max_price=Decimal("8000.00"),
            modal_price=Decimal("7250.00"),
            arrival_quantity=Decimal("120.00"),
            price_date=date.today(),
            source="Official APMC",
        )

    def test_ping(self):
        url = reverse("market_prices:ping")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "online")

    def test_get_latest_prices(self):
        url = reverse("market_prices:latest")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_get_prices_by_crop(self):
        url = reverse("market_prices:by-crop")
        response = self.client.get(url, {"crop": "Cotton"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["crop_name"], "Cotton")

    def test_get_prices_by_market(self):
        url = reverse("market_prices:by-market")
        response = self.client.get(url, {"market": "Rajkot APMC"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]["market_name"], "Rajkot APMC")

    def test_get_prices_by_date(self):
        yesterday = date.today() - timedelta(days=1)
        MarketPrice.objects.create(
            market_name="Rajkot APMC",
            district_name="Rajkot",
            crop_name="Wheat",
            min_price=Decimal("2200.00"),
            max_price=Decimal("2600.00"),
            modal_price=Decimal("2400.00"),
            arrival_quantity=Decimal("300.00"),
            price_date=yesterday,
            source="Official APMC",
        )

        url = reverse("market_prices:list")

        # Fetch yesterday's prices
        response = self.client.get(url, {"date": str(yesterday)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["crop_name"], "Wheat")

        # Fetch today's prices
        response = self.client.get(url, {"date": str(date.today())})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        # Fetch future date (empty)
        tomorrow = date.today() + timedelta(days=1)
        response = self.client.get(url, {"date": str(tomorrow)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_get_districts(self):
        url = reverse("market_prices:districts")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("Rajkot", response.data)

    def test_get_districts_fallback(self):
        """When DB is empty, return hardcoded supported districts."""
        MarketPrice.objects.all().delete()
        url = reverse("market_prices:districts")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertIn("Rajkot", response.data)

    def test_get_markets(self):
        url = reverse("market_prices:markets")

        # Rajkot district should return market(s) from DB
        response = self.client.get(url, {"district": "Rajkot"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 1)

        # Case-insensitive
        response_case = self.client.get(url, {"district": "rajkot"})
        self.assertEqual(response_case.status_code, status.HTTP_200_OK)

        # Invalid district => empty
        response_invalid = self.client.get(url, {"district": "InvalidDistrict"})
        self.assertEqual(response_invalid.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response_invalid.data), 0)

        # No parameter => empty
        response_empty = self.client.get(url)
        self.assertEqual(response_empty.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response_empty.data), 0)

    def test_get_commodities(self):
        url = reverse("market_prices:commodities")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Cotton and Wheat are inserted in setUp
        self.assertEqual(len(response.data), 2)

        commodity_ids = [item["id"] for item in response.data]
        self.assertIn("Cotton", commodity_ids)
        self.assertIn("Groundnut", commodity_ids)

    @patch("market_prices.services.refresh_all_scrapers")
    def test_post_refresh_prices(self, mock_refresh):
        mock_refresh.return_value = {
            "success": True,
            "source": "Official APMC",
            "latest_date": date.today().isoformat(),
            "rows_imported": 2,
            "markets_status": {"Rajkot APMC": "success"},
        }
        url = reverse("market_prices:refresh")
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)
        self.assertIn("data", response.data)
        self.assertEqual(response.data["source"], "Official APMC")

    @patch("market_prices.views.refresh_all_scrapers")
    def test_refresh_with_warning(self, mock_refresh):
        """When scraper returns no new data, response includes warning."""
        mock_refresh.return_value = {
            "success": True,
            "source": "Official APMC",
            "latest_date": date.today().isoformat(),
            "rows_imported": 2,
            "markets_status": {"Rajkot APMC": "no_data"},
            "warning": "Rajkot APMC website unavailable. Showing previous official data.",
        }
        url = reverse("market_prices:refresh")
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertIn("warning", response.data)


class MarketPriceSearchTests(APITestCase):
    def setUp(self):
        self.price = MarketPrice.objects.create(
            market_name="Rajkot APMC",
            district_name="Rajkot",
            crop_name="Cotton",
            min_price=Decimal("6000.00"),
            max_price=Decimal("7500.00"),
            modal_price=Decimal("6800.00"),
            arrival_quantity=Decimal("150.00"),
            price_date=date.today(),
            source="Official APMC",
        )

    def test_search_missing_params(self):
        url = reverse("market_prices:search")
        response = self.client.get(
            url, {"district": "Rajkot", "market": "Rajkot", "commodity": "Cotton"}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])
        self.assertIn("Missing query parameters", response.data["message"])

    def test_search_invalid_date(self):
        url = reverse("market_prices:search")
        response = self.client.get(
            url,
            {"district": "Rajkot", "market": "Rajkot", "commodity": "Cotton", "date": "09-07-2026"},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Invalid date format", response.data["message"])

    def test_search_invalid_district(self):
        url = reverse("market_prices:search")
        response = self.client.get(
            url,
            {"district": "InvalidDistrict", "market": "Rajkot", "commodity": "Cotton", "date": "2026-07-09"},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("not supported", response.data["message"])

    def test_search_success_historical(self):
        historical_date = date(2026, 7, 8)
        MarketPrice.objects.create(
            market_name="Rajkot APMC",
            district_name="Rajkot",
            crop_name="Cumin",
            min_price=Decimal("16000.00"),
            max_price=Decimal("20000.00"),
            modal_price=Decimal("18000.00"),
            arrival_quantity=Decimal("80.00"),
            price_date=historical_date,
            source="Official APMC",
        )

        url = reverse("market_prices:search")
        response = self.client.get(
            url,
            {"district": "Rajkot", "market": "Rajkot", "commodity": "Cumin", "date": "2026-07-08"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["district"], "Rajkot")
        self.assertEqual(response.data["market"], "Rajkot APMC")
        self.assertEqual(response.data["commodity"], "Cumin")
        self.assertEqual(response.data["minimum_price"], 16000)
        self.assertEqual(response.data["maximum_price"], 20000)
        self.assertEqual(response.data["modal_price"], 18000)
        self.assertEqual(response.data["source"], "Official APMC")

    @patch("market_prices.services.refresh_all_scrapers")
    def test_search_not_found(self, mock_refresh):
        mock_refresh.return_value = {
            "success": True,
            "source": "Official APMC",
            "latest_date": "2026-07-01",
            "rows_imported": 0,
            "markets_status": {},
        }
        url = reverse("market_prices:search")
        response = self.client.get(
            url,
            {"district": "Rajkot", "market": "Rajkot", "commodity": "Cotton", "date": "2026-07-01"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["success"])
        self.assertEqual(response.data["message"], "No market prices available for selected date.")

    @patch("market_prices.services.refresh_all_scrapers")
    def test_search_today_triggers_refresh(self, mock_refresh):
        mock_refresh.return_value = {
            "success": True,
            "source": "Official APMC",
            "latest_date": date.today().isoformat(),
            "rows_imported": 1,
            "markets_status": {"Rajkot APMC": "success"},
        }

        url = reverse("market_prices:search")
        response = self.client.get(
            url,
            {"district": "Rajkot", "market": "Rajkot", "commodity": "Cumin", "date": str(date.today())},
        )

        mock_refresh.assert_called_once()
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class RajkotScraperUnitTests(TestCase):
    """Unit tests for the RajkotScraper class."""

    @patch("requests.post")
    def test_parses_json_items(self, mock_post):
        """Correctly parses JSON data and converts Man→Quintal."""
        from .services import RajkotScraper

        # Create a mock response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "date": "28 July 2026",
            "data": [
                {"jansi_gujarati_name": "કપાસ બી.ટી.", "jansi_english_name": "Cotton", "lowrate": "1000", "highrate": "1921", "arrival": "100"},
                {"jansi_gujarati_name": "જીરૂ", "jansi_english_name": "Cumin", "lowrate": "3321", "highrate": "4056", "arrival": "50"},
                {"jansi_gujarati_name": "એરંડા", "jansi_english_name": "Castor Seed", "lowrate": "1315", "highrate": "1401", "arrival": "200"},
                {"jansi_gujarati_name": "ઘઉં લોકવન", "jansi_english_name": "Wheat", "lowrate": "480", "highrate": "581", "arrival": "300"},
                {"jansi_gujarati_name": "રાય", "jansi_english_name": "Mustard", "lowrate": "1300", "highrate": "1800", "arrival": "40"},
                {"jansi_gujarati_name": "મગફળી જાડી", "jansi_english_name": "Groundnut", "lowrate": "1240", "highrate": "1550", "arrival": "500"},
            ],
            "datas": [
                {"jansi_gujarati_name": "ટમેટા", "jansi_english_name": "Tomato", "lowrate": "229", "highrate": "485", "arrival": "150"}
            ]
        }
        mock_post.return_value = mock_response

        scraper = RajkotScraper()
        results = scraper.run()

        # Should include all 7 crops naturally without hardcoded limitations
        crop_names = [r["crop_name"] for r in results]
        self.assertIn("Cotton", crop_names)
        self.assertIn("Cumin", crop_names)
        self.assertIn("Castor Seed", crop_names)
        self.assertIn("Wheat", crop_names)
        self.assertIn("Mustard", crop_names)
        self.assertIn("Groundnut", crop_names)
        self.assertIn("Tomato", crop_names)
        self.assertEqual(len(results), 7)

        # Verify parsing extraction uses *5 conversion from Man to Quintal
        cotton = next(r for r in results if r["crop_name"] == "Cotton")
        self.assertEqual(cotton["min_price"], Decimal("1000") * 5)
        self.assertEqual(cotton["max_price"], Decimal("1921") * 5)
        self.assertEqual(cotton["market_name"], "Rajkot APMC")
        self.assertEqual(cotton["source"], "Rajkot APMC Official")
        self.assertEqual(cotton["arrival_quantity"], Decimal("100"))

    @patch("requests.post")
    def test_extracts_all_variants_dynamically(self, mock_post):
        """All variants are parsed and included dynamically without hardcoded limits."""
        from .services import RajkotScraper

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "date": "28 July 2026",
            "data": [
                {"jansi_gujarati_name": "મગફળી જાડી", "jansi_english_name": "Groundnut", "lowrate": "1240", "highrate": "1550", "arrival": "100"},
                {"jansi_gujarati_name": "મગફળી જીણી", "jansi_english_name": "Groundnut Small", "lowrate": "1215", "highrate": "1500", "arrival": "50"},
                {"jansi_gujarati_name": "સીંગદાણા", "jansi_english_name": "Peanut", "lowrate": "1770", "highrate": "2150", "arrival": "20"},
            ]
        }
        mock_post.return_value = mock_response

        scraper = RajkotScraper()
        results = scraper.run()

        # All 3 variants should be extracted without filtering
        self.assertEqual(len(results), 3)
        
        # Check that it's the exact parsed data from the first variant
        groundnut_jadi = results[0]
        self.assertEqual(groundnut_jadi["crop_name"], "Groundnut")
        self.assertEqual(groundnut_jadi["crop_name_gu"], "મગફળી જાડી")
        self.assertEqual(groundnut_jadi["min_price"], Decimal("1240") * 5)
        self.assertEqual(groundnut_jadi["max_price"], Decimal("1550") * 5)
        self.assertEqual(groundnut_jadi["modal_price"], Decimal("6975.00"))

    @patch("requests.post")
    def test_returns_empty_on_failure(self, mock_post):
        """Returns empty list when website is unavailable."""
        from .services import RajkotScraper

        # Simulate connection error
        mock_post.side_effect = Exception("Connection Error")
        
        scraper = RajkotScraper()
        results = scraper.run()
        self.assertEqual(results, [])

    @patch("requests.post")
    def test_returns_empty_on_no_price_data(self, mock_post):
        """Returns empty if JSON has no parseable price data."""
        from .services import RajkotScraper

        # Simulate success but empty data list
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"date": "28 July 2026", "data": [], "datas": []}
        mock_post.return_value = mock_response

        scraper = RajkotScraper()
        results = scraper.run()
        self.assertEqual(results, [])

class GondalScraperUnitTests(TestCase):
    """Unit tests for the GondalScraper class."""

    @patch("requests.Session.post")
    @patch("requests.Session.get")
    def test_parses_html_items_correctly(self, mock_get, mock_post):
        """Correctly parses HTML data via ASP.NET hidden fields fallback mapping correctly."""
        from .services import GondalScraper

        # Mock GET response (extracting ASP fields)
        mock_get_response = MagicMock()
        mock_get_response.status_code = 200
        mock_get_response.content = b'<html><input id="__VIEWSTATE" value="VS"/><input id="__VIEWSTATEGENERATOR" value="VG"/><input id="__EVENTVALIDATION" value="EV"/></html>'
        mock_get.return_value = mock_get_response

        # Mock POST response
        mock_post_response = MagicMock()
        mock_post_response.status_code = 200
        mock_post_response.content = f'''
        <html>
            <table id="ctl00_ContentPlaceHolder1_grid_pak">
                <tr><th>Col1</th><th>Col2</th><th>Col3</th></tr>
                <tr><td>ઘઉં લોકવન</td><td>450</td><td>550</td></tr>
                <tr><td>કપાસ</td><td>1000</td><td>1500</td></tr>
                <tr><td>Random Unmapped</td><td>10</td><td>20</td></tr>
            </table>
        </html>
        '''.encode('utf-8')
        # The bytes are for "ઘઉં લોકવન" and "કપાસ"
        mock_post.return_value = mock_post_response

        scraper = GondalScraper()
        results = scraper.run()
        
        crop_names = [r["crop_name"] for r in results]
        self.assertIn("ઘઉં લોકવન", crop_names)
        self.assertIn("કપાસ", crop_names)
        self.assertIn("Random Unmapped", crop_names)
        self.assertEqual(len(results), 3)

        wheat = next(r for r in results if r["crop_name"] == "ઘઉં લોકવન")
        self.assertEqual(wheat["min_price"], Decimal("450") * 5)
        self.assertEqual(wheat["max_price"], Decimal("550") * 5)
        self.assertEqual(wheat["modal_price"], Decimal("2500.00"))
        self.assertEqual(wheat["market_name"], "Gondal APMC")
        self.assertEqual(wheat["source"], "Gondal APMC Official")

