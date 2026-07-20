from rest_framework import serializers
from .models import DiseaseDetection

class DiseaseDetectionSerializer(serializers.ModelSerializer):
    farmer_name = serializers.ReadOnlyField(source='farmer.get_full_name')
    farm_name = serializers.ReadOnlyField(source='farm.farm_name')
    
    class Meta:
        model = DiseaseDetection
        fields = [
            'id', 'farmer', 'farmer_name', 'farm', 'farm_name', 'crop', 
            'image', 'prediction', 'confidence', 'status', 
            'treatment', 'prevention', 'created_at'
        ]
        read_only_fields = ['farmer', 'prediction', 'confidence', 'status', 'treatment', 'prevention', 'created_at']

