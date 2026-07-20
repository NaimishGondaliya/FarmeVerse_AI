from rest_framework import serializers
from .models import Consultation, ConsultationReply
from expert.serializers import AgricultureExpertSerializer
from users.models import User

class ConsultationReplySerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsultationReply
        fields = ['id', 'consultation', 'sender', 'message', 'created_date']
        read_only_fields = ['id', 'created_date']


class ConsultationSerializer(serializers.ModelSerializer):
    replies = ConsultationReplySerializer(many=True, read_only=True)
    farmer_name = serializers.CharField(source='farmer.full_name', read_only=True)
    expert_name = serializers.CharField(source='expert.name', read_only=True)
    expert_specialization = serializers.CharField(source='expert.specialization', read_only=True)
    expert_photo = serializers.CharField(source='expert.photo', read_only=True)

    class Meta:
        model = Consultation
        fields = [
            'id', 'farmer', 'farmer_name', 'expert', 'expert_name', 
            'expert_specialization', 'expert_photo', 'subject', 'message', 
            'image', 'status', 'created_date', 'updated_date', 'replies'
        ]
        read_only_fields = [
            'id', 'farmer', 'farmer_name', 'expert_name', 'expert_specialization', 
            'expert_photo', 'status', 'created_date', 'updated_date', 'replies'
        ]
