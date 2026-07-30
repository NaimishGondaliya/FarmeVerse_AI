from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated

from authentication.utils.response import success_response, error_response
from .models import Farm, Crop, Expense, Sales
from .serializers import FarmSerializer, CropSerializer, ExpenseSerializer, SalesSerializer

class PingFarmerView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            {"status": "online", "message": "Welcome to FarmVerse AI - Farmer module API placeholder"}, 
            status=status.HTTP_200_OK
        )


class FarmListCreateView(APIView):
    """
    GET: List all farms of the authenticated farmer.
    POST: Create a new farm for the authenticated farmer.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            farms = Farm.objects.filter(farmer=request.user)
            serializer = FarmSerializer(farms, many=True)
            return success_response(
                message="Farms retrieved successfully.",
                data=serializer.data,
                status_code=status.HTTP_200_OK
            )
        except Exception as e:
            return error_response(
                message="Failed to retrieve farms.",
                errors={"server": str(e)},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        serializer = FarmSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save(farmer=request.user)
                return success_response(
                    message="Farm created successfully.",
                    data=serializer.data,
                    status_code=status.HTTP_201_CREATED
                )
            except Exception as e:
                return error_response(
                    message="Failed to create farm.",
                    errors={"server": str(e)},
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        return error_response(
            message="Validation failed.",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class FarmDetailView(APIView):
    """
    GET: Retrieve details of a specific farm.
    PUT: Update a specific farm.
    DELETE: Delete a specific farm.
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Farm.objects.get(pk=pk, farmer=user)
        except Farm.DoesNotExist:
            return None

    def get(self, request, pk):
        farm = self.get_object(pk, request.user)
        if not farm:
            return error_response(
                message="Farm not found or unauthorized.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        serializer = FarmSerializer(farm)
        return success_response(
            message="Farm retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )

    def put(self, request, pk):
        farm = self.get_object(pk, request.user)
        if not farm:
            return error_response(
                message="Farm not found or unauthorized.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        serializer = FarmSerializer(farm, data=request.data, partial=True)
        if serializer.is_valid():
            try:
                serializer.save()
                return success_response(
                    message="Farm updated successfully.",
                    data=serializer.data,
                    status_code=status.HTTP_200_OK
                )
            except Exception as e:
                return error_response(
                    message="Failed to update farm.",
                    errors={"server": str(e)},
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        return error_response(
            message="Validation failed.",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        farm = self.get_object(pk, request.user)
        if not farm:
            return error_response(
                message="Farm not found or unauthorized.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        try:
            farm.delete()
            return success_response(
                message="Farm deleted successfully.",
                status_code=status.HTTP_200_OK
            )
        except Exception as e:
            return error_response(
                message="Failed to delete farm.",
                errors={"server": str(e)},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CropListCreateView(APIView):
    """
    GET: List all crops belonging to the authenticated farmer's farms.
    POST: Create a new crop record.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            crops = Crop.objects.filter(farm__farmer=request.user)
            serializer = CropSerializer(crops, many=True)
            return success_response(
                message="Crops retrieved successfully.",
                data=serializer.data,
                status_code=status.HTTP_200_OK
            )
        except Exception as e:
            return error_response(
                message="Failed to retrieve crops.",
                errors={"server": str(e)},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        # Validate that the farm exists and belongs to the authenticated user
        farm_id = request.data.get('farm')
        if not farm_id:
            return error_response(
                message="Validation failed.",
                errors={"farm": ["This field is required."]},
                status_code=status.HTTP_400_BAD_REQUEST
            )
        try:
            Farm.objects.get(id=farm_id, farmer=request.user)
        except (Farm.DoesNotExist, ValueError):
            return error_response(
                message="Invalid farm or unauthorized.",
                errors={"farm": ["Farm does not exist or does not belong to you."]},
                status_code=status.HTTP_400_BAD_REQUEST
            )
            
        serializer = CropSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return success_response(
                    message="Crop record created successfully.",
                    data=serializer.data,
                    status_code=status.HTTP_201_CREATED
                )
            except Exception as e:
                return error_response(
                    message="Failed to create crop record.",
                    errors={"server": str(e)},
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        return error_response(
            message="Validation failed.",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class CropDetailView(APIView):
    """
    GET: Retrieve details of a crop record.
    PUT: Update a crop record.
    DELETE: Delete a crop record.
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Crop.objects.get(pk=pk, farm__farmer=user)
        except Crop.DoesNotExist:
            return None

    def get(self, request, pk):
        crop = self.get_object(pk, request.user)
        if not crop:
            return error_response(
                message="Crop record not found or unauthorized.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        serializer = CropSerializer(crop)
        return success_response(
            message="Crop record details retrieved successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )

    def put(self, request, pk):
        crop = self.get_object(pk, request.user)
        if not crop:
            return error_response(
                message="Crop record not found or unauthorized.",
                status_code=status.HTTP_404_NOT_FOUND
            )
            
        # If farm is being updated, check ownership
        farm_id = request.data.get('farm')
        if farm_id:
            try:
                Farm.objects.get(id=farm_id, farmer=request.user)
            except (Farm.DoesNotExist, ValueError):
                return error_response(
                    message="Invalid farm or unauthorized.",
                    errors={"farm": ["Farm does not exist or does not belong to you."]},
                    status_code=status.HTTP_400_BAD_REQUEST
                )

        serializer = CropSerializer(crop, data=request.data, partial=True)
        if serializer.is_valid():
            try:
                serializer.save()
                return success_response(
                    message="Crop record updated successfully.",
                    data=serializer.data,
                    status_code=status.HTTP_200_OK
                )
            except Exception as e:
                return error_response(
                    message="Failed to update crop record.",
                    errors={"server": str(e)},
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        return error_response(
            message="Validation failed.",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        crop = self.get_object(pk, request.user)
        if not crop:
            return error_response(
                message="Crop record not found or unauthorized.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        try:
            crop.delete()
            return success_response(
                message="Crop record deleted successfully.",
                status_code=status.HTTP_200_OK
            )
        except Exception as e:
            return error_response(
                message="Failed to delete crop record.",
                errors={"server": str(e)},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ExpenseListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        expenses = Expense.objects.filter(crop__farm__farmer=request.user)
        serializer = ExpenseSerializer(expenses, many=True)
        return success_response(
            data=serializer.data,
            message="Expenses retrieved successfully.",
            status_code=status.HTTP_200_OK
        )

    def post(self, request):
        crop_id = request.data.get('crop')
        if not crop_id or not Crop.objects.filter(id=crop_id, farm__farmer=request.user).exists():
            return error_response(
                message="Invalid crop selection.",
                errors={"crop": "Selected crop does not belong to your farms."},
                status_code=status.HTTP_400_BAD_REQUEST
            )
        serializer = ExpenseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return success_response(
                data=serializer.data,
                message="Expense record added successfully.",
                status_code=status.HTTP_201_CREATED
            )
        return error_response(
            message="Validation failed.",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class ExpenseDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        return Expense.objects.filter(pk=pk, crop__farm__farmer=user).first()

    def get(self, request, pk):
        expense = self.get_object(pk, request.user)
        if not expense:
            return error_response(
                message="Expense record not found.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        serializer = ExpenseSerializer(expense)
        return success_response(
            data=serializer.data,
            message="Expense details retrieved successfully.",
            status_code=status.HTTP_200_OK
        )

    def put(self, request, pk):
        expense = self.get_object(pk, request.user)
        if not expense:
            return error_response(
                message="Expense record not found.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        crop_id = request.data.get('crop')
        if crop_id and not Crop.objects.filter(id=crop_id, farm__farmer=request.user).exists():
            return error_response(
                message="Invalid crop selection.",
                errors={"crop": "Selected crop does not belong to your farms."},
                status_code=status.HTTP_400_BAD_REQUEST
            )
        serializer = ExpenseSerializer(expense, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return success_response(
                data=serializer.data,
                message="Expense record updated successfully.",
                status_code=status.HTTP_200_OK
            )
        return error_response(
            message="Validation failed.",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        expense = self.get_object(pk, request.user)
        if not expense:
            return error_response(
                message="Expense record not found.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        expense.delete()
        return success_response(
            message="Expense record deleted successfully.",
            status_code=status.HTTP_200_OK
        )


class SalesListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sales = Sales.objects.filter(crop__farm__farmer=request.user)
        serializer = SalesSerializer(sales, many=True)
        return success_response(
            data=serializer.data,
            message="Sales records retrieved successfully.",
            status_code=status.HTTP_200_OK
        )

    def post(self, request):
        crop_id = request.data.get('crop')
        if not crop_id or not Crop.objects.filter(id=crop_id, farm__farmer=request.user).exists():
            return error_response(
                message="Invalid crop selection.",
                errors={"crop": "Selected crop does not belong to your farms."},
                status_code=status.HTTP_400_BAD_REQUEST
            )
        serializer = SalesSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return success_response(
                data=serializer.data,
                message="Sales record added successfully.",
                status_code=status.HTTP_201_CREATED
            )
        return error_response(
            message="Validation failed.",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class SalesDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        return Sales.objects.filter(pk=pk, crop__farm__farmer=user).first()

    def get(self, request, pk):
        sale = self.get_object(pk, request.user)
        if not sale:
            return error_response(
                message="Sales record not found.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        serializer = SalesSerializer(sale)
        return success_response(
            data=serializer.data,
            message="Sales details retrieved successfully.",
            status_code=status.HTTP_200_OK
        )

    def put(self, request, pk):
        sale = self.get_object(pk, request.user)
        if not sale:
            return error_response(
                message="Sales record not found.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        crop_id = request.data.get('crop')
        if crop_id and not Crop.objects.filter(id=crop_id, farm__farmer=request.user).exists():
            return error_response(
                message="Invalid crop selection.",
                errors={"crop": "Selected crop does not belong to your farms."},
                status_code=status.HTTP_400_BAD_REQUEST
            )
        serializer = SalesSerializer(sale, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return success_response(
                data=serializer.data,
                message="Sales record updated successfully.",
                status_code=status.HTTP_200_OK
            )
        return error_response(
            message="Validation failed.",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        sale = self.get_object(pk, request.user)
        if not sale:
            return error_response(
                message="Sales record not found.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        sale.delete()
        return success_response(
            message="Sales record deleted successfully.",
            status_code=status.HTTP_200_OK
        )


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            notifications = request.user.notifications.all()
            from .serializers import NotificationSerializer
            serializer = NotificationSerializer(notifications, many=True)
            return success_response(
                data=serializer.data,
                message="Notifications retrieved successfully.",
                status_code=status.HTTP_200_OK
            )
        except Exception as e:
            return error_response(
                message="Failed to retrieve notifications.",
                errors={"server": str(e)},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class NotificationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            notification = request.user.notifications.get(pk=pk)
            notification.is_read = True
            notification.save()
            return success_response(
                message="Notification marked as read.",
                status_code=status.HTTP_200_OK
            )
        except Exception as e:
            return error_response(
                message="Notification not found.",
                status_code=status.HTTP_404_NOT_FOUND
            )

