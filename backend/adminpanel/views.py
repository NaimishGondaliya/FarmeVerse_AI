from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
import datetime

from expert.models import AgricultureExpert
from consultation.models import Consultation
from .serializers import (
    AdminExpertSerializer, AdminExpertCreateSerializer,
    AdminConsultationSerializer
)


class PingAdminpanelView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            {"status": "online", "message": "Welcome to FarmVerse AI - Adminpanel module API"},
            status=status.HTTP_200_OK
        )


class AdminExpertStatsView(APIView):
    """GET /api/adminpanel/experts/stats/ — Dashboard card statistics."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]

    def get(self, request):
        total = AgricultureExpert.objects.count()
        active = AgricultureExpert.objects.filter(active_status=True).count()
        inactive = total - active
        total_consultations = Consultation.objects.count()
        pending_messages = Consultation.objects.filter(status='Pending').count()

        return Response({
            "total_experts": total,
            "active_experts": active,
            "inactive_experts": inactive,
            "total_consultations": total_consultations,
            "pending_messages": pending_messages
        }, status=status.HTTP_200_OK)


class AdminExpertListCreateView(APIView):
    """
    GET  /api/adminpanel/experts/          — List experts with search/filter/sort.
    POST /api/adminpanel/experts/          — Create a new expert.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]

    def get(self, request):
        queryset = AgricultureExpert.objects.annotate(
            consultation_count=Count('expert_consultations')
        )

        # Search
        search = request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(email__icontains=search) |
                Q(district__icontains=search) |
                Q(specialization__icontains=search)
            )

        # Filter by status
        status_filter = request.query_params.get('status', '').strip().lower()
        if status_filter == 'active':
            queryset = queryset.filter(active_status=True)
        elif status_filter == 'inactive':
            queryset = queryset.filter(active_status=False)

        # Sort
        sort_by = request.query_params.get('sort', '').strip()
        if sort_by == 'rating':
            queryset = queryset.order_by('-rating')
        elif sort_by == 'consultations':
            queryset = queryset.order_by('-consultation_count')
        elif sort_by == 'newest':
            queryset = queryset.order_by('-created_date')
        else:
            queryset = queryset.order_by('-created_date')

        serializer = AdminExpertSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = AdminExpertCreateSerializer(data=request.data)
        if serializer.is_valid():
            expert = serializer.save()
            return Response(
                AdminExpertSerializer(expert).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminExpertDetailView(APIView):
    """
    GET    /api/adminpanel/experts/<id>/   — Retrieve expert details with recent consultations.
    PUT    /api/adminpanel/experts/<id>/   — Update expert.
    DELETE /api/adminpanel/experts/<id>/   — Soft-delete (set active_status=False).
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        expert = get_object_or_404(AgricultureExpert, pk=pk)
        serializer = AdminExpertSerializer(expert)
        data = serializer.data

        # Attach recent consultations
        recent = Consultation.objects.filter(expert=expert).order_by('-created_date')[:10]
        data['recent_consultations'] = [
            {
                "id": c.id,
                "subject": c.subject,
                "status": c.status,
                "farmer_name": c.farmer.full_name if hasattr(c.farmer, 'full_name') else str(c.farmer),
                "created_date": c.created_date.isoformat()
            }
            for c in recent
        ]
        data['consultation_count'] = Consultation.objects.filter(expert=expert).count()
        return Response(data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        expert = get_object_or_404(AgricultureExpert, pk=pk)
        serializer = AdminExpertSerializer(expert, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        expert = get_object_or_404(AgricultureExpert, pk=pk)
        
        # Check if the expert has active or past consultations to prevent CASCADE deletion
        if expert.expert_consultations.exists():
            return Response(
                {"error": "Cannot delete expert because they have active or past consultations. Deactivate them instead."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        expert.delete()
        return Response({"message": "Expert deleted successfully."}, status=status.HTTP_200_OK)


class AdminExpertStatusView(APIView):
    """PATCH /api/adminpanel/experts/<id>/status/ — Toggle active_status."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        expert = get_object_or_404(AgricultureExpert, pk=pk)
        new_status = request.data.get('active_status')
        if new_status is None:
            return Response(
                {"error": "active_status field is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        expert.active_status = bool(new_status)
        expert.save()
        return Response(
            {"message": f"Expert {'activated' if expert.active_status else 'deactivated'} successfully.",
             "active_status": expert.active_status},
            status=status.HTTP_200_OK
        )


class AdminConsultationStatsView(APIView):
    """GET /api/adminpanel/consultations/stats/ — Statistics for Admin Consultation Dashboard."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]

    def get(self, request):
        total = Consultation.objects.filter(is_deleted=False).count()
        pending = Consultation.objects.filter(status='Pending', is_deleted=False).count()
        replied = Consultation.objects.filter(status='Replied', is_deleted=False).count()
        closed = Consultation.objects.filter(status='Closed', is_deleted=False).count()
        
        today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_consultations = Consultation.objects.filter(
            created_date__gte=today_start,
            is_deleted=False
        ).count()

        return Response({
            "total_consultations": total,
            "pending": pending,
            "replied": replied,
            "closed": closed,
            "today_consultations": today_consultations
        }, status=status.HTTP_200_OK)


class AdminConsultationListView(APIView):
    """
    GET /api/adminpanel/consultations/ — List all consultations for Admin.
    Supports search, filter, and sorting.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]

    def get(self, request):
        queryset = Consultation.objects.filter(is_deleted=False)

        # Search by Farmer Name, Expert Name, Consultation ID, Subject
        search = request.query_params.get('search', '').strip()
        if search:
            if search.isdigit():
                queryset = queryset.filter(id=int(search))
            else:
                queryset = queryset.filter(
                    Q(farmer__full_name__icontains=search) |
                    Q(expert__name__icontains=search) |
                    Q(subject__icontains=search)
                )

        # Filter by status: Pending, Replied, Closed
        status_filter = request.query_params.get('status', '').strip()
        if status_filter in ['Pending', 'Replied', 'Closed']:
            queryset = queryset.filter(status=status_filter)

        # Filter by date: Today, This Week, This Month
        date_filter = request.query_params.get('date_range', '').strip().lower()
        now = timezone.now()
        if date_filter == 'today':
            queryset = queryset.filter(created_date__date=now.date())
        elif date_filter == 'week':
            queryset = queryset.filter(created_date__gte=now - datetime.timedelta(days=7))
        elif date_filter == 'month':
            queryset = queryset.filter(created_date__gte=now - datetime.timedelta(days=30))

        # Sort: Newest, Oldest
        sort_by = request.query_params.get('sort', '').strip().lower()
        if sort_by == 'oldest':
            queryset = queryset.order_by('created_date')
        else:
            queryset = queryset.order_by('-created_date')

        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        total_count = queryset.count()
        
        start = (page - 1) * page_size
        end = start + page_size
        paginated_qs = queryset[start:end]

        serializer = AdminConsultationSerializer(paginated_qs, many=True)
        return Response({
            "results": serializer.data,
            "total_count": total_count,
            "page": page,
            "page_size": page_size
        }, status=status.HTTP_200_OK)


class AdminConsultationDetailView(APIView):
    """GET|DELETE /api/adminpanel/consultations/<id>/ — Detailed view & soft delete for Admin."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        consultation = get_object_or_404(Consultation, pk=pk, is_deleted=False)
        serializer = AdminConsultationSerializer(consultation)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        consultation = get_object_or_404(Consultation, pk=pk, is_deleted=False)
        consultation.is_deleted = True
        consultation.save()
        return Response(
            {"success": True, "message": "Consultation soft-deleted successfully."},
            status=status.HTTP_200_OK
        )


class AdminConsultationStatusView(APIView):
    """PATCH /api/adminpanel/consultations/<id>/status/ — Update/Manage status (Close/Reopen)."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        consultation = get_object_or_404(Consultation, pk=pk, is_deleted=False)
        new_status = request.data.get('status')
        if not new_status:
            return Response(
                {"error": "status field is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if new_status not in ['Pending', 'Replied', 'Closed']:
            return Response(
                {"error": "Invalid status value."},
                status=status.HTTP_400_BAD_REQUEST
            )
        consultation.status = new_status
        consultation.save()
        return Response(
            {"message": f"Consultation status updated to {new_status} successfully.",
             "status": consultation.status},
            status=status.HTTP_200_OK
        )


class AdminNotificationListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            notifications = request.user.notifications.all()
            from farmer.serializers import NotificationSerializer
            serializer = NotificationSerializer(notifications, many=True)
            return Response({"data": serializer.data, "message": "Notifications fetched"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminNotificationDetailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            notification = request.user.notifications.get(pk=pk)
            notification.is_read = True
            notification.save()
            return Response({"message": "Notification marked as read."}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"error": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)

