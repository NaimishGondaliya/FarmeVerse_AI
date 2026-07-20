from rest_framework import serializers

class CropRecommendationRequestSerializer(serializers.Serializer):
    N = serializers.FloatField(
        required=True, 
        min_value=0.0, 
        error_messages={
            'required': 'Nitrogen (N) value is required.',
            'invalid': 'Nitrogen (N) must be a numeric value.',
            'min_value': 'Nitrogen (N) content cannot be negative.'
        }
    )
    P = serializers.FloatField(
        required=True, 
        min_value=0.0, 
        error_messages={
            'required': 'Phosphorus (P) value is required.',
            'invalid': 'Phosphorus (P) must be a numeric value.',
            'min_value': 'Phosphorus (P) content cannot be negative.'
        }
    )
    K = serializers.FloatField(
        required=True, 
        min_value=0.0, 
        error_messages={
            'required': 'Potassium (K) value is required.',
            'invalid': 'Potassium (K) must be a numeric value.',
            'min_value': 'Potassium (K) content cannot be negative.'
        }
    )
    temperature = serializers.FloatField(
        required=True,
        error_messages={
            'required': 'Temperature value is required.',
            'invalid': 'Temperature must be a numeric value.'
        }
    )
    humidity = serializers.FloatField(
        required=True, 
        min_value=0.0, 
        max_value=100.0, 
        error_messages={
            'required': 'Humidity value is required.',
            'invalid': 'Humidity must be a numeric value.',
            'min_value': 'Humidity must be between 0.0 and 100.0 percent.',
            'max_value': 'Humidity must be between 0.0 and 100.0 percent.'
        }
    )
    ph = serializers.FloatField(
        required=True, 
        min_value=0.0, 
        max_value=14.0, 
        error_messages={
            'required': 'pH value is required.',
            'invalid': 'pH must be a numeric value.',
            'min_value': 'pH value must be between 0.0 and 14.0.',
            'max_value': 'pH value must be between 0.0 and 14.0.'
        }
    )
    rainfall = serializers.FloatField(
        required=True, 
        min_value=0.0, 
        error_messages={
            'required': 'Rainfall value is required.',
            'invalid': 'Rainfall must be a numeric value.',
            'min_value': 'Rainfall content cannot be negative.'
        }
    )
    soil_type = serializers.CharField(
        required=False,
        default='Black Soil',
        error_messages={'invalid': 'Soil type must be a valid string.'}
    )
    season = serializers.CharField(
        required=False,
        default='Kharif',
        error_messages={'invalid': 'Season must be a valid string.'}
    )
    district = serializers.CharField(
        required=False,
        default='Rajkot',
        error_messages={'invalid': 'District must be a valid string.'}
    )
    irrigation = serializers.CharField(
        required=False,
        default='Medium',
        error_messages={'invalid': 'Irrigation type must be a valid string.'}
    )
    city = serializers.CharField(
        required=False,
        default='Rajkot',
        error_messages={'invalid': 'City must be a valid string.'}
    )
