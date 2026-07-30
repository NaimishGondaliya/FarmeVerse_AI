"""
FarmVerse AI — Market Price Scraper
Official Rajkot APMC scraper for Gujarat commodity prices.

Source: https://apmcrajkot.com (verified official website)

Supported Crops:
    Cotton, Groundnut, Cumin, Castor Seed, Wheat, Mustard
"""

import logging
import re
import time
from datetime import date, datetime, timedelta
from decimal import Decimal, InvalidOperation

import requests
from bs4 import BeautifulSoup
from django.db.models import Q

from .models import MarketPrice

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# District → supported APMC markets mapping
DISTRICT_MARKETS = {
    "Rajkot": [
        {"id": "Rajkot", "name": "Rajkot APMC"},
        {"id": "Gondal", "name": "Gondal APMC"},
        {"id": "Jetpur", "name": "Jetpur APMC"}
    ],
    "Junagadh": [
        {"id": "Junagadh", "name": "Junagadh APMC"}
    ]
}

SCRAPER_HEADERS = {
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def parse_date_string(text):
    """Parse a date string in various common formats."""
    if not text:
        return None
    cleaned = re.sub(r'\s+', ' ', text.strip())
    for fmt in ('%d/%m/%Y', '%d-%m-%Y', '%d-%b-%Y', '%d %b %Y', '%Y-%m-%d', '%Y/%m/%d'):
        try:
            return datetime.strptime(cleaned, fmt).date()
        except ValueError:
            continue
    return None


def safe_decimal(text, default=Decimal("0")):
    """Convert a text value to Decimal safely."""
    if not text or not text.strip():
        return default
    cleaned = re.sub(r'[^\d.]', '', text.strip())
    try:
        return Decimal(cleaned) if cleaned else default
    except InvalidOperation:
        return default


def man_to_quintal(price_per_man):
    """
    Convert price per Man (20 kg) to price per Quintal (100 kg).
    1 Quintal = 5 Man → multiply by 5.
    """
    return price_per_man * 5


# ---------------------------------------------------------------------------
# Rajkot APMC Scraper
# ---------------------------------------------------------------------------

class RajkotScraper:
    """
    Fetches daily commodity rates from the official Rajkot APMC API.
    URL: POST https://www.apmcrajkot.com/home/get_daily_rates

    Returns JSON grouping crops into 'data' (grains) and 'datas' (vegetables).
    Converts prices from per-Man (20kg) to per-Quintal (100kg) by multiplying by 5.
    Filters exclusively to supported crops.
    """

    MARKET_NAME = "Rajkot APMC"
    DISTRICT_NAME = "Rajkot"
    SOURCE_URL = "https://www.apmcrajkot.com/home/get_daily_rates"

    def run(self, target_date=None):
        """
        Execute the scraper. Returns list of price dicts.
        Never raises — returns [] on any failure.
        """
        logger.info(f"Scraper Started: {self.MARKET_NAME}")
        try:
            results = self._fetch_api_data(target_date)
            logger.info(f"Scraper Finished: {self.MARKET_NAME} | Rows: {len(results)}")
            if results:
                crops = sorted(set(r["crop_name"] for r in results))
                logger.info(f"  Crops found: {', '.join(crops)}")
            return results
        except Exception as e:
            logger.error(f"Scraper Failed: {self.MARKET_NAME} | {e}")
            return []

    def _fetch_api_data(self, requested_date=None):
        """Core fetching logic using POST requests and JSON parsing."""
        if requested_date:
            dates_to_try = [requested_date]
        else:
            dates_to_try = [date.today() - timedelta(days=i) for i in range(8)]

        for current_target in dates_to_try:
            date_str = current_target.strftime("%d/%m/%Y")
            payload = {"date": date_str}
            
            delay = 1.0
            response_data = None

            for attempt in range(1, 4):  # 3 retries
                try:
                    logger.info(f"  Fetching API {self.SOURCE_URL} for date {date_str} (attempt {attempt}/3)")
                    resp = requests.post(self.SOURCE_URL, headers=SCRAPER_HEADERS, data=payload, timeout=15)
                    if resp.status_code == 200:
                        response_data = resp.json()
                        logger.info(f"  HTTP 200 OK — JSON fetched successfully")
                        break
                    logger.warning(f"  HTTP {resp.status_code} on attempt {attempt}")
                except Exception as e:
                    logger.warning(f"  Network error on attempt {attempt}: {e}")
                
                if attempt < 3:
                    time.sleep(delay)
                    delay *= 1.5
            
            if not response_data:
                logger.warning(f"{self.MARKET_NAME}: Could not fetch JSON from API for date {date_str}")
                continue

            # API returns data in 'data' and 'datas' arrays
            raw_items = []
            if "data" in response_data and isinstance(response_data["data"], list):
                raw_items.extend(response_data["data"])
            if "datas" in response_data and isinstance(response_data["datas"], list):
                raw_items.extend(response_data["datas"])

            if not raw_items:
                logger.warning(f"{self.MARKET_NAME}: No items found in JSON response for date {date_str}")
                continue

            results = []

            for item in raw_items:
                crop_gu = str(item.get("jansi_gujarati_name", "")).strip()
                crop_en = str(item.get("jansi_english_name", "")).strip()

                if not crop_gu and not crop_en:
                    continue

                lowrate_q = (safe_decimal(item.get("lowrate", "")) * 5)
                highrate_q = (safe_decimal(item.get("highrate", "")) * 5)
                arrival = safe_decimal(item.get("arrival", ""))

                if lowrate_q == 0 and highrate_q == 0:
                    continue

                modal_q = ((lowrate_q + highrate_q) / 2).quantize(Decimal("0.01"))
                
                # Requirements mapping exactly as requested by user
                results.append({
                    "market_name": self.MARKET_NAME,
                    "district_name": self.DISTRICT_NAME,
                    "crop_name": crop_en or crop_gu,
                    "crop_name_gu": crop_gu,
                    "min_price": lowrate_q,
                    "max_price": highrate_q,
                    "modal_price": modal_q,
                    "arrival_quantity": arrival,
                    "price_date": current_target,
                    "source": "Rajkot APMC Official"
                })

            if results:
                # Found valid data
                logger.info(f"{self.MARKET_NAME}: Successfully parsed {len(results)} items for {date_str}")
                return results

        logger.warning(f"{self.MARKET_NAME}: No valid data found for given date parameters.")
        return []

class GondalScraper:
    MARKET_NAME = "Gondal APMC"
    DISTRICT_NAME = "Rajkot"
    SOURCE_URL = "https://apmcgondal.scmsolution.in/"

    def run(self, target_date=None):
        """
        Execute the scraper. Returns list of price dicts.
        Never raises — returns [] on any failure.
        """
        logger.info(f"Scraper Started: {self.MARKET_NAME}")
        try:
            results = self._fetch_api_data(target_date)
            logger.info(f"Scraper Finished: {self.MARKET_NAME} | Rows: {len(results)}")
            if results:
                crops = sorted(set(r["crop_name"] for r in results))
                logger.info(f"  Crops found: {', '.join(crops)}")
            return results
        except Exception as e:
            logger.error(f"Scraper Failed: {self.MARKET_NAME} | {e}")
            return []

    def _fetch_api_data(self, requested_date=None):
        if requested_date:
            dates_to_try = [requested_date]
        else:
            dates_to_try = [date.today() - timedelta(days=i) for i in range(8)]
        
        with requests.Session() as session:
            try:
                logger.info(f"  {self.MARKET_NAME}: Fetching GET to extract ASP.NET hidden fields")
                resp_init = session.get(self.SOURCE_URL, headers=SCRAPER_HEADERS, timeout=15)
                resp_init.raise_for_status()
                soup_init = BeautifulSoup(resp_init.content, "html.parser")
                viewstate = soup_init.find("input", {"id": "__VIEWSTATE"})
                viewstategenerator = soup_init.find("input", {"id": "__VIEWSTATEGENERATOR"})
                eventvalidation = soup_init.find("input", {"id": "__EVENTVALIDATION"})

                viewstate = viewstate["value"] if viewstate else ""
                viewstategenerator = viewstategenerator["value"] if viewstategenerator else ""
                eventvalidation = eventvalidation["value"] if eventvalidation else ""
            except Exception as e:
                logger.error(f"{self.MARKET_NAME}: Initial GET failed: {e}")
                return []

            for current_target in dates_to_try:
                date_str = current_target.strftime("%Y-%m-%d")

                payload = {
                    "__EVENTTARGET": "",
                    "__EVENTARGUMENT": "",
                    "__LASTFOCUS": "",
                    "__VIEWSTATE": viewstate,
                    "__VIEWSTATEGENERATOR": viewstategenerator,
                    "__EVENTVALIDATION": eventvalidation,
                    "ctl00$ContentPlaceHolder1$txt_date": date_str,
                }
                
                try:
                    logger.info(f"  {self.MARKET_NAME}: Fetching POST for date {date_str}")
                    resp = session.post(self.SOURCE_URL, headers=SCRAPER_HEADERS, data=payload, timeout=15)
                    resp.raise_for_status()
                except Exception as e:
                    logger.warning(f"  {self.MARKET_NAME}: POST failed for {date_str}: {e}")
                    continue

                soup = BeautifulSoup(resp.content, "html.parser")
                table = soup.find("table", {"id": "ctl00_ContentPlaceHolder1_grid_pak"})
                
                if not table:
                    continue
                
                rows = table.find_all("tr")
                if len(rows) <= 1:
                    logger.warning(f"{self.MARKET_NAME}: No items found in table for date {date_str}")
                    continue

                results = []
                for idx, row in enumerate(rows):
                    if idx == 0:
                        continue # Header
                    
                    cols = row.find_all("td")
                    if len(cols) < 3:
                        continue

                    crop_gu = str(cols[0].text).strip()
                    low_val_str = str(cols[1].text).strip()
                    high_val_str = str(cols[2].text).strip()
                    
                    if not crop_gu:
                        continue

                    lowrate = safe_decimal(low_val_str) * 5
                    highrate = safe_decimal(high_val_str) * 5
                    
                    if lowrate == 0 and highrate == 0:
                        continue

                    modal = ((lowrate + highrate) / 2).quantize(Decimal("0.01"))
                    
                    results.append({
                        "market_name": self.MARKET_NAME,
                        "district_name": self.DISTRICT_NAME,
                        "crop_name": crop_gu,
                        "crop_name_gu": crop_gu,
                        "min_price": lowrate,
                        "max_price": highrate,
                        "modal_price": modal,
                        "arrival_quantity": Decimal("0.00"),
                        "price_date": current_target,
                        "source": "Gondal APMC Official"
                    })

                if results:
                    logger.info(f"{self.MARKET_NAME}: Successfully parsed {len(results)} items for {date_str}")
                    return results

        logger.warning(f"{self.MARKET_NAME}: No valid data found for given date parameters.")
        return []



class JunagadhScraper:
    MARKET_NAME = "Junagadh APMC"
    DISTRICT_NAME = "Junagadh"
    BASE_URL = "https://apmcjunagadh.org/daily-rates"
    AJAX_URL = "https://apmcjunagadh.org/daily-rates-ajax-list"

    def run(self, target_date=None):
        """
        Execute the scraper. Returns list of price dicts.
        Never raises — returns [] on any failure.
        """
        logger.info(f"Scraper Started: {self.MARKET_NAME}")
        try:
            with requests.Session() as session:
                token = self._fetch_token(session)
                if not token:
                    logger.warning(f"{self.MARKET_NAME}: Failed to extract token.")
                    return []
                
                if target_date:
                    dates_to_try = [target_date]
                else:
                    dates_to_try = [date.today() - timedelta(days=i) for i in range(8)]
                
                for current_target in dates_to_try:
                    date_str = current_target.strftime("%d/%m/%Y")
                    
                    results = self._fetch_rates(session, date_str, token, current_target)
                    if results:
                        crops = sorted(set(r["crop_name"] for r in results))
                        logger.info(f"{self.MARKET_NAME}: Successfully parsed {len(results)} items for {date_str}")
                        logger.info(f"  Crops found: {', '.join(crops)}")
                        return results
                            
                logger.warning(f"{self.MARKET_NAME}: No valid data found for given date parameters.")
                return []
        except Exception as e:
            logger.error(f"Scraper Failed: {self.MARKET_NAME} | {e}")
            return []

    def _fetch_token(self, session):
        try:
            resp = session.get(self.BASE_URL, headers=SCRAPER_HEADERS, timeout=15)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.content, "html.parser")
            
            meta_token = soup.find("meta", {"name": "csrf-token"})
            if meta_token and meta_token.get("content"):
                return meta_token["content"]
            
            input_token = soup.find("input", {"name": "_token"})
            if input_token and input_token.get("value"):
                return input_token["value"]
                
        except Exception as e:
            logger.error(f"Token fetch error for {self.MARKET_NAME}: {e}")
        return None

    def _fetch_rates(self, session, date_str, token, target_date):
        params = {
            "date": date_str,
            "jansi_type": "1",
            "_token": token
        }
        try:
            resp = session.get(self.AJAX_URL, headers=SCRAPER_HEADERS, params=params, timeout=15)
            resp.raise_for_status()
            return self.parse_html(resp.content, target_date)
        except Exception as e:
            logger.warning(f"{self.MARKET_NAME}: Failed to fetch rates for {date_str}: {e}")
            return []

    def parse_html(self, html_content, target_date):
        soup = BeautifulSoup(html_content, "html.parser")
        rows = soup.find_all("tr")
        results = []
        
        for row in rows:
            cols = row.find_all("td")
            if len(cols) < 5:
                continue
                
            crop_gu = str(cols[1].text).strip()
            low_val_str = str(cols[2].text).strip()
            high_val_str = str(cols[3].text).strip()
            
            if not crop_gu:
                continue
                
            lowrate = safe_decimal(low_val_str) * 5
            highrate = safe_decimal(high_val_str) * 5
            
            if lowrate == 0 and highrate == 0:
                continue
                
            modal = ((lowrate + highrate) / 2).quantize(Decimal("0.01"))
            
            results.append({
                "market_name": self.MARKET_NAME,
                "district_name": self.DISTRICT_NAME,
                "crop_name": crop_gu,
                "crop_name_gu": crop_gu,
                "min_price": lowrate,
                "max_price": highrate,
                "modal_price": modal,
                "arrival_quantity": Decimal("0.00"),
                "price_date": target_date,
                "source": "Official Junagadh APMC"
            })
            
        return results

class JetpurScraper:
    def run(self, target_date=None):
        # Stub to be implemented later
        return []


# ---------------------------------------------------------------------------
# Refresh Engine
# ---------------------------------------------------------------------------

def refresh_all_scrapers(target_date=None):
    """
    Run all APMC scrapers, isolate failures, save collected results to SQLite.
    Never fails entirely — returns empty result on failure.
    """
    logger.info("=" * 60)
    logger.info("Refresh Started: Running all Scrapers independently")
    logger.info("=" * 60)

    markets_status = {}
    all_rows = []

    # 1. Rajkot APMC
    try:
        rajkot_rows = RajkotScraper().run(target_date)
        if rajkot_rows:
            all_rows.extend(rajkot_rows)
            markets_status["Rajkot APMC"] = {"status": "success", "rows": len(rajkot_rows)}
            logger.info(f"Rajkot APMC \u2713 {len(rajkot_rows)} rows")
        else:
            markets_status["Rajkot APMC"] = {"status": "failed", "rows": 0}
            logger.info("Rajkot APMC \u2717 failed")
    except Exception as e:
        logger.error(f"Rajkot refresh failed: {e}")
        markets_status["Rajkot APMC"] = {"status": "failed", "rows": 0}
        logger.info("Rajkot APMC \u2717 failed")

    # 2. Gondal APMC
    try:
        gondal_rows = GondalScraper().run(target_date)
        if gondal_rows:
            all_rows.extend(gondal_rows)
            markets_status["Gondal APMC"] = {"status": "success", "rows": len(gondal_rows)}
            logger.info(f"Gondal APMC \u2713 {len(gondal_rows)} rows")
        else:
            markets_status["Gondal APMC"] = {"status": "failed", "rows": 0}
            logger.info("Gondal APMC \u2717 failed")
    except Exception as e:
        logger.error(f"Gondal refresh failed: {e}")
        markets_status["Gondal APMC"] = {"status": "failed", "rows": 0}
        logger.info("Gondal APMC \u2717 failed")

    # 3. Junagadh APMC
    try:
        junagadh_rows = JunagadhScraper().run(target_date)
        if junagadh_rows:
            all_rows.extend(junagadh_rows)
            markets_status["Junagadh APMC"] = {"status": "success", "rows": len(junagadh_rows)}
            logger.info(f"Junagadh APMC \u2713 {len(junagadh_rows)} rows")
        else:
            markets_status["Junagadh APMC"] = {"status": "failed", "rows": 0}
            logger.info("Junagadh APMC \u2717 failed")
    except Exception as e:
        logger.error(f"Junagadh refresh failed: {e}")
        markets_status["Junagadh APMC"] = {"status": "failed", "rows": 0}
        logger.info("Junagadh APMC \u2717 failed")

    # 4. Jetpur APMC
    try:
        jetpur_rows = JetpurScraper().run(target_date)
        if jetpur_rows:
            all_rows.extend(jetpur_rows)
            markets_status["Jetpur APMC"] = {"status": "success", "rows": len(jetpur_rows)}
            logger.info(f"Jetpur APMC \u2713 {len(jetpur_rows)} rows")
        else:
            markets_status["Jetpur APMC"] = {"status": "failed", "rows": 0}
            logger.info("Jetpur APMC \u2717 failed")
    except Exception as e:
        logger.error(f"Jetpur refresh failed: {e}")
        markets_status["Jetpur APMC"] = {"status": "failed", "rows": 0}
        logger.info("Jetpur APMC \u2717 failed")

    today = date.today()

    if all_rows:
        created_or_updated_count = 0
        for item in all_rows:
            obj, created = MarketPrice.objects.update_or_create(
                market_name=item["market_name"],
                crop_name=item["crop_name"],
                price_date=item["price_date"],
                defaults={
                    "district_name": item.get("district_name", ""),
                    "crop_name_gu": item.get("crop_name_gu", ""),
                    "min_price": item["min_price"],
                    "max_price": item["max_price"],
                    "modal_price": item["modal_price"],
                    "arrival_quantity": item.get("arrival_quantity", Decimal("0")),
                    "source": "Official APMC"
                }
            )
            created_or_updated_count += 1
            
        logger.info(f"Rows Saved securely via update_or_create: {created_or_updated_count}")
        
        latest_date = max(item["price_date"] for item in all_rows)
        logger.info(f"Latest Date Extracted: {latest_date.isoformat()}")

        return {
            "success": True,
            "source": "Official APMC",
            "latest_date": latest_date.isoformat(),
            "rows_imported": len(all_rows),
            "markets_status": markets_status,
        }

    # No data scraped at all — check DB for fallback existing records
    latest_record = MarketPrice.objects.all().order_by("-price_date").first()
    if latest_record:
        fallback_date = latest_record.price_date
        fallback_count = MarketPrice.objects.filter(price_date=fallback_date).count()
        logger.info(f"No new data scraped. Using existing records from {fallback_date.isoformat()}")
        return {
            "success": True,
            "source": "Official APMC",
            "latest_date": fallback_date.isoformat(),
            "rows_imported": fallback_count,
            "markets_status": markets_status,
            "warning": "APMC websites unavailable. Showing previous official data.",
        }

    logger.warning("No market data available from any source.")
    return {
        "success": True,
        "source": "Official APMC",
        "latest_date": today.isoformat(),
        "rows_imported": 0,
        "markets_status": markets_status,
        "warning": "No official APMC market data available.",
    }


def get_todays_prices():
    """
    Gets prices for today. If not in DB, triggers a refresh.
    Falls back to latest available date if today's data unavailable.
    """
    today = date.today()
    if not MarketPrice.objects.filter(price_date=today).exists():
        try:
            refresh_all_scrapers()
        except Exception as e:
            logger.error(f"Failed to refresh prices on demand: {e}")

    # Fetch the latest available records independently per market and crop
    prices = []
    seen = set()
    for p in MarketPrice.objects.all().order_by("-price_date"):
        key = (p.market_name, p.crop_name)
        if key not in seen:
            seen.add(key)
            prices.append(p)
    return prices


# ---------------------------------------------------------------------------
# Public API helpers (used by views)
# ---------------------------------------------------------------------------

def get_supported_commodities():
    """Returns all supported Gujarati and English corresponding commodities mapped dynamically from the database."""
    crops_q = MarketPrice.objects.values("crop_name", "crop_name_gu").distinct()
    
    unique_crops = set()
    output = []
    
    for c in crops_q:
        c_name = c["crop_name"]
        if c_name and c_name not in unique_crops:
            output.append({
                "id": c_name,
                "name": c_name.title(),
                "gujarati": c.get("crop_name_gu", c_name)
            })
            unique_crops.add(c_name)
    
    return sorted(output, key=lambda x: x["name"])


def get_markets_by_district(district_name):
    """Returns supported APMC markets for the given district."""
    if not district_name:
        return []

    key = district_name.strip().title()

    # Check DB first
    queryset = (
        MarketPrice.objects
        .filter(district_name__iexact=key)
        .values_list("market_name", flat=True)
        .distinct()
        .order_by("market_name")
    )
    if queryset.exists():
        return [{"id": m, "name": m} for m in queryset]

    return DISTRICT_MARKETS.get(key, [])


def search_prices(district_name, market_name, commodity_name, date_str):
    """
    Search and retrieve prices for specified criteria.
    For today's date, triggers a refresh. Otherwise queries DB.
    """
    if not all([district_name, market_name, commodity_name, date_str]):
        return {
            "valid": False,
            "error_msg": "Missing query parameters. district, market, commodity, and date are all required.",
            "status": 400,
        }

    try:
        query_date = date.fromisoformat(date_str)
    except ValueError:
        return {
            "valid": False,
            "error_msg": "Invalid date format. Use YYYY-MM-DD.",
            "status": 400,
        }

    # Validate district
    db_districts = list(
        MarketPrice.objects.values_list("district_name", flat=True).distinct()
    )
    all_valid_districts = (
        set(d.lower() for d in db_districts if d)
        | set(d.lower() for d in DISTRICT_MARKETS.keys())
    )

    if district_name.strip().lower() not in all_valid_districts:
        return {
            "valid": False,
            "error_msg": f"District '{district_name}' is not supported.",
            "status": 400,
        }

    # No need to validate effectively - any valid string should be searchable for dynamic scraping
    if not commodity_name or not commodity_name.strip():
        return {
            "valid": False,
            "error_msg": f"Commodity term is required.",
            "status": 400,
        }

    resolved_district = district_name.strip()
    resolved_market = market_name.strip()
    commodity_normalized = commodity_name.strip()

    today = date.today()

    market_filter = Q(market_name__icontains=resolved_market)
    crop_filter = Q(crop_name__icontains=commodity_normalized)
    date_filter = Q(price_date=query_date)
    district_filter = (
        Q(district_name__icontains=resolved_district)
        | Q(district_name__isnull=True)
        | Q(district_name="")
    )

    if not MarketPrice.objects.filter(market_filter & crop_filter & date_filter & district_filter).exists():
        try:
            refresh_all_scrapers(query_date)
        except Exception as e:
            logger.error(f"Refresh failed during search: {e}")
            return {
                "valid": False,
                "error_msg": "Unable to fetch live APMC data.",
                "status": 503,
            }

    try:
        record = MarketPrice.objects.filter(
            market_filter & crop_filter & date_filter & district_filter
        ).first()

        if not record:
            raise MarketPrice.DoesNotExist

        return {
            "valid": True,
            "data": {
                "success": True,
                "district": record.district_name or resolved_district.title(),
                "market": record.market_name,
                "commodity": record.crop_name,
                "price_date": str(record.price_date),
                "minimum_price": int(record.min_price),
                "maximum_price": int(record.max_price),
                "modal_price": int(record.modal_price),
                "arrival_quantity": (
                    int(record.arrival_quantity)
                    if record.arrival_quantity is not None
                    else 0
                ),
                "source": record.source,
            },
            "status": 200,
        }
    except MarketPrice.DoesNotExist:
        return {
            "valid": True,
            "data": {
                "success": False,
                "message": "No market prices available for selected date.",
            },
            "status": 200,
        }
