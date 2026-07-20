from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework import exceptions
from expert.models import AgricultureExpert
from .models import Consultation, ConsultationReply
from .serializers import ConsultationSerializer, ConsultationReplySerializer

class PingConsultationView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        return Response(
            {"status": "online", "message": "Welcome to FarmVerse AI - Consultation module API"}, 
            status=status.HTTP_200_OK
        )

class UnifiedJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return None

        token_str = parts[1]
        try:
            token = AccessToken(token_str)
            user_id = token.get('user_id')
            role = token.get('role')

            if role == 'Expert':
                expert = AgricultureExpert.objects.filter(id=user_id, active_status=True).first()
                if not expert:
                    raise exceptions.AuthenticationFailed('Expert account not found or is currently inactive.')
                return (expert, token)
            
            # Default to standard Farmer JWT authentication
            return super().authenticate(request)
        except exceptions.AuthenticationFailed as ae:
            raise ae
        except Exception:
            raise exceptions.AuthenticationFailed('Invalid or expired authentication token.')

class ConsultationBaseView(APIView):

    authentication_classes = [UnifiedJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def check_permissions(self, request):
        super().check_permissions(request)
        # Ensure we have either authenticated User or AgricultureExpert
        if not request.user:
            self.permission_denominated()

    def get_role_and_user(self, request):
        if isinstance(request.user, AgricultureExpert):
            return 'Expert', request.user
        elif hasattr(request.user, 'role') and request.user.role == 'Farmer':
            return 'Farmer', request.user
        return None, None


class ConsultationCreateListView(ConsultationBaseView):
    def post(self, request):
        role, user = self.get_role_and_user(request)
        if role != 'Farmer':
            return Response({"error": "Only authenticated farmers can query agriculture experts."}, status=status.HTTP_403_FORBIDDEN)

        # Ensure expert_id is provided in the request
        expert_id = request.data.get('expert')
        if not expert_id:
            return Response({"expert": ["This field is required. Please select an agriculture expert."]}, status=status.HTTP_400_BAD_REQUEST)

        # Validate expert exists and is active
        try:
            expert_obj = AgricultureExpert.objects.get(id=expert_id, active_status=True)
        except AgricultureExpert.DoesNotExist:
            return Response({"expert": ["Selected expert not found or is currently inactive."]}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ConsultationSerializer(data=request.data)
        if serializer.is_valid():
            # Explicitly assign farmer and expert to ensure correct assignment
            serializer.save(farmer=user, expert=expert_obj, status='Pending')
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        role, user = self.get_role_and_user(request)
        if role != 'Farmer':
            return Response({"error": "Only farmers can list their own consultations."}, status=status.HTTP_403_FORBIDDEN)

        consultations = Consultation.objects.filter(farmer=user, is_deleted=False)
        serializer = ConsultationSerializer(consultations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ExpertInboxView(ConsultationBaseView):
    def get(self, request):
        role, user = self.get_role_and_user(request)
        if role != 'Expert':
            return Response({"error": "Only experts can review their query inbox."}, status=status.HTTP_403_FORBIDDEN)

        # Filter consultations assigned to this expert, excluding soft-deleted records
        consultations = Consultation.objects.filter(expert=user, is_deleted=False)
        serializer = ConsultationSerializer(consultations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ConsultationDetailView(ConsultationBaseView):
    def get(self, request, pk):
        role, user = self.get_role_and_user(request)
        consultation = get_object_or_404(Consultation, pk=pk)

        # Check permissions
        is_farmer = (role == 'Farmer' and consultation.farmer == user)
        is_expert = (role == 'Expert' and consultation.expert == user)

        if not (is_farmer or is_expert):
            return Response({"error": "You do not have access credentials to view this consultation."}, status=status.HTTP_403_FORBIDDEN)

        serializer = ConsultationSerializer(consultation)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ConsultationReplyView(ConsultationBaseView):
    def post(self, request, pk):
        role, user = self.get_role_and_user(request)
        consultation = get_object_or_404(Consultation, pk=pk)

        # Check permissions
        is_farmer = (role == 'Farmer' and consultation.farmer == user)
        is_expert = (role == 'Expert' and consultation.expert == user)

        if not (is_farmer or is_expert):
            return Response({"error": "You do not have permission to reply to this thread."}, status=status.HTTP_403_FORBIDDEN)

        if consultation.status == 'Closed':
            return Response({"error": "Cannot reply to a closed consultation."}, status=status.HTTP_400_BAD_REQUEST)

        message_text = request.data.get('message', '').strip()
        if not message_text:
            return Response({"message": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

        # Create reply
        reply = ConsultationReply.objects.create(
            consultation=consultation,
            sender=role,
            message=message_text
        )

        # Update consultation status
        if role == 'Expert':
            consultation.status = 'Replied'
        elif role == 'Farmer':
            consultation.status = 'Pending'
        consultation.save()

        serializer = ConsultationReplySerializer(reply)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ConsultationCloseView(ConsultationBaseView):
    def post(self, request, pk):
        role, user = self.get_role_and_user(request)
        consultation = get_object_or_404(Consultation, pk=pk)

        # Allow associated farmer or expert to close thread
        is_farmer = (role == 'Farmer' and consultation.farmer == user)
        is_expert = (role == 'Expert' and consultation.expert == user)

        if not (is_farmer or is_expert):
            return Response({"error": "You do not have permission to close this consultation."}, status=status.HTTP_403_FORBIDDEN)

        consultation.status = 'Closed'
        consultation.save()

        return Response({"success": True, "status": "Closed", "message": "Consultation successfully closed."}, status=status.HTTP_200_OK)
