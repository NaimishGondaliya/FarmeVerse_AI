from rest_framework import serializers
from .models import Farm, Crop, Expense, Sales, Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'title', 'message', 'created_at']


class FarmSerializer(serializers.ModelSerializer):
    used_area = serializers.ReadOnlyField()
    available_area = serializers.ReadOnlyField()

    class Meta:
        model = Farm
        fields = [
            'id', 'farm_name', 'village', 'taluka', 'district', 'state',
            'total_area', 'used_area', 'available_area', 'area_unit', 'soil_type', 'irrigation_type',
            'latitude', 'longitude', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'used_area', 'available_area', 'created_at', 'updated_at']

    def validate_total_area(self, value):
        if value <= 0:
            raise serializers.ValidationError("Area must be greater than 0.")
        return value


class CropSerializer(serializers.ModelSerializer):
    farm_name = serializers.ReadOnlyField(source='farm.farm_name')
    total_expenses = serializers.ReadOnlyField()
    total_revenues = serializers.ReadOnlyField()
    net_profit = serializers.ReadOnlyField()

    class Meta:
        model = Crop
        fields = [
            'id', 'farm', 'farm_name', 'crop_name', 'crop_variety', 'season',
            'sowing_date', 'expected_harvest_date', 'harvest_date',
            'area_used', 'area_unit', 'expected_yield', 'actual_yield',
            'seed_cost', 'fertilizer_cost', 'pesticide_cost', 'labour_cost',
            'other_cost', 'total_cost', 'selling_price', 'sold_quantity',
            'crop_image', 'notes', 'crop_status', 'disease_status',
            'total_expenses', 'total_revenues', 'net_profit',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'total_cost', 'total_expenses', 'total_revenues', 'net_profit', 'created_at', 'updated_at']

    def validate(self, attrs):
        sowing_date = attrs.get('sowing_date')
        expected_harvest_date = attrs.get('expected_harvest_date')
        harvest_date = attrs.get('harvest_date')
        
        # Check updates where some values might not be in attrs
        if self.instance:
            if sowing_date is None:
                sowing_date = getattr(self.instance, 'sowing_date', None)
            if expected_harvest_date is None:
                expected_harvest_date = getattr(self.instance, 'expected_harvest_date', None)
            if harvest_date is None:
                harvest_date = getattr(self.instance, 'harvest_date', None)

        if sowing_date and expected_harvest_date:
            if expected_harvest_date < sowing_date:
                raise serializers.ValidationError({
                    "expected_harvest_date": "Expected harvest date cannot be before sowing date."
                })
        
        if sowing_date and harvest_date:
            if harvest_date < sowing_date:
                raise serializers.ValidationError({
                    "harvest_date": "Harvest date cannot be before sowing date."
                })

        # Negative checks (must be >= 0)
        for field in ['seed_cost', 'fertilizer_cost', 'pesticide_cost', 'labour_cost', 'other_cost', 'selling_price', 'sold_quantity', 'actual_yield']:
            val = attrs.get(field)
            if val is not None and val < 0:
                raise serializers.ValidationError({
                    field: f"{field.replace('_', ' ').title()} must be a positive number or zero."
                })
                
        # Strictly positive checks (must be > 0)
        for field in ['area_used', 'expected_yield']:
            val = attrs.get(field)
            if val is not None and val <= 0:
                raise serializers.ValidationError({
                    field: f"{field.replace('_', ' ').title()} must be greater than 0."
                })
                
        # Farm Area Validation
        farm = attrs.get('farm') or getattr(self.instance, 'farm', None)
        area_used = attrs.get('area_used')
        if area_used is None: 
            area_used = getattr(self.instance, 'area_used', None)

        area_unit = attrs.get('area_unit') or getattr(self.instance, 'area_unit', 'Acre')
        crop_status = attrs.get('crop_status') or getattr(self.instance, 'crop_status', 'Sown')

        if farm and area_used and crop_status in ['Sown', 'Growing']:
            # Calculate Farm Total Area in Acres
            farm_total_acres = float(farm.total_area)
            if farm.area_unit == 'Hectare':
                farm_total_acres *= 2.47105

            from .models import Crop
            active_crops = Crop.objects.filter(farm=farm, crop_status__in=['Sown', 'Growing'])
            if self.instance:
                active_crops = active_crops.exclude(id=self.instance.id)

            used_acres = 0.0
            for c in active_crops:
                c_area = float(c.area_used)
                if c.area_unit == 'Hectare':
                    c_area *= 2.47105
                used_acres += c_area

            available_acres = farm_total_acres - used_acres
            
            req_acres = float(area_used)
            if area_unit == 'Hectare':
                req_acres *= 2.47105
                available_in_req_unit = available_acres / 2.47105
            else:
                available_in_req_unit = available_acres
            
            if req_acres > available_acres + 0.001:
                available_str = f"{available_in_req_unit:.2f}".rstrip('0').rstrip('.')
                if not available_str:
                    available_str = "0"
                
                unit_str = "Hectare" if area_unit == 'Hectare' else "Acre"
                raise serializers.ValidationError({
                    "area_used": f"Only {available_str} {unit_str} is available in this farm."
                })

        return attrs


class ExpenseSerializer(serializers.ModelSerializer):
    crop_name = serializers.ReadOnlyField(source='crop.crop_name')
    farm_name = serializers.ReadOnlyField(source='crop.farm.farm_name')

    class Meta:
        model = Expense
        fields = [
            'id', 'crop', 'crop_name', 'farm_name', 'expense_type',
            'amount', 'expense_date', 'description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Expense amount must be greater than 0.")
        return value


class SalesSerializer(serializers.ModelSerializer):
    crop_name = serializers.ReadOnlyField(source='crop.crop_name')
    farm_name = serializers.ReadOnlyField(source='crop.farm.farm_name')

    class Meta:
        model = Sales
        fields = [
            'id', 'crop', 'crop_name', 'farm_name', 'market_yard',
            'sale_date', 'sold_quantity', 'price_per_kg', 'total_revenue',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'total_revenue', 'created_at', 'updated_at']

    def validate_sold_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Sold quantity must be greater than 0.")
        return value

    def validate_price_per_kg(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price per kg must be greater than 0.")
        return value



