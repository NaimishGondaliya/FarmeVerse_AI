from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from decimal import Decimal
from django.shortcuts import get_object_or_404
from .models import DiseaseDetection
from .serializers import DiseaseDetectionSerializer

from .services import predict_cotton_disease

class PingDiseaseDetectionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            {"status": "online", "message": "Welcome to FarmVerse AI - DiseaseDetection module API"}, 
            status=status.HTTP_200_OK
        )

class DiseaseDetectionUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        image_file = request.FILES.get('image', None)
        crop_name = request.data.get('crop', '').strip()
        farm_id = request.data.get('farm', None)
        
        if not image_file or not crop_name:
            return Response(
                {"success": False, "message": "Both 'image' and 'crop' are required fields."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        resolved_farm = None
        if farm_id:
            from farmer.models import Farm
            try:
                resolved_farm = Farm.objects.get(id=farm_id, farmer=request.user)
            except (Farm.DoesNotExist, ValueError):
                pass

        filename = image_file.name.lower()
        crop_lower = crop_name.lower()
        
        treatment = ""
        prevention = ""
        prediction = "Healthy"
        confidence = Decimal("98.20")
        detection_status = "Healthy"
        probabilities = {}
        
        # If the user selects Cotton, run the real TensorFlow model!
        if crop_lower == 'cotton':
            try:
                result = predict_cotton_disease(image_file)
                prediction = result["prediction"]
                confidence = Decimal(str(result["confidence"]))
                detection_status = result["status"]
                treatment = result["treatment"]
                prevention = result["prevention"]
                probabilities = result["probabilities"]
            except ValueError as e:
                return Response(
                    {"success": False, "message": f"Invalid image format: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except Exception as e:
                return Response(
                    {"success": False, "message": f"Prediction error: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            # Fallback legacy mock logic for tomato or other crops
            if "tomato" in filename or "tomato" in crop_lower:
                prediction = "Tomato Late Blight"
                confidence = Decimal("92.50")
                detection_status = "Diseased"
                treatment = "Apply copper-based fungicides. Remove and destroy infected plant parts immediately."
                prevention = "Use disease-resistant seeds. Avoid overhead watering and ensure crop rotation."
            elif "cotton" in filename or "cotton" in crop_lower:
                prediction = "Cotton Leaf Curl"
                confidence = Decimal("88.00")
                detection_status = "Diseased"
                treatment = "Apply insecticide to control whiteflies (vector). Uproot and burn infected plants."
                prevention = "Plant resistant varieties. Maintain weed-free environment around fields."
            else:
                treatment = "No treatment required. Crop is healthy."
                prevention = "Continue regular soil monitoring, proper irrigation, and pest scouting."

        # Create database record
        record = DiseaseDetection.objects.create(
            farmer=request.user,
            farm=resolved_farm,
            crop=crop_name,
            image=image_file,
            prediction=prediction,
            confidence=confidence,
            status=detection_status,
            treatment=treatment,
            prevention=prevention
        )
        
        serializer = DiseaseDetectionSerializer(record, context={'request': request})
        return Response(
            {
                "success": True,
                "message": "Crop leaf analyzed successfully.",
                "data": serializer.data,
                "probabilities": probabilities
            },
            status=status.HTTP_201_CREATED
        )

class DiseaseDetectionPredictView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        image_file = request.FILES.get('image', None)
        if not image_file:
            return Response(
                {"success": False, "message": "No image uploaded. The 'image' field is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            result = predict_cotton_disease(image_file)
            return Response({
                "success": True,
                "prediction": result["prediction"],
                "confidence": result["confidence"],
                "probabilities": result["probabilities"]
            }, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response(
                {"success": False, "message": f"Invalid image format: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except FileNotFoundError as e:
            return Response(
                {"success": False, "message": f"Model assets not found: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            return Response(
                {"success": False, "message": f"Prediction failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DiseaseDetectionHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = DiseaseDetection.objects.filter(farmer=request.user)
        serializer = DiseaseDetectionSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request):
        DiseaseDetection.objects.filter(farmer=request.user).delete()
        return Response(
            {"success": True, "message": "All disease detection history deleted successfully."},
            status=status.HTTP_200_OK
        )

class DiseaseDetectionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        record = get_object_or_404(DiseaseDetection, pk=pk, farmer=request.user)
        serializer = DiseaseDetectionSerializer(record, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        record = get_object_or_404(DiseaseDetection, pk=pk, farmer=request.user)
        record.delete()
        return Response(
            {"success": True, "message": "Disease detection record deleted successfully."},
            status=status.HTTP_200_OK
        )

