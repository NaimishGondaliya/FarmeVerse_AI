import os
import requests

class WeatherServiceError(Exception):
    """Base exception for weather service errors."""
    pass

class MissingAPIKeyError(WeatherServiceError):
    """Raised when the OpenWeather API key is not configured."""
    pass

class InvalidCityError(WeatherServiceError):
    """Raised when the requested city is not found or is invalid."""
    pass

class WeatherAPITimeoutError(WeatherServiceError):
    """Raised when the OpenWeather API request times out."""
    pass

class WeatherConnectionError(WeatherServiceError):
    """Raised when there is an internet or connection failure."""
    pass

class OpenWeatherAPIError(WeatherServiceError):
    """Raised when the OpenWeather API returns a non-200 error code other than 404."""
    def __init__(self, message, status_code=500):
        super().__init__(message)
        self.status_code = status_code

def get_current_weather(city=None, lat=None, lon=None):
    """
    Fetch current weather details for a given city or coordinates from OpenWeather API.
    """
    api_key = os.getenv('OPENWEATHER_API_KEY')
    if not api_key:
        raise MissingAPIKeyError("OpenWeather API key is not set in the environment configuration.")

    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        'appid': api_key,
        'units': 'metric'
    }
    
    if lat and lon:
        params['lat'] = lat
        params['lon'] = lon
    elif city:
        params['q'] = city
    else:
        raise ValueError("Either city or lat/lon must be provided")

    try:
        response = requests.get(url, params=params, timeout=10)
    except requests.exceptions.Timeout:
        raise WeatherAPITimeoutError("The request to the OpenWeather API timed out.")
    except requests.exceptions.ConnectionError:
        raise WeatherConnectionError("Failed to connect to the OpenWeather API. Please check your internet connection.")
    except requests.exceptions.RequestException as e:
        raise WeatherServiceError(f"An error occurred while connecting to the Weather API: {str(e)}")

    if response.status_code == 404:
        raise InvalidCityError(f"City '{city}' not found.")
    elif response.status_code != 200:
        raise OpenWeatherAPIError(
            f"OpenWeather API returned an error: {response.text}",
            status_code=response.status_code
        )

    try:
        data = response.json()
    except ValueError:
        raise WeatherServiceError("Failed to parse JSON response from the OpenWeather API.")

    # Format and map the response fields as required
    main = data.get('main', {})
    wind = data.get('wind', {})
    clouds = data.get('clouds', {})
    weather_list = data.get('weather', [])
    weather = weather_list[0] if weather_list else {}
    sys = data.get('sys', {})
    coord = data.get('coord', {})

    return {
        "temperature": main.get("temp"),
        "feels_like": main.get("feels_like"),
        "humidity": main.get("humidity"),
        "pressure": main.get("pressure"),
        "wind_speed": wind.get("speed"),
        "wind_direction": wind.get("deg"),
        "visibility": data.get("visibility"),
        "clouds": clouds.get("all"),
        "weather_main": weather.get("main"),
        "weather_description": weather.get("description"),
        "weather_icon": weather.get("icon"),
        "sunrise": sys.get("sunrise"),
        "sunset": sys.get("sunset"),
        "city": data.get("name"),
        "country": sys.get("country"),
        "latitude": coord.get("lat"),
        "longitude": coord.get("lon"),
        "timestamp": data.get("dt")
    }
