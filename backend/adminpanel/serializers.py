from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from expert.models import AgricultureExpert


class AdminExpertSerializer(serializers.ModelSerializer):
    """Read/write serializer for expert management with computed consultation_count."""
    consultation_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = AgricultureExpert
        fields = [
            'id', 'name', 'photo', 'qualification', 'specialization',
            'experience', 'district', 'phone', 'email', 'password',
            'bio', 'profile_photo', 'office_address', 'languages',
            'availability', 'google_map_link', 'rating',
            'total_consultations', 'active_status', 'created_date',
            'consultation_count'
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'created_date': {'read_only': True},
        }

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            validated_data['password'] = make_password(password)
        return super().update(instance, validated_data)


class AdminExpertCreateSerializer(serializers.ModelSerializer):
    """Write-only serializer for creating a new expert with confirm_password validation."""
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = AgricultureExpert
        fields = [
            'name', 'qualification', 'specialization', 'experience',
            'district', 'phone', 'email', 'password', 'confirm_password',
            'bio', 'languages', 'photo', 'profile_photo',
            'office_address', 'availability', 'google_map_link',
            'active_status'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def validate_email(self, value):
        if AgricultureExpert.objects.filter(email=value).exists():
            raise serializers.ValidationError("An expert with this email already exists.")
        return value

    def validate_phone(self, value):
        if AgricultureExpert.objects.filter(phone=value).exists():
            raise serializers.ValidationError("An expert with this phone number already exists.")
        return value

    def validate(self, data):
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        if len(data.get('password', '')) < 6:
            raise serializers.ValidationError({"password": "Password must be at least 6 characters."})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)


from consultation.models import Consultation, ConsultationReply

class AdminConsultationReplySerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsultationReply
        fields = ['id', 'sender', 'message', 'created_date']


class AdminConsultationSerializer(serializers.ModelSerializer):
    replies = AdminConsultationReplySerializer(many=True, read_only=True)
    farmer_name = serializers.CharField(source='farmer.full_name', read_only=True)
    expert_name = serializers.CharField(source='expert.name', read_only=True)
    category = serializers.CharField(source='expert.specialization', read_only=True)
    last_reply_date = serializers.SerializerMethodField()

    class Meta:
        model = Consultation
        fields = [
            'id', 'farmer', 'farmer_name', 'expert', 'expert_name',
            'category', 'subject', 'message', 'image', 'status',
            'created_date', 'updated_date', 'replies', 'is_deleted',
            'last_reply_date'
        ]

    def get_last_reply_date(self, obj):
        last_reply = obj.replies.order_by('-created_date').first()
        if last_reply:
            return last_reply.created_date.isoformat()
        return None

