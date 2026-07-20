from rest_framework import serializers
from .models import MarketPrice

class MarketPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketPrice
        fields = [
            'id', 'market_name', 'crop_name', 'min_price',
            'max_price', 'modal_price', 'arrival_quantity',
            'price_date', 'source', 'updated_at'
        ]
