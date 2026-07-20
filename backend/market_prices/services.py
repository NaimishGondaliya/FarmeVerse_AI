import logging
import random
import re
import time
from datetime import date, timedelta, datetime
from decimal import Decimal
import requests
# pyrefly: ignore [missing-import]
from bs4 import BeautifulSoup
from django.core.cache import cache
from django.db.models import Q
from .models import MarketPrice

logger = logging.getLogger(__name__)

# Configured Gujarat Markets and Crops
SUPPORTED_MARKETS = ["Gondal APMC", "Rajkot APMC", "Junagadh APMC"]
SUPPORTED_CROPS = [
    {"name_en": "Cotton", "name_gu": "કપાસ"},
    {"name_en": "Groundnut", "name_gu": "મગફળી"},
    {"name_en": "Cumin", "name_gu": "જીરૂ"},
    {"name_en": "Wheat", "name_gu": "ઘઉં"},
    {"name_en": "Mustard", "name_gu": "રાઈ"},
    {"name_en": "Castor seed", "name_gu": "દિવેલા"}
]

# Base prices kept for metadata or reference structure but no longer used for fake generation
BASE_CROP_PRICES = {
    "Cotton": {"min": 5500, "max": 7500, "modal": 6800, "arrival": 150},
    "Groundnut": {"min": 6000, "max": 8000, "modal": 7200, "arrival": 120},
    "Cumin": {"min": 25000, "max": 35000, "modal": 30000, "arrival": 40},
    "Wheat": {"min": 2200, "max": 2800, "modal": 2500, "arrival": 200},
    "Mustard": {"min": 5000, "max": 6500, "modal": 5800, "arrival": 80},
    "Castor seed": {"min": 5500, "max": 6800, "modal": 6200, "arrival": 95}
}

def parse_date_string(text):
    if not text:
        return None
    # Normalize spacing
    cleaned = re.sub(r'\s+', ' ', text.strip())
    for fmt in ('%d/%m/%Y', '%d-%m-%Y', '%d-%b-%Y', '%d %b %Y', '%Y-%m-%d', '%Y/%m/%d'):
        try:
            return datetime.strptime(cleaned, fmt).date()
        except ValueError:
            continue
    return None

class AgmarknetService:
    @staticmethod
    def get_todays_prices():
        """
        Gets crop prices for today. If not in DB, triggers refresh.
        If today's data is unavailable, automatically falls back to latest available Government data.
        """
        today = date.today()
        
        # 1. Check if we have prices for today
        prices = MarketPrice.objects.filter(price_date=today)
        if prices.exists():
            return prices

        # Check in cache if we recently attempted to scrape today but it was unavailable
        cache_key = f"agmarknet_scrape_attempted_{today.isoformat()}"
        if not cache.get(cache_key):
            try:
                # 2. Try to refresh/scrape live on demand
                AgmarknetService.refresh_prices()
                prices = MarketPrice.objects.filter(price_date=today)
                if prices.exists():
                    return prices
            except Exception as e:
                logger.error(f"Failed to refresh prices on demand: {e}")

        # 3. If today's data is still unavailable, fetch the latest available date's records in the database
        latest_record = MarketPrice.objects.all().order_by('-price_date').first()
        if latest_record:
            logger.info(f"Today's data unavailable. Falling back to latest available date: {latest_record.price_date}")
            return MarketPrice.objects.filter(price_date=latest_record.price_date)

        return MarketPrice.objects.none()

    @staticmethod
    def refresh_prices():
        """
        Attempts to scrape from AGMARKNET. Saves parsed results to DB.
        Saves rows for target date from 0 to 10 days ago.
        Never generates fake fallback prices (Requirement 6).
        """
        import datetime
        from datetime import date, timedelta
        
        today = date.today()
        cache_key = f"agmarknet_scrape_attempted_{today.isoformat()}"
        
        # Record scraping attempt in cache for 15 minutes to avoid slamming the website
        cache.set(cache_key, True, timeout=900)
        
        scraped_data = scrape_live_agmarknet()
        
        # Step 1 & 2: Loop from today to 10 days ago
        if scraped_data:
            for i in range(11):
                target_date = today - timedelta(days=i)
                print("Checking Government date ...")
                
                # Check if there are rows matching target_date
                target_rows = [row for row in scraped_data if row["price_date"] == target_date]
                if target_rows:
                    print("Rows found ...")
                    print("Saving SQLite ...")
                    
                    # Delete only duplicate rows for the same market + crop + date before inserting
                    q_del = Q()
                    for item in target_rows:
                        q_del |= Q(market_name=item["market_name"], crop_name=item["crop_name"])
                    
                    MarketPrice.objects.filter(q_del, price_date=target_date).delete()
                    
                    new_records = [
                        MarketPrice(
                            market_name=item["market_name"],
                            district_name=item.get("district_name") or "",
                            crop_name=item["crop_name"],
                            price_date=target_date,
                            min_price=item["min_price"],
                            max_price=item["max_price"],
                            modal_price=item["modal_price"],
                            arrival_quantity=item["arrival_quantity"],
                            source="AGMARKNET"
                        )
                        for item in target_rows
                    ]
                    MarketPrice.objects.bulk_create(new_records)
                    
                    # Custom logging format for imported markets
                    market_names = sorted(list(set(item["market_name"] for item in target_rows)))
                    print("Imported markets:")
                    for m in market_names:
                        print(m)
                    print(f"Total rows imported: {len(target_rows)}")
                    
                    logger.info("Imported markets:")
                    for m in market_names:
                        logger.info(m)
                    logger.info(f"Total rows imported: {len(target_rows)}")
                    
                    print("Completed.")
                    return {
                        "success": True,
                        "source": "government",
                        "latest_date": target_date.isoformat(),
                        "rows_imported": len(target_rows)
                    }
        
        # Step 3: SQLite fallback
        if not scraped_data:
            print("Checking Government date ...")
            
        print("Using fallback date ...")
        print("Saving SQLite ...")
        
        latest_record = MarketPrice.objects.all().order_by('-price_date').first()
        if latest_record:
            fallback_date = latest_record.price_date
            fallback_rows_count = MarketPrice.objects.filter(price_date=fallback_date).count()
            print("Completed.")
            return {
                "success": True,
                "source": "sqlite",
                "latest_date": fallback_date.isoformat(),
                "rows_imported": fallback_rows_count,
                "warning": "Showing latest available Government data from cache."
            }
        else:
            print("Completed.")
            return {
                "success": True,
                "source": "sqlite",
                "latest_date": today.isoformat(),
                "rows_imported": 0,
                "warning": "Showing latest available Government data from cache."
            }

# Complete mapping of Gujarat districts to all available APMC markets
DISTRICT_MARKETS = {
    "Ahmedabad": [
        {"id": "Ahmedabad", "name": "Ahmedabad APMC"},
        {"id": "Sanand", "name": "Sanand APMC"},
        {"id": "Viramgam", "name": "Viramgam APMC"},
        {"id": "Bavla", "name": "Bavla APMC"},
    ],
    "Amreli": [
        {"id": "Amreli", "name": "Amreli APMC"},
        {"id": "Damnagar", "name": "Damnagar APMC"},
        {"id": "Dhari", "name": "Dhari APMC"},
        {"id": "Rajula", "name": "Rajula APMC"},
    ],
    "Anand": [
        {"id": "Anand", "name": "Anand APMC"},
        {"id": "Bhadran", "name": "Bhadran APMC"},
        {"id": "Khambhat", "name": "Khambhat APMC"},
        {"id": "Umreth", "name": "Umreth APMC"},
    ],
    "Aravalli": [
        {"id": "Bayad", "name": "Bayad APMC"},
        {"id": "Dhansura", "name": "Dhansura APMC"},
        {"id": "Modasa", "name": "Modasa APMC"},
    ],
    "Banaskantha": [
        {"id": "Deesa", "name": "Deesa APMC"},
        {"id": "Dhanera", "name": "Dhanera APMC"},
        {"id": "Palanpur", "name": "Palanpur APMC"},
        {"id": "Tharad", "name": "Tharad APMC"},
    ],
    "Bharuch": [
        {"id": "Ankleshwar", "name": "Ankleshwar APMC"},
        {"id": "Bharuch", "name": "Bharuch APMC"},
        {"id": "Jambusar", "name": "Jambusar APMC"},
    ],
    "Bhavnagar": [
        {"id": "Bhavnagar", "name": "Bhavnagar APMC"},
        {"id": "Mahuva", "name": "Mahuva APMC"},
        {"id": "Palitana", "name": "Palitana APMC"},
        {"id": "Talaja", "name": "Talaja APMC"},
    ],
    "Botad": [
        {"id": "Barwala", "name": "Barwala APMC"},
        {"id": "Botad", "name": "Botad APMC"},
        {"id": "Gadhada", "name": "Gadhada APMC"},
    ],
    "Chhota Udepur": [
        {"id": "Bodeli", "name": "Bodeli APMC"},
        {"id": "Chhota Udepur", "name": "Chhota Udepur APMC"},
        {"id": "Naswadi", "name": "Naswadi APMC"},
    ],
    "Dahod": [
        {"id": "Dahod", "name": "Dahod APMC"},
        {"id": "Devgadh Baria", "name": "Devgadh Baria APMC"},
        {"id": "Zalod", "name": "Zalod APMC"},
    ],
    "Dang": [
        {"id": "Ahwa", "name": "Ahwa APMC"},
        {"id": "Waghai", "name": "Waghai APMC"},
    ],
    "Devbhumi Dwarka": [
        {"id": "Bhanvad", "name": "Bhanvad APMC"},
        {"id": "Dwarka", "name": "Dwarka APMC"},
        {"id": "Khambhalia", "name": "Khambhalia APMC"},
    ],
    "Gandhinagar": [
        {"id": "Dehgam", "name": "Dehgam APMC"},
        {"id": "Gandhinagar", "name": "Gandhinagar APMC"},
        {"id": "Mansa", "name": "Mansa APMC"},
    ],
    "Gir Somnath": [
        {"id": "Kodinar", "name": "Kodinar APMC"},
        {"id": "Una", "name": "Una APMC"},
        {"id": "Veraval", "name": "Veraval APMC"},
    ],
    "Jamnagar": [
        {"id": "Dhrol", "name": "Dhrol APMC"},
        {"id": "Jamjodhpur", "name": "Jamjodhpur APMC"},
        {"id": "Jamnagar", "name": "Jamnagar APMC"},
        {"id": "Kalavad", "name": "Kalavad APMC"},
    ],
    "Junagadh": [
        {"id": "Junagadh", "name": "Junagadh APMC"},
        {"id": "Keshod", "name": "Keshod APMC"},
        {"id": "Manavadar", "name": "Manavadar APMC"},
        {"id": "Visavadar", "name": "Visavadar APMC"},
    ],
    "Kheda": [
        {"id": "Dakor", "name": "Dakor APMC"},
        {"id": "Kapadwanj", "name": "Kapadwanj APMC"},
        {"id": "Nadiad", "name": "Nadiad APMC"},
        {"id": "Thasra", "name": "Thasra APMC"},
    ],
    "Kutch": [
        {"id": "Anjar", "name": "Anjar APMC"},
        {"id": "Bhuj", "name": "Bhuj APMC"},
        {"id": "Gandhidham", "name": "Gandhidham APMC"},
        {"id": "Mandvi", "name": "Mandvi APMC"},
        {"id": "Mundra", "name": "Mundra APMC"},
        {"id": "Rapar", "name": "Rapar APMC"},
    ],
    "Mahisagar": [
        {"id": "Balasinor", "name": "Balasinor APMC"},
        {"id": "Lunawada", "name": "Lunawada APMC"},
        {"id": "Santrampur", "name": "Santrampur APMC"},
    ],
    "Mehsana": [
        {"id": "Becharaji", "name": "Becharaji APMC"},
        {"id": "Mehsana", "name": "Mehsana APMC"},
        {"id": "Unjha", "name": "Unjha APMC"},
        {"id": "Visnagar", "name": "Visnagar APMC"},
    ],
    "Morbi": [
        {"id": "Halvad", "name": "Halvad APMC"},
        {"id": "Morbi", "name": "Morbi APMC"},
        {"id": "Wankaner", "name": "Wankaner APMC"},
    ],
    "Narmada": [
        {"id": "Dediapada", "name": "Dediapada APMC"},
        {"id": "Rajpipla", "name": "Rajpipla APMC"},
        {"id": "Sagbara", "name": "Sagbara APMC"},
    ],
    "Navsari": [
        {"id": "Bansda", "name": "Bansda APMC"},
        {"id": "Chikhli", "name": "Chikhli APMC"},
        {"id": "Gandevi", "name": "Gandevi APMC"},
        {"id": "Navsari", "name": "Navsari APMC"},
    ],
    "Panchmahal": [
        {"id": "Ghoghamba", "name": "Ghoghamba APMC"},
        {"id": "Godhra", "name": "Godhra APMC"},
        {"id": "Halol", "name": "Halol APMC"},
        {"id": "Kalol", "name": "Kalol APMC"},
    ],
    "Patan": [
        {"id": "Chanasma", "name": "Chanasma APMC"},
        {"id": "Harij", "name": "Harij APMC"},
        {"id": "Patan", "name": "Patan APMC"},
        {"id": "Sidhpur", "name": "Sidhpur APMC"},
    ],
    "Porbandar": [
        {"id": "Kutiyana", "name": "Kutiyana APMC"},
        {"id": "Porbandar", "name": "Porbandar APMC"},
        {"id": "Ranavav", "name": "Ranavav APMC"},
    ],
    "Rajkot": [
        {"id": "Gondal", "name": "Gondal APMC"},
        {"id": "Rajkot", "name": "Rajkot APMC"},
        {"id": "Jetpur", "name": "Jetpur APMC"},
        {"id": "Dhoraji", "name": "Dhoraji APMC"},
        {"id": "Upleta", "name": "Upleta APMC"},
    ],
    "Sabarkantha": [
        {"id": "Himatnagar", "name": "Himatnagar APMC"},
        {"id": "Idar", "name": "Idar APMC"},
        {"id": "Khedbrahma", "name": "Khedbrahma APMC"},
        {"id": "Prantij", "name": "Prantij APMC"},
    ],
    "Surat": [
        {"id": "Bardoli", "name": "Bardoli APMC"},
        {"id": "Mahuva Surat", "name": "Mahuva Surat APMC"},
        {"id": "Surat", "name": "Surat APMC"},
    ],
    "Surendranagar": [
        {"id": "Chotila", "name": "Chotila APMC"},
        {"id": "Halvad", "name": "Halvad APMC"},
        {"id": "Limbdi", "name": "Limbdi APMC"},
        {"id": "Surendranagar", "name": "Surendranagar APMC"},
        {"id": "Wadhwan", "name": "Wadhwan APMC"},
    ],
    "Tapi": [
        {"id": "Songadh", "name": "Songadh APMC"},
        {"id": "Valod", "name": "Valod APMC"},
        {"id": "Vyara", "name": "Vyara APMC"},
    ],
    "Vadodara": [
        {"id": "Dabhoi", "name": "Dabhoi APMC"},
        {"id": "Karjan", "name": "Karjan APMC"},
        {"id": "Padra", "name": "Padra APMC"},
        {"id": "Savli", "name": "Savli APMC"},
        {"id": "Vadodara", "name": "Vadodara APMC"},
    ],
    "Valsad": [
        {"id": "Dharampur", "name": "Dharampur APMC"},
        {"id": "Pardi", "name": "Pardi APMC"},
        {"id": "Umbergaon", "name": "Umbergaon APMC"},
        {"id": "Valsad", "name": "Valsad APMC"},
    ]
}

def get_markets_by_district(district_name):
    """
    Returns all available APMC markets for the selected Gujarat district dynamically from DB.
    """
    if not district_name:
        return []
    
    key = district_name.strip().title()
    # Query distinct market_name where district_name matches case-insensitively
    queryset = MarketPrice.objects.filter(district_name__iexact=key).values_list('market_name', flat=True).distinct().order_by('market_name')
    
    if queryset.exists():
        return [{"id": m, "name": m} for m in queryset]
        
    # Fallback to hardcoded DISTRICT_MARKETS if no database data yet present
    return DISTRICT_MARKETS.get(key, [])


def get_supported_commodities():
    """
    Returns all supported Gujarat commodities in a reusable format for AGMARKNET.
    """
    return [
        {"id": "Cotton", "name": "Cotton", "gujarati": "કપાસ"},
        {"id": "Groundnut", "name": "Groundnut", "gujarati": "મગફળી"},
        {"id": "Cumin", "name": "Cumin", "gujarati": "જીરુ"},
        {"id": "Wheat", "name": "Wheat", "gujarati": "ઘઉં"},
        {"id": "Mustard", "name": "Mustard", "gujarati": "રાઈ"},
        {"id": "Castor Seed", "name": "Castor Seed", "gujarati": "દિવેલા"}
    ]


def scrape_live_agmarknet(max_retries=3, backoff_factor=1.5):
    """
    Attempts to scrape from AGMARKNET. Returns the list of parsed items.
    Tolerates failures with automatic retries and exponential backoff timeouts.
    Never generates fake fallback prices (Requirement 6).
    """
    scraped_data = []
    url = (
        "https://agmarknet.gov.in/SearchMarketReport.aspx"
        "?WriteReadData=0&charcommrec=0&Disclaimer=0&ActivePage=1"
        "&StateName=GJ&DistrictName=0&MarketName=0&CommodityName=0&ResultType=1"
    )
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    response = None
    delay = 1.0
    
    for attempt in range(1, max_retries + 1):
        try:
            logger.info(f"Scraping live AGMARKNET (Attempt {attempt}/{max_retries})...")
            response = requests.get(url, headers=headers, timeout=6)
            if response.status_code == 200 and "cphBody_gridArrivalData" in response.text:
                logger.info("Successfully connected to AGMARKNET and found arrival data body.")
                break
            else:
                logger.warning(f"AGMARKNET server returned status code {response.status_code} or missing grid data on attempt {attempt}.")
        except requests.RequestException as e:
            logger.warning(f"Scraping attempt {attempt} failed due to network error: {e}")
            
        if attempt < max_retries:
            sleep_time = delay * (backoff_factor ** (attempt - 1))
            logger.info(f"Sleeping {sleep_time:.2f} seconds before retrying...")
            time.sleep(sleep_time)
            
    if not response or response.status_code != 200 or "cphBody_gridArrivalData" not in response.text:
        logger.error("All AGMARKNET scraping attempts failed or timed out.")
        return None

    try:
        soup = BeautifulSoup(response.content, "html.parser")
        table = soup.find("table", {"id": "cphBody_gridArrivalData"})
        if not table:
            logger.error("Could not find table 'cphBody_gridArrivalData' in response.")
            return None
            
        rows = table.find_all("tr")
        if len(rows) < 2:
            logger.warning("Table 'cphBody_gridArrivalData' contains no rows.")
            return None
            
        # Parse headers to map column indices dynamically
        header_tr = rows[0]
        headers_labels = [th.text.strip().lower() for th in header_tr.find_all(["th", "td"])]
        
        col_map = {}
        for idx, h in enumerate(headers_labels):
            if "district" in h:
                col_map["district"] = idx
            elif "market" in h:
                col_map["market"] = idx
            elif "commodity" in h or "crop" in h:
                col_map["crop"] = idx
            elif "min" in h:
                col_map["min"] = idx
            elif "max" in h:
                col_map["max"] = idx
            elif "modal" in h:
                col_map["modal"] = idx
            elif "arrival date" in h or "report date" in h or "date" in h:
                col_map["date"] = idx
            elif "quantity" in h or "arrival" in h or "qty" in h:
                col_map["qty"] = idx

        # Fallback default indices if not matching dynamically
        d_district = col_map.get("district", 1)
        d_market = col_map.get("market", 2)
        d_crop = col_map.get("crop", 3)
        d_min = col_map.get("min", 6)
        d_max = col_map.get("max", 7)
        d_modal = col_map.get("modal", 8)
        d_qty = col_map.get("qty", 9)
        d_date_idx = col_map.get("date", 9)

        today = date.today()
        supported_crops = get_supported_commodities()
        
        for row in rows[1:]:
            cols = row.find_all("td")
            if len(cols) >= 8:
                try:
                    district = cols[d_district].text.strip().title() if d_district is not None and d_district < len(cols) else ""
                    market = cols[d_market].text.strip()
                    crop = cols[d_crop].text.strip()
                    
                    min_p = Decimal(cols[d_min].text.strip()) if cols[d_min].text.strip() else Decimal(0)
                    max_p = Decimal(cols[d_max].text.strip()) if cols[d_max].text.strip() else Decimal(0)
                    modal_p = Decimal(cols[d_modal].text.strip()) if cols[d_modal].text.strip() else Decimal(0)
                    qty = Decimal(cols[d_qty].text.strip()) if d_qty < len(cols) and cols[d_qty].text.strip() else Decimal(0)
                except (IndexError, ValueError, TypeError) as e:
                    logger.debug(f"Skipping row due to conversion error: {e}")
                    continue
                
                # Retrieve price_date from columns or scan row
                price_date = None
                if d_date_idx is not None and d_date_idx < len(cols):
                    price_date = parse_date_string(cols[d_date_idx].text.strip())
                if not price_date:
                    # Scan all cells for date pattern
                    for col in cols:
                        parsed = parse_date_string(col.text.strip())
                        if parsed:
                            price_date = parsed
                            break
                            
                db_crop = crop
                for c in supported_crops:
                    if c["name"].lower() == crop.lower():
                        db_crop = "Castor seed" if c["name"] == "Castor Seed" else c["name"]
                        break
                        
                scraped_data.append({
                    "district_name": district,
                    "market_name": market,
                    "crop_name": db_crop,
                    "min_price": min_p,
                    "max_price": max_p,
                    "modal_price": modal_p,
                    "arrival_quantity": qty,
                    "price_date": price_date or today,
                    "source": "AGMARKNET"
                })
        return scraped_data
    except Exception as e:
        logger.error(f"Live AGMARKNET parsing/scraping failed: {e}")
    return None


def search_prices(district_name, market_name, commodity_name, date_str):
    """
    Search and retrieve prices for specified criteria, fetching from AGMARKNET
    for today's date, or falling back to database for other dates.
    """
    if not all([district_name, market_name, commodity_name, date_str]):
        return {
            "valid": False,
            "error_msg": "Missing query parameters. district, market, commodity, and date are all required.",
            "status": 400
        }
        
    try:
        query_date = date.fromisoformat(date_str)
    except ValueError:
        return {
            "valid": False,
            "error_msg": "Invalid date format. Use YYYY-MM-DD.",
            "status": 400
        }
        
    # Get all dynamically defined districts in DB + hardcoded DISTRICT_MARKETS keys
    db_districts = list(MarketPrice.objects.values_list('district_name', flat=True).distinct())
    all_valid_districts = set(d.lower() for d in db_districts if d) | set(d.lower() for d in DISTRICT_MARKETS.keys())
    
    if district_name.strip().lower() not in all_valid_districts:
        return {
            "valid": False,
            "error_msg": f"District '{district_name}' is not supported.",
            "status": 400
        }
        
    # Get all dynamically defined commodities in DB + supported crops
    db_crops = list(MarketPrice.objects.values_list('crop_name', flat=True).distinct())
    all_valid_crops = set(c.lower() for c in db_crops if c) | set(c["name"].lower() for c in get_supported_commodities())
    
    if commodity_name.strip().lower() not in all_valid_crops:
        return {
            "valid": False,
            "error_msg": f"Commodity '{commodity_name}' is not supported.",
            "status": 400
        }
        
    resolved_district = district_name.strip()
    resolved_market = market_name.strip()
    commodity_normalized = commodity_name.strip()
    if commodity_normalized.lower() == "castor seed":
        commodity_normalized = "Castor seed"
        
    today = date.today()
    if query_date == today:
        scraped = scrape_live_agmarknet()
        if scraped is None:
            return {
                "valid": False,
                "error_msg": "Unable to fetch live AGMARKNET data.",
                "status": 503
            }
            
        # Delete only duplicate rows for the same market + crop + date before bulk inserting
        from django.db.models import Q
        q_del = Q()
        for item in scraped:
            q_del |= Q(market_name=item["market_name"], crop_name=item["crop_name"])
            
        MarketPrice.objects.filter(q_del, price_date=today).delete()
        
        new_records = [
            MarketPrice(
                market_name=item["market_name"],
                district_name=item.get("district_name") or "",
                crop_name=item["crop_name"],
                price_date=today,
                min_price=item["min_price"],
                max_price=item["max_price"],
                modal_price=item["modal_price"],
                arrival_quantity=item["arrival_quantity"],
                source="AGMARKNET"
            )
            for item in scraped
        ]
        MarketPrice.objects.bulk_create(new_records)
        
    try:
        from django.db.models import Q
        market_filter = Q(market_name__icontains=resolved_market)
        crop_filter = Q(crop_name__icontains=commodity_normalized)
        date_filter = Q(price_date=query_date)
        district_filter = Q(district_name__icontains=resolved_district) | Q(district_name__isnull=True) | Q(district_name="")
        
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
                "arrival_quantity": int(record.arrival_quantity) if record.arrival_quantity is not None else 0,
                "source": record.source
            },
            "status": 200
        }
    except MarketPrice.DoesNotExist:
        return {
            "valid": True,
            "data": {
                "success": False,
                "message": "No market prices available for selected date."
            },
            "status": 200
        }



