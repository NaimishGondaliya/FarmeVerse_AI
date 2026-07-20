from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Count, Sum
import datetime
import csv
from django.http import HttpResponse

User = get_user_model()

# Create your views here.
class PingAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        return Response(
            {"status": "online", "message": "Welcome to FarmVerse AI - Analytics module API"}, 
            status=status.HTTP_200_OK
        )


class AdminAnalyticsDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        try:
            from farmer.models import Farm, Crop
            from consultation.models import Consultation
            from government_schemes.models import GovernmentScheme
            from disease_detection.models import DiseaseDetection
            from crop_recommendation.models import CropRecommendationLog
            from weather.models import WeatherRequestLog

            total_farmers = User.objects.filter(role='Farmer').count()
            total_experts = User.objects.filter(role='Expert').count()
            total_farms = Farm.objects.count()
            total_crop_records = Crop.objects.count()
            total_consultations = Consultation.objects.count()
            total_government_schemes = GovernmentScheme.objects.filter(is_deleted=False).count()
            disease_predictions = DiseaseDetection.objects.count()
            crop_recommendations = CropRecommendationLog.objects.count()
            weather_requests = WeatherRequestLog.objects.count()

            # Active users today (logged in within past 24 hours or today)
            today = timezone.now().date()
            yesterday = timezone.now() - datetime.timedelta(days=1)
            active_users_today = User.objects.filter(last_login__gte=yesterday).count()
            # Fallback to at least 1 (the caller admin)
            if active_users_today == 0:
                active_users_today = 1

            return Response({
                "success": True,
                "data": {
                    "total_farmers": total_farmers,
                    "total_experts": total_experts,
                    "total_farms": total_farms,
                    "total_crop_records": total_crop_records,
                    "total_consultations": total_consultations,
                    "total_government_schemes": total_government_schemes,
                    "disease_predictions": disease_predictions,
                    "crop_recommendations": crop_recommendations,
                    "weather_requests": weather_requests,
                    "active_users_today": active_users_today
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "success": False,
                "error": f"Failed to retrieve dashboard analytics: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminAnalyticsChartsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        try:
            from farmer.models import Farm, Crop
            from consultation.models import Consultation
            from government_schemes.models import GovernmentScheme
            from disease_detection.models import DiseaseDetection
            from crop_recommendation.models import CropRecommendationLog

            # 1. Farmers by District
            farmers_by_district = list(
                Farm.objects.values('district')
                .annotate(count=Count('farmer', distinct=True))
                .order_by('-count')
            )

            # 2. Crop Recommendations by Crop
            crop_recommendations = list(
                CropRecommendationLog.objects.values('recommended_crop')
                .annotate(count=Count('id'))
                .order_by('-count')
            )

            # 3. Disease Detection Statistics
            # We want both status (Healthy/Diseased) and detailed prediction types
            disease_status = list(
                DiseaseDetection.objects.values('status')
                .annotate(count=Count('id'))
            )
            disease_predictions = list(
                DiseaseDetection.objects.values('prediction')
                .annotate(count=Count('id'))
                .order_by('-count')
            )

            # 4. Consultation Status
            consultation_stats = list(
                Consultation.objects.values('status')
                .annotate(count=Count('id'))
            )

            # 5. Government Schemes status
            schemes_stats = list(
                GovernmentScheme.objects.filter(is_deleted=False)
                .values('status')
                .annotate(count=Count('id'))
            )

            # 6. User Registrations timeline (Daily, Weekly, Monthly)
            # Daily registrations (last 7 days)
            daily_regs = []
            for i in range(6, -1, -1):
                day = (timezone.now() - datetime.timedelta(days=i)).date()
                farmers = User.objects.filter(created_at__date=day, role='Farmer').count()
                experts = User.objects.filter(created_at__date=day, role='Expert').count()
                daily_regs.append({
                    "date": day.strftime('%Y-%m-%d'),
                    "farmers": farmers,
                    "experts": experts,
                    "total": farmers + experts
                })

            # Weekly registrations (last 4 weeks)
            weekly_regs = []
            for i in range(3, -1, -1):
                start = timezone.now() - datetime.timedelta(weeks=i+1)
                end = timezone.now() - datetime.timedelta(weeks=i)
                farmers = User.objects.filter(created_at__range=(start, end), role='Farmer').count()
                experts = User.objects.filter(created_at__range=(start, end), role='Expert').count()
                weekly_regs.append({
                    "week": f"Week -{i}",
                    "farmers": farmers,
                    "experts": experts,
                    "total": farmers + experts
                })

            # Monthly registrations (last 6 months)
            monthly_regs = []
            today = timezone.now().date()
            for i in range(5, -1, -1):
                year = today.year
                month = today.month - i
                while month <= 0:
                    month += 12
                    year -= 1
                farmers = User.objects.filter(created_at__year=year, created_at__month=month, role='Farmer').count()
                experts = User.objects.filter(created_at__year=year, created_at__month=month, role='Expert').count()
                month_name = datetime.date(year, month, 1).strftime('%b %Y')
                monthly_regs.append({
                    "month": month_name,
                    "farmers": farmers,
                    "experts": experts,
                    "total": farmers + experts
                })

            # 7. Top Lists
            top_crops = list(
                Crop.objects.values('crop_name')
                .annotate(count=Count('id'))
                .order_by('-count')[:10]
            )
            top_districts = list(
                Farm.objects.values('district')
                .annotate(count=Count('id'))
                .order_by('-count')[:5]
            )
            # Most active experts (grouped by registration / profile name)
            active_experts = list(
                Consultation.objects.filter(expert__isnull=False)
                .values('expert__name', 'expert__specialization')
                .annotate(count=Count('id'))
                .order_by('-count')[:5]
            )
            active_farmers = list(
                Consultation.objects.values('farmer__full_name', 'farmer__mobile')
                .annotate(count=Count('id'))
                .order_by('-count')[:5]
            )

            # 8. Recent Activity Lists
            recent_farmers = list(
                User.objects.filter(role='Farmer')
                .values('full_name', 'mobile', 'created_at')
                .order_by('-created_at')[:5]
            )
            recent_experts = list(
                User.objects.filter(role='Expert')
                .values('full_name', 'email', 'created_at')
                .order_by('-created_at')[:5]
            )
            recent_consultations = list(
                Consultation.objects.values('id', 'farmer__full_name', 'status', 'created_date')
                .order_by('-created_date')[:5]
            )
            recent_predictions = list(
                DiseaseDetection.objects.values('id', 'farmer__full_name', 'crop', 'prediction', 'confidence', 'status', 'created_at')
                .order_by('-created_at')[:5]
            )
            recent_schemes = list(
                GovernmentScheme.objects.filter(is_deleted=False)
                .values('id', 'title', 'status', 'created_at')
                .order_by('-created_at')[:5]
            )

            # Format Datetime serialization safety
            for items in [recent_farmers, recent_experts, recent_consultations, recent_predictions, recent_schemes]:
                for item in items:
                    for key in ['created_at', 'created_date']:
                        if key in item and item[key]:
                            item[key] = item[key].strftime('%Y-%m-%d %H:%M')

            return Response({
                "success": True,
                "farmers_by_district": farmers_by_district,
                "crop_recommendations": crop_recommendations,
                "disease_status": disease_status,
                "disease_predictions": disease_predictions,
                "consultation_stats": consultation_stats,
                "schemes_stats": schemes_stats,
                "timeline": {
                    "daily": daily_regs,
                    "weekly": weekly_regs,
                    "monthly": monthly_regs
                },
                "top_lists": {
                    "crops": top_crops,
                    "districts": top_districts,
                    "experts": active_experts,
                    "farmers": active_farmers
                },
                "recent_activity": {
                    "farmers": recent_farmers,
                    "experts": recent_experts,
                    "consultations": recent_consultations,
                    "predictions": recent_predictions,
                    "schemes": recent_schemes
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "success": False,
                "error": f"Failed to retrieve charts/tables content: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminAnalyticsExportView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def perform_content_negotiation(self, request, force=False):
        # Prevent DRF content negotiator from raising Http404 when request format choice is not standard JSON/HTML
        from rest_framework.renderers import JSONRenderer
        return (JSONRenderer(), 'application/json')

    def get(self, request):
        import traceback
        try:
            export_format = request.query_params.get('format', 'csv').lower()

            from farmer.models import Farm, Crop
            from consultation.models import Consultation
            from government_schemes.models import GovernmentScheme
            from disease_detection.models import DiseaseDetection
            from crop_recommendation.models import CropRecommendationLog
            from weather.models import WeatherRequestLog

            # Gather summary data for export
            metrics = {
                "Total Farmers": User.objects.filter(role='Farmer').count(),
                "Total Experts": User.objects.filter(role='Expert').count(),
                "Total Farms": Farm.objects.count(),
                "Total Crop Records": Crop.objects.count(),
                "Total Consultations": Consultation.objects.count(),
                "Total Government Schemes": GovernmentScheme.objects.filter(is_deleted=False).count(),
                "Disease Predictions": DiseaseDetection.objects.count(),
                "Crop Recommendations": CropRecommendationLog.objects.count(),
                "Weather Requests": WeatherRequestLog.objects.count()
            }

            filename_prefix = f"farmverse_analytics_{timezone.now().strftime('%Y%m%d')}"

            if export_format in ['csv', 'excel']:
                response = HttpResponse(content_type='text/csv')
                response['Content-Disposition'] = f'attachment; filename="{filename_prefix}.csv"'

                writer = csv.writer(response)
                writer.writerow(['Metric Name', 'Count / Value'])
                for key, val in metrics.items():
                    writer.writerow([key, val])
                
                # Append detailed listings below summary
                writer.writerow([])
                writer.writerow(['Recent System Activity Feed'])
                writer.writerow(['Category', 'Reference Details', 'Timestamp'])

                farmers = User.objects.filter(role='Farmer').order_by('-created_at')[:10]
                for f in farmers:
                    writer.writerow(['Farmer Registration', f.full_name, f.created_at.strftime('%Y-%m-%d %H:%M')])

                consults = Consultation.objects.order_by('-created_date')[:10]
                for c in consults:
                    writer.writerow(['Expert Consultation', f"ID {c.id} - Status {c.status}", c.created_date.strftime('%Y-%m-%d %H:%M')])

                return response

            elif export_format == 'pdf':
                response = HttpResponse(content_type='application/pdf')
                response['Content-Disposition'] = f'attachment; filename="{filename_prefix}.pdf"'

                # PDF Header
                pdf = b"%PDF-1.4\n"
                # Catalog Object
                pdf += b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
                # Pages Object
                pdf += b"2 0 obj\n<< /Type /Pages /Kids [ 3 0 R ] /Count 1 >>\nendobj\n"
                
                # Content Stream Page Setup
                title = "FarmVerse AI - System Analytics Report Summary"
                timestamp = f"Generated at: {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}"
                
                # Standard Helvetica Font Setup
                text = f"BT /F1 14 Tf 50 750 Td ({title}) Tj 0 -22 Td /F1 10 Tf ({timestamp}) Tj 0 -25 Td "
                text += "(/F1 12 Tf Metrics Dashboard Summary:) Tj 0 -18 Td /F1 10 Tf "
                
                for k, v in metrics.items():
                    text += f"({k}: {v}) Tj 0 -15 Td "
                
                text += "ET"
                stream = text.encode('latin1')
                
                # Page Object references
                pdf += b"3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents 4 0 R >>\nendobj\n"
                pdf += f"4 0 obj\n<< /Length {len(stream)} >>\nstream\n".encode('latin1') + stream + b"\nendstream\nendobj\n"
                
                # Cross-reference offset
                pdf += b"xref\n0 5\n0000000000 65535 f\n" \
                       b"0000000009 00000 n\n" \
                       b"0000000062 00000 n\n" \
                       b"0000000125 00000 n\n" \
                       b"0000000300 00000 n\n" \
                       b"trailer\n<< /Size 5 /Root 1 0 R >>\n" \
                       b"startxref\n0\n%%EOF\n"
                
                response.write(pdf)
                return response

            else:
                return Response({"success": False, "message": "Invalid export format specified."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            traceback.print_exc()
            raise e
