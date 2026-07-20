from rest_framework import serializers
from .models import AgricultureExpert
from django.contrib.auth.hashers import make_password

class AgricultureExpertSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgricultureExpert
        fields = [
            'id', 'name', 'email', 'phone', 'password', 'district', 
            'specialization', 'experience', 'qualification', 'bio', 
            'profile_photo', 'photo', 'languages', 'availability', 
            'office_address', 'google_map_link', 'rating', 
            'total_consultations', 'active_status', 'created_date'
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'required': False, 'allow_blank': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = super().create(validated_data)
        if password:
            instance.password = make_password(password)
            instance.save(update_fields=['password'])
        return instance

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        instance = super().update(instance, validated_data)
        if password:
            instance.password = make_password(password)
            instance.save(update_fields=['password'])
        return instance


class ExpertLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


