# Gujarat city to district and soil type mappings
city_map = {
    'Rajkot': {'district': 'Rajkot', 'soil_type': 'Black Soil'},
    'Ahmedabad': {'district': 'Ahmedabad', 'soil_type': 'Alluvial Soil'},
    'Surat': {'district': 'Surat', 'soil_type': 'Alluvial Soil'},
    'Vadodara': {'district': 'Vadodara', 'soil_type': 'Black Soil'},
    'Bhavnagar': {'district': 'Bhavnagar', 'soil_type': 'Black Soil'},
    'Junagadh': {'district': 'Junagadh', 'soil_type': 'Loamy Soil'},
    'Jamnagar': {'district': 'Jamnagar', 'soil_type': 'Loamy Soil'},
    'Morbi': {'district': 'Morbi', 'soil_type': 'Black Soil'},
    'Amreli': {'district': 'Amreli', 'soil_type': 'Black Soil'},
    'Gandhinagar': {'district': 'Gandhinagar', 'soil_type': 'Alluvial Soil'},
    'Nadiad': {'district': 'Kheda', 'soil_type': 'Alluvial Soil'},
    'Anand': {'district': 'Anand', 'soil_type': 'Loamy Soil'},
    'Mehsana': {'district': 'Mehsana', 'soil_type': 'Sandy Soil'},
    'Surendranagar': {'district': 'Surendranagar', 'soil_type': 'Black Soil'},
    'Bharuch': {'district': 'Bharuch', 'soil_type': 'Black Soil'},
    'Navsari': {'district': 'Navsari', 'soil_type': 'Alluvial Soil'},
    'Veraval': {'district': 'Junagadh', 'soil_type': 'Loamy Soil'},
    'Porbandar': {'district': 'Porbandar', 'soil_type': 'Black Soil'},
    'Godhra': {'district': 'Panchmahal', 'soil_type': 'Sandy Soil'},
    'Bhuj': {'district': 'Kachchh', 'soil_type': 'Sandy Soil'},
    'Ankleshwar': {'district': 'Bharuch', 'soil_type': 'Black Soil'},
    'Patan': {'district': 'Patan', 'soil_type': 'Sandy Soil'},
    'Palanpur': {'district': 'Banaskantha', 'soil_type': 'Sandy Soil'},
    'Dahod': {'district': 'Dahod', 'soil_type': 'Red Soil'},
    'Valsad': {'district': 'Valsad', 'soil_type': 'Alluvial Soil'},
    'Vapi': {'district': 'Valsad', 'soil_type': 'Alluvial Soil'},
    'Gondal': {'district': 'Rajkot', 'soil_type': 'Black Soil'},
    'Jetpur': {'district': 'Rajkot', 'soil_type': 'Black Soil'},
    'Deesa': {'district': 'Banaskantha', 'soil_type': 'Sandy Soil'},
    'Mahuva': {'district': 'Bhavnagar', 'soil_type': 'Black Soil'},
    'Botad': {'district': 'Bhavnagar', 'soil_type': 'Black Soil'},
    'Adipur': {'district': 'Kachchh', 'soil_type': 'Sandy Soil'},
    'Gandhidham': {'district': 'Kachchh', 'soil_type': 'Sandy Soil'},
    'Himmatnagar': {'district': 'Sabarkantha', 'soil_type': 'Red Soil'},
    'Sidhpur': {'district': 'Patan', 'soil_type': 'Sandy Soil'},
    'Una': {'district': 'Junagadh', 'soil_type': 'Loamy Soil'},
    'Visnagar': {'district': 'Mehsana', 'soil_type': 'Sandy Soil'},
    'Keshod': {'district': 'Junagadh', 'soil_type': 'Loamy Soil'},
    'Dhrangadhra': {'district': 'Surendranagar', 'soil_type': 'Black Soil'},
    'Anjar': {'district': 'Kachchh', 'soil_type': 'Sandy Soil'},
    'Dakor': {'district': 'Kheda', 'soil_type': 'Alluvial Soil'},
    'Savarkundla': {'district': 'Amreli', 'soil_type': 'Black Soil'},
    'Kadi': {'district': 'Mehsana', 'soil_type': 'Sandy Soil'},
    'Vyara': {'district': 'Tapi', 'soil_type': 'Red Soil'},
    'Upleta': {'district': 'Rajkot', 'soil_type': 'Black Soil'},
    'Bardoli': {'district': 'Surat', 'soil_type': 'Alluvial Soil'},
    'Khambhat': {'district': 'Anand', 'soil_type': 'Loamy Soil'},
    'Borsad': {'district': 'Anand', 'soil_type': 'Loamy Soil'},
    'Petlad': {'district': 'Anand', 'soil_type': 'Loamy Soil'},
    'Dholka': {'district': 'Ahmedabad', 'soil_type': 'Alluvial Soil'},
    'Viramgam': {'district': 'Ahmedabad', 'soil_type': 'Alluvial Soil'},
    'Kapadvanj': {'district': 'Kheda', 'soil_type': 'Alluvial Soil'},
    'Bilimora': {'district': 'Navsari', 'soil_type': 'Alluvial Soil'},
    'Radhanpur': {'district': 'Patan', 'soil_type': 'Sandy Soil'},
    'Limbdi': {'district': 'Surendranagar', 'soil_type': 'Black Soil'},
    'Mansa': {'district': 'Gandhinagar', 'soil_type': 'Alluvial Soil'},
    'Sanand': {'district': 'Ahmedabad', 'soil_type': 'Alluvial Soil'},
    'Halol': {'district': 'Panchmahal', 'soil_type': 'Sandy Soil'},
    'Idar': {'district': 'Sabarkantha', 'soil_type': 'Red Soil'},
    'Chhota Udepur': {'district': 'Vadodara', 'soil_type': 'Black Soil'},
    'Lunawada': {'district': 'Panchmahal', 'soil_type': 'Sandy Soil'},
    'Jasdan': {'district': 'Rajkot', 'soil_type': 'Black Soil'},
    'Devgadh Baria': {'district': 'Dahod', 'soil_type': 'Red Soil'},
    'Dharampur': {'district': 'Valsad', 'soil_type': 'Alluvial Soil'},
    'Rajula': {'district': 'Amreli', 'soil_type': 'Black Soil'},
    'Sihor': {'district': 'Bhavnagar', 'soil_type': 'Black Soil'},
    'Thangadh': {'district': 'Surendranagar', 'soil_type': 'Black Soil'},
    'Wankaner': {'district': 'Morbi', 'soil_type': 'Black Soil'},
    'Vadnagar': {'district': 'Mehsana', 'soil_type': 'Sandy Soil'},
    'Khedbrahma': {'district': 'Sabarkantha', 'soil_type': 'Red Soil'},
    'Padra': {'district': 'Vadodara', 'soil_type': 'Black Soil'},
    'Karjan': {'district': 'Vadodara', 'soil_type': 'Black Soil'},
    'Umreth': {'district': 'Anand', 'soil_type': 'Loamy Soil'},
    'Bagasara': {'district': 'Amreli', 'soil_type': 'Black Soil'},
    'Bhanvad': {'district': 'Jamnagar', 'soil_type': 'Loamy Soil'},
    'Lathi': {'district': 'Amreli', 'soil_type': 'Black Soil'},
    'Manavadar': {'district': 'Junagadh', 'soil_type': 'Loamy Soil'},
    'Okha': {'district': 'Jamnagar', 'soil_type': 'Loamy Soil'},
    'Dwarka': {'district': 'Jamnagar', 'soil_type': 'Loamy Soil'},
    'Tharad': {'district': 'Banaskantha', 'soil_type': 'Sandy Soil'},
    'Talod': {'district': 'Sabarkantha', 'soil_type': 'Red Soil'},
    'Modasa': {'district': 'Sabarkantha', 'soil_type': 'Red Soil'},
    'Songadh': {'district': 'Tapi', 'soil_type': 'Red Soil'},
    'Mundra': {'district': 'Kachchh', 'soil_type': 'Sandy Soil'},
    'Sojitra': {'district': 'Anand', 'soil_type': 'Loamy Soil'},
    'Chikhli': {'district': 'Navsari', 'soil_type': 'Alluvial Soil'},
    'Kodinar': {'district': 'Junagadh', 'soil_type': 'Loamy Soil'},
    'Mithapur': {'district': 'Jamnagar', 'soil_type': 'Loamy Soil'},
    'Sayan': {'district': 'Surat', 'soil_type': 'Alluvial Soil'},
    'Umbergaon': {'district': 'Valsad', 'soil_type': 'Alluvial Soil'},
    'Vallabh Vidyanagar': {'district': 'Anand', 'soil_type': 'Loamy Soil'},
    'Wadhwan': {'district': 'Surendranagar', 'soil_type': 'Black Soil'},
    'Zalod': {'district': 'Dahod', 'soil_type': 'Red Soil'},
    'Daji': {'district': 'Rajkot', 'soil_type': 'Black Soil'},
    'Vagra': {'district': 'Bharuch', 'soil_type': 'Black Soil'},
    'Valod': {'district': 'Tapi', 'soil_type': 'Red Soil'},
    'Vansda': {'district': 'Navsari', 'soil_type': 'Alluvial Soil'},
    'Mandvi': {'district': 'Surat', 'soil_type': 'Alluvial Soil'},
    'Talaja': {'district': 'Bhavnagar', 'soil_type': 'Black Soil'},
    'Lalpur': {'district': 'Jamnagar', 'soil_type': 'Loamy Soil'},
    'Dhrol': {'district': 'Jamnagar', 'soil_type': 'Loamy Soil'},
    'Kalavad': {'district': 'Jamnagar', 'soil_type': 'Loamy Soil'},
    'Jodiya': {'district': 'Jamnagar', 'soil_type': 'Loamy Soil'},
    'Maliya': {'district': 'Morbi', 'soil_type': 'Black Soil'},
    'Halvad': {'district': 'Morbi', 'soil_type': 'Black Soil'},
    'Dhoraji': {'district': 'Rajkot', 'soil_type': 'Black Soil'},
    'Kutiyana': {'district': 'Porbandar', 'soil_type': 'Black Soil'},
    'Ranavav': {'district': 'Porbandar', 'soil_type': 'Black Soil'},
    'Vanthali': {'district': 'Junagadh', 'soil_type': 'Loamy Soil'},
    'Mangrol': {'district': 'Junagadh', 'soil_type': 'Loamy Soil'}
}

# Supported districts explicitly listed for validation/fallback mapping
DISTRICTS = [
    'Ahmedabad', 'Amreli', 'Anand', 'Banaskantha', 'Bharuch', 'Bhavnagar',
    'Dahod', 'Gandhinagar', 'Jamnagar', 'Junagadh', 'Kachchh', 'Kheda',
    'Mehsana', 'Morbi', 'Narmada', 'Navsari', 'Panchmahal', 'Patan',
    'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar',
    'Tapi', 'Vadodara', 'Valsad'
]

# Ensure districts map to themselves
for dist in DISTRICTS:
    if dist not in city_map:
        # Assign district default soil
        default_soil = 'Black Soil' if dist in ['Rajkot', 'Amreli', 'Bhavnagar', 'Surendranagar', 'Bharuch', 'Morbi', 'Vadodara'] else 'Alluvial Soil'
        city_map[dist] = {'district': dist, 'soil_type': default_soil}

def map_city_to_district_and_soil(city_name):
    """
    Given a city name (case-insensitive), returns a tuple (district, soil_type).
    If the city is unrecognized, returns ('Rajkot', 'Black Soil') as safe fallback.
    """
    if not city_name:
        return 'Rajkot', 'Black Soil'
        
    normalized = city_name.strip().title()
    
    # Custom handle for Kutch/Kachchh
    if normalized == 'Kutch':
        normalized = 'Bhuj'
        
    mapped = city_map.get(normalized)
    if mapped:
        return mapped['district'], mapped['soil_type']
        
    # Check if input matches any district name directly
    for dist in DISTRICTS:
        if dist.lower() == city_name.strip().lower():
            return city_map[dist]['district'], city_map[dist]['soil_type']
            
    return 'Rajkot', 'Black Soil'
