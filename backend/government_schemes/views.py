from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Q
from .models import GovernmentScheme
from .serializers import GovernmentSchemeSerializer

class PingGovernmentSchemesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            {"status": "online", "message": "Welcome to FarmVerse AI - GovernmentSchemes module API"}, 
            status=status.HTTP_200_OK
        )

class GovernmentSchemeListView(APIView):
    """
    List all active government schemes.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        status_param = request.query_params.get('status', 'Active')
        if status_param.lower() == 'all':
            schemes = GovernmentScheme.objects.all()
        else:
            schemes = GovernmentScheme.objects.filter(status__iexact=status_param)
            
        serializer = GovernmentSchemeSerializer(schemes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class GovernmentSchemeDetailView(APIView):
    """
    Retrieve single government scheme.
    """
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            scheme = GovernmentScheme.objects.get(pk=pk)
            serializer = GovernmentSchemeSerializer(scheme)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except GovernmentScheme.DoesNotExist:
            return Response(
                {"detail": "Government scheme not found."},
                status=status.HTTP_404_NOT_FOUND
            )

class GovernmentSchemeSearchView(APIView):
    """
    Search schemes by name, category, state, crop, and farmer type.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        name = request.query_params.get('name') or request.query_params.get('scheme_name') or request.query_params.get('search')
        category = request.query_params.get('category')
        state = request.query_params.get('state') or request.query_params.get('scheme_type')
        crop = request.query_params.get('crop') or request.query_params.get('crop_category')
        farmer_type = request.query_params.get('farmer_type') or request.query_params.get('farmer_category')

        # We start with Active schemes by default
        queryset = GovernmentScheme.objects.filter(status='Active')

        if name:
            name = name.strip()
            queryset = queryset.filter(
                Q(scheme_name__icontains=name) | 
                Q(gujarati_name__icontains=name) | 
                Q(description__icontains=name)
            )

        if category:
            category = category.strip()
            queryset = queryset.filter(
                Q(farmer_category__icontains=category) | 
                Q(crop_category__icontains=category) | 
                Q(scheme_type__icontains=category)
            )

        if state:
            state = state.strip()
            if state.lower() == 'gujarat':
                queryset = queryset.filter(scheme_type='Gujarat')
            elif state.lower() == 'central':
                queryset = queryset.filter(scheme_type='Central')
            else:
                queryset = queryset.filter(scheme_type__icontains=state)

        if crop:
            crop = crop.strip()
            queryset = queryset.filter(crop_category__icontains=crop)

        if farmer_type:
            farmer_type = farmer_type.strip()
            queryset = queryset.filter(farmer_category__icontains=farmer_type)

        serializer = GovernmentSchemeSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class GovernmentSchemeCategoriesView(APIView):
    """
    Get all unique categories present in the database:
    farmer categories, crop categories, and scheme types.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        scheme_types = list(GovernmentScheme.objects.values_list('scheme_type', flat=True).distinct())
        
        raw_farmer_cats = GovernmentScheme.objects.values_list('farmer_category', flat=True).distinct()
        farmer_categories = set()
        for cat in raw_farmer_cats:
            if cat:
                for sub_cat in cat.split(','):
                    farmer_categories.add(sub_cat.strip())
                    
        raw_crop_cats = GovernmentScheme.objects.values_list('crop_category', flat=True).distinct()
        crop_categories = set()
        for cat in raw_crop_cats:
            if cat:
                for sub_cat in cat.split(','):
                    crop_categories.add(sub_cat.strip())

        return Response({
            "scheme_types": sorted(list(filter(None, scheme_types))),
            "farmer_categories": sorted(list(filter(None, farmer_categories))),
            "crop_categories": sorted(list(filter(None, crop_categories)))
        }, status=status.HTTP_200_OK)


from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAdminUser
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination

class SchemesPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class SchemePublicListView(APIView):
    """
    GET /api/schemes/
    Public endpoint to view all active, non-deleted schemes.
    Featured schemes appear first.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        queryset = GovernmentScheme.objects.filter(status='Active', is_deleted=False)
        
        # Search by title, department, category, or description
        search = request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(scheme_name__icontains=search) |
                Q(department__icontains=search) |
                Q(category__icontains=search) |
                Q(description__icontains=search)
            )

        # Filters
        category = request.query_params.get('category', '').strip()
        if category:
            queryset = queryset.filter(category__iexact=category)

        scheme_type = request.query_params.get('scheme_type', '').strip()
        if scheme_type:
            queryset = queryset.filter(scheme_type__iexact=scheme_type)

        farmer_category = request.query_params.get('farmer_category', '').strip()
        if farmer_category:
            queryset = queryset.filter(farmer_category__icontains=farmer_category)

        crop_category = request.query_params.get('crop_category', '').strip()
        if crop_category:
            queryset = queryset.filter(crop_category__icontains=crop_category)

        featured = request.query_params.get('featured', '').strip()
        if featured:
            is_featured = featured.lower() in ('true', 'yes', '1')
            queryset = queryset.filter(featured=is_featured)

        # Ordering: featured first, then name
        queryset = queryset.order_by('-featured', 'scheme_name')
        
        # Paginate if page parameter is passed
        if 'page' in request.query_params:
            paginator = SchemesPagination()
            page = paginator.paginate_queryset(queryset, request, view=self)
            serializer = GovernmentSchemeSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
            
        serializer = GovernmentSchemeSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AdminSchemeStatsView(APIView):
    """
    GET /api/admin/schemes/stats/
    Protected endpoint to fetch dashboard metrics.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]

    def get(self, request):
        queryset = GovernmentScheme.objects.filter(is_deleted=False)
        total = queryset.count()
        active = queryset.filter(status='Active').count()
        expired = queryset.filter(status='Expired').count()
        draft = queryset.filter(status='Draft').count()
        return Response({
            "total_schemes": total,
            "active_schemes": active,
            "expired_schemes": expired,
            "draft_schemes": draft
        }, status=status.HTTP_200_OK)

class AdminSchemeListView(APIView):
    """
    GET /api/admin/schemes/ - List all schemes (including Draft/Expired) for Admin with pagination.
    POST /api/admin/schemes/ - Create a new scheme.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]

    def get(self, request):
        queryset = GovernmentScheme.objects.filter(is_deleted=False)

        # Search by title, department, or category
        search = request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(scheme_name__icontains=search) |
                Q(department__icontains=search) |
                Q(category__icontains=search)
            )

        # Filters
        status_filter = request.query_params.get('status', '').strip()
        if status_filter:
            queryset = queryset.filter(status__iexact=status_filter)

        featured_filter = request.query_params.get('featured', '').strip()
        if featured_filter:
            is_featured = featured_filter.lower() in ('true', 'yes', '1')
            queryset = queryset.filter(featured=is_featured)

        # Sorting: newest updated/created or default featured
        sort_by = request.query_params.get('sort_by', '').strip()
        if sort_by == 'newest':
            queryset = queryset.order_by('-created_at')
        elif sort_by == 'title':
            queryset = queryset.order_by('scheme_name')
        else:
            queryset = queryset.order_by('-featured', '-updated_at')

        paginator = SchemesPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = GovernmentSchemeSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = GovernmentSchemeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminSchemeDetailView(APIView):
    """
    GET /api/admin/schemes/{id}/ - Retrieve a scheme
    PUT /api/admin/schemes/{id}/ - Edit a scheme.
    DELETE /api/admin/schemes/{id}/ - Soft delete a scheme.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        scheme = get_object_or_404(GovernmentScheme, pk=pk, is_deleted=False)
        serializer = GovernmentSchemeSerializer(scheme)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        scheme = get_object_or_404(GovernmentScheme, pk=pk, is_deleted=False)
        serializer = GovernmentSchemeSerializer(scheme, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        scheme = get_object_or_404(GovernmentScheme, pk=pk, is_deleted=False)
        scheme.is_deleted = True
        scheme.save()
        return Response({"message": "Scheme deleted successfully (soft delete)."}, status=status.HTTP_200_OK)

