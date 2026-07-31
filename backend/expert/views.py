from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken

from .models import AgricultureExpert
from .serializers import AgricultureExpertSerializer, ExpertLoginSerializer
from .auth import ExpertJWTAuthentication


class PingExpertView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            {"status": "online", "message": "Welcome to FarmVerse AI - Expert module API"}, 
            status=status.HTTP_200_OK
        )


class ExpertRegisterView(APIView):
    """
    POST /api/expert/register/
    Create a new Agriculture Expert profile.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AgricultureExpertSerializer(data=request.data)
        if serializer.is_valid():
            expert = serializer.save()
            
            # Generate JWT tokens
            refresh = RefreshToken()
            refresh['role'] = 'Expert'
            refresh['user_id'] = expert.id
            refresh['email'] = expert.email
            refresh['name'] = expert.name

            return Response({
                "message": "Expert registered successfully.",
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh)
                },
                "user": AgricultureExpertSerializer(expert).data
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExpertLoginView(APIView):
    """
    POST /api/expert/login/
    Authenticate expert credentials and issue JWT.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ExpertLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        expert = AgricultureExpert.objects.filter(email=email).first()
        if not expert:
            return Response({"error": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)

        if not check_password(password, expert.password):
            return Response({"error": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)

        if not expert.active_status:
            return Response({"error": "Expert account is inactive. Contact admin."}, status=status.HTTP_403_FORBIDDEN)

        # Generate JWT tokens
        refresh = RefreshToken()
        refresh['role'] = 'Expert'
        refresh['user_id'] = expert.id
        refresh['email'] = expert.email
        refresh['name'] = expert.name

        return Response({
            "message": "Login successful",
            "tokens": {
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            },
            "user": AgricultureExpertSerializer(expert).data
        }, status=status.HTTP_200_OK)


class ExpertDashboardView(APIView):
    """
    GET /api/expert/dashboard/
    Return authenticated expert profile dashboard statistics and details.
    """
    authentication_classes = [ExpertJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        expert = request.user
        serializer = AgricultureExpertSerializer(expert)
        return Response({
            "profile": serializer.data,
            "stats": {
                "rating": expert.rating,
                "total_consultations": expert.total_consultations,
                "active_status": expert.active_status,
                "experience_years": expert.experience
            }
        }, status=status.HTTP_200_OK)


class ExpertListView(APIView):
    """
    GET /api/expert/ (List)
    POST /api/expert/ (Create - alias for Register)
    """
    permission_classes = [AllowAny]

    def get(self, request):
        experts = AgricultureExpert.objects.filter(active_status=True).order_by('-rating')
        serializer = AgricultureExpertSerializer(experts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = AgricultureExpertSerializer(data=request.data)
        if serializer.is_valid():
            expert = serializer.save()
            return Response(AgricultureExpertSerializer(expert).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExpertSearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        queryset = AgricultureExpert.objects.filter(active_status=True)
        
        district = request.query_params.get('district')
        name = request.query_params.get('name')
        specialization = request.query_params.get('specialization')
        language = request.query_params.get('language')
        
        if district:
            queryset = queryset.filter(district__iexact=district)
        if name:
            queryset = queryset.filter(name__icontains=name)
        if specialization:
            queryset = queryset.filter(specialization__icontains=specialization)
        if language:
            queryset = queryset.filter(languages__icontains=language)
            
        serializer = AgricultureExpertSerializer(queryset.order_by('-rating'), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ExpertDistrictsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        districts = AgricultureExpert.objects.filter(active_status=True).values_list('district', flat=True).distinct()
        cleaned_districts = sorted(list(set([d for d in districts if d])))
        return Response(cleaned_districts, status=status.HTTP_200_OK)


class ExpertDetailView(APIView):
    """
    GET /api/expert/<id>/ (Detail page)
    PUT /api/expert/<id>/ (Update)
    DELETE /api/expert/<id>/ (Delete)
    """
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_authenticators(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [ExpertJWTAuthentication()]
        return super().get_authenticators()

    def get(self, request, pk):
        try:
            expert = AgricultureExpert.objects.get(pk=pk, active_status=True)
            serializer = AgricultureExpertSerializer(expert)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except AgricultureExpert.DoesNotExist:
            return Response(
                {"error": "Expert not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

    def put(self, request, pk):
        try:
            expert = AgricultureExpert.objects.get(pk=pk)
            # Ensure expert can only update their own profile
            if request.user.id != expert.id:
                return Response({"error": "Unauthorized profile update."}, status=status.HTTP_403_FORBIDDEN)
                
            serializer = AgricultureExpertSerializer(expert, data=request.data, partial=True)
            if serializer.is_valid():
                updated_expert = serializer.save()
                return Response(AgricultureExpertSerializer(updated_expert).data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except AgricultureExpert.DoesNotExist:
            return Response({"error": "Expert not found"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            expert = AgricultureExpert.objects.get(pk=pk)
            # Ensure expert can only opt-out/delete their own profile
            if request.user.id != expert.id:
                return Response({"error": "Unauthorized profile deletion."}, status=status.HTTP_403_FORBIDDEN)
            
            expert.delete()
            return Response({"message": "Expert profile deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except AgricultureExpert.DoesNotExist:
            return Response({"error": "Expert not found"}, status=status.HTTP_404_NOT_FOUND)


