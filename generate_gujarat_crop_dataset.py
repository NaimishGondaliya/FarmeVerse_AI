import os
import random
import numpy as np
import pandas as pd

# Set fixed random seed for reproducibility
np.random.seed(42)
random.seed(42)

# Define configurations for each crop with reduced overlaps in temperature, humidity, and rainfall
crop_configs = {
    'Cotton': {
        'N': (70, 130),
        'P': (35, 70),
        'K': (30, 65),
        'temp': (28.0, 36.0),
        'humidity': (55.0, 75.0),
        'rainfall': (600.0, 1000.0),
        'soils': ['Black Soil', 'Alluvial Soil'],
        'districts': ['Rajkot', 'Amreli', 'Bhavnagar', 'Junagadh', 'Jamnagar', 'Surat', 'Vadodara'],
        'season': 'Kharif',
        'irrigation': ['Medium', 'High']
    },
    'Groundnut': {
        'N': (20, 60),
        'P': (30, 60),
        'K': (20, 45),
        'temp': (24.0, 32.0),
        'humidity': (65.0, 80.0),
        'rainfall': (500.0, 800.0),
        'soils': ['Sandy Soil', 'Loamy Soil', 'Black Soil'],
        'districts': ['Junagadh', 'Rajkot', 'Jamnagar', 'Amreli', 'Bhavnagar'],
        'season': 'Kharif',
        'irrigation': ['Medium']
    },
    'Wheat': {
        'N': (60, 120),
        'P': (30, 60),
        'K': (30, 60),
        'temp': (15.0, 24.0),
        'humidity': (40.0, 55.0),
        'rainfall': (100.0, 300.0),
        'soils': ['Black Soil', 'Alluvial Soil', 'Clay Soil', 'Loamy Soil'],
        'districts': ['Ahmedabad', 'Mehsana', 'Banaskantha', 'Rajkot', 'Anand'],
        'season': 'Rabi',
        'irrigation': ['Medium']
    },
    'Maize': {
        'N': (60, 110),
        'P': (35, 65),
        'K': (30, 55),
        'temp': (22.0, 32.0),
        'humidity': (60.0, 80.0),
        'rainfall': (700.0, 1100.0),
        'soils': ['Loamy Soil', 'Alluvial Soil', 'Red Soil'],
        'districts': ['Banaskantha', 'Vadodara', 'Anand', 'Ahmedabad', 'Mehsana'],
        'season': 'Kharif',
        'irrigation': ['High']
    },
    'Bajra': {
        'N': (35, 75),
        'P': (20, 50),
        'K': (20, 45),
        'temp': (28.0, 40.0),
        'humidity': (30.0, 50.0),
        'rainfall': (150.0, 400.0),
        'soils': ['Sandy Soil', 'Loamy Soil'],
        'districts': ['Banaskantha', 'Kutch', 'Mehsana', 'Ahmedabad', 'Jamnagar'],
        'season': 'Kharif',
        'irrigation': ['Low']
    },
    'Castor': {
        'N': (30, 70),
        'P': (20, 50),
        'K': (15, 40),
        'temp': (25.0, 35.0),
        'humidity': (45.0, 65.0),
        'rainfall': (300.0, 600.0),
        'soils': ['Sandy Soil', 'Loamy Soil', 'Alluvial Soil'],
        'districts': ['Banaskantha', 'Mehsana', 'Kutch', 'Rajkot', 'Anand'],
        'season': 'Kharif',
        'irrigation': ['Low']
    },
    'Mustard': {
        'N': (40, 80),
        'P': (25, 55),
        'K': (20, 50),
        'temp': (14.0, 24.0),
        'humidity': (45.0, 60.0),
        'rainfall': (80.0, 250.0),
        'soils': ['Sandy Soil', 'Alluvial Soil', 'Loamy Soil'],
        'districts': ['Banaskantha', 'Mehsana', 'Kutch', 'Jamnagar', 'Ahmedabad'],
        'season': 'Rabi',
        'irrigation': ['Low']
    },
    'Cumin': {
        'N': (20, 50),
        'P': (20, 45),
        'K': (15, 40),
        'temp': (18.0, 28.0),
        'humidity': (25.0, 45.0),
        'rainfall': (50.0, 180.0),
        'soils': ['Sandy Soil', 'Loamy Soil', 'Alluvial Soil'],
        'districts': ['Banaskantha', 'Kutch', 'Rajkot', 'Mehsana', 'Jamnagar'],
        'season': 'Rabi',
        'irrigation': ['Low']
    },
    'Gram': {
        'N': (20, 50),
        'P': (35, 65),
        'K': (20, 50),
        'temp': (16.0, 28.0),
        'humidity': (35.0, 50.0),
        'rainfall': (100.0, 250.0),
        'soils': ['Black Soil', 'Clay Soil', 'Loamy Soil'],
        'districts': ['Ahmedabad', 'Junagadh', 'Rajkot', 'Vadodara', 'Jamnagar'],
        'season': 'Rabi',
        'irrigation': ['Low']
    },
    'Sesame': {
        'N': (20, 50),
        'P': (15, 40),
        'K': (15, 35),
        'temp': (25.0, 35.0),
        'humidity': (40.0, 60.0),
        'rainfall': (300.0, 500.0),
        'soils': ['Sandy Soil', 'Loamy Soil', 'Alluvial Soil'],
        'districts': ['Amreli', 'Bhavnagar', 'Junagadh', 'Rajkot', 'Kutch'],
        'season': 'Kharif',
        'irrigation': ['Low']
    }
}

def generate_crop_data(crop, ranges, num_rows=1000):
    data = []
    
    n_min, n_max = ranges['N']
    p_min, p_max = ranges['P']
    k_min, k_max = ranges['K']
    temp_min, temp_max = ranges['temp']
    humid_min, humid_max = ranges['humidity']
    rain_min, rain_max = ranges['rainfall']
    
    soil_types = ranges['soils']
    districts = ranges['districts']
    season = ranges['season']
    irrigation_options = ranges['irrigation']
    
    for _ in range(num_rows):
        # Generate N, P, K using normal distributions centered between ranges
        n = np.random.normal((n_min + n_max) / 2, (n_max - n_min) / 6)
        n = int(np.clip(n, n_min, n_max))
        
        p = np.random.normal((p_min + p_max) / 2, (p_max - p_min) / 6)
        p = int(np.clip(p, p_min, p_max))
        
        k = np.random.normal((k_min + k_max) / 2, (k_max - k_min) / 6)
        k = int(np.clip(k, k_min, k_max))
        
        # Generate temperature, humidity, pH, rainfall using normal/uniform distributions
        temp = np.random.normal((temp_min + temp_max) / 2, (temp_max - temp_min) / 6)
        temp = round(float(np.clip(temp, temp_min, temp_max)), 2)
        
        humidity = np.random.normal((humid_min + humid_max) / 2, (humid_max - humid_min) / 6)
        humidity = round(float(np.clip(humidity, humid_min, humid_max)), 2)
        
        # pH condition standard (ph: 5.5-8.0 range centered around 6.5)
        ph = np.random.normal(6.5, 0.5)
        ph = round(float(np.clip(ph, 4.5, 8.5)), 2)
        
        rainfall = np.random.normal((rain_min + rain_max) / 2, (rain_max - rain_min) / 6)
        rainfall = round(float(np.clip(rainfall, rain_min, rain_max)), 2)
        
        soil_type = random.choice(soil_types)
        district = random.choice(districts)
        irrigation = random.choice(irrigation_options)
        
        data.append({
            'N': n,
            'P': p,
            'K': k,
            'temperature': temp,
            'humidity': humidity,
            'ph': ph,
            'rainfall': rainfall,
            'soil_type': soil_type,
            'season': season,
            'district': district,
            'irrigation': irrigation,
            'label': crop
        })
        
    return pd.DataFrame(data)

def main():
    print("Generating Gujarat Crop Recommendation dataset with irrigation details...")
    
    all_data = []
    
    # Generate exactly 1000 rows for each of the 10 crop configurations (total: 10000 rows)
    for crop, config in crop_configs.items():
        crop_df = generate_crop_data(crop, config, num_rows=1000)
        all_data.append(crop_df)
        print(f"Generated 1000 records for crop class: {crop}")
        
    # Concatenate all crop groups
    dataset = pd.concat(all_data, ignore_index=True)
    
    # Shuffle the dataset randomly while preserving seed reproducibility
    dataset = dataset.sample(frac=1, random_state=42).reset_index(drop=True)
    
    # Re-order columns to put irrigation in the correct position
    col_order = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall', 'soil_type', 'season', 'district', 'irrigation', 'label']
    dataset = dataset[col_order]
    
    # Verify row constraints
    assert len(dataset) == 10000, f"Error: Dataset has {len(dataset)} rows instead of 10000."
    print("✔ Dataset row constraint verified: Exactly 10000 rows.")
    
    # Create datasets directory if it does not yet exist
    os.makedirs('datasets', exist_ok=True)
    
    # Save file
    output_path = os.path.join('datasets', 'gujarat_crop_recommendation.csv')
    dataset.to_csv(output_path, index=False)
    print(f"✔ Dataset successfully saved to: {output_path}")

if __name__ == '__main__':
    main()
