from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from farmer.models import Farm, Crop
from government_schemes.models import GovernmentScheme
from consultation.models import Consultation
from disease_detection.models import DiseaseDetection
from crop_recommendation.models import CropRecommendationLog
from weather.models import WeatherRequestLog
import datetime

User = get_user_model()

class AdminAnalyticsTests(APITestCase):
    def setUp(self):
        # Create an Admin user
        self.admin_user = User.objects.create_superuser(
            mobile="1234567890",
            email="admin@farmverse.com",
            full_name="Admin User",
            password="adminpassword"
        )
        # Create a Farmer user
        self.farmer_user = User.objects.create_user(
            mobile="9876543210",
            email="farmer@farmverse.com",
            full_name="Farmer User",
            password="farmerpassword",
            role="Farmer"
        )
        
        # Authenticate admin client using SimpleJWT token or force_authenticate
        self.client.force_authenticate(user=self.admin_user)
        
        # Setup mock entities for counts and group statistics
        self.farm = Farm.objects.create(
            farmer=self.farmer_user,
            farm_name="Test Farm",
            village="Sarkhej",
            taluka="Ghatlodia",
            district="Ahmedabad",
            total_area=10.5,
            area_unit="Acre",
            soil_type="Black",
            irrigation_type="Drip"
        )
        
        self.crop = Crop.objects.create(
            farm=self.farm,
            crop_name="Cotton",
            crop_variety="Hybrid",
            season="Kharif",
            sowing_date=datetime.date.today(),
            expected_harvest_date=datetime.date.today() + datetime.timedelta(days=120),
            area_used=5.0,
            area_unit="Acre",
            expected_yield=2000.0
        )
        
        self.scheme = GovernmentScheme.objects.create(
            title="Gujarat Farmer Subsidy",
            scheme_type="Gujarat",
            department="Agriculture Dept",
            description="Subsidy for small and marginal farmers",
            eligibility="All Gujarat Farmers",
            benefits="Up to 50% discount",
            status="Active"
        )
        
        # Create an expert
        from expert.models import AgricultureExpert
        self.expert = AgricultureExpert.objects.create(
            name="Dr. Arvind Patel",
            photo="/static/arvind.jpg",
            qualification="Ph.D. in Horticulture",
            specialization="Horticulture",
            experience=15,
            district="Rajkot",
            phone="9876543210",
            email="arvind@test.com",
            office_address="Rajkot Office",
            languages="Gujarati, English",
            availability="Monday",
            google_map_link="https://maps.google.com/?q=Rajkot",
            rating=4.8
        )
        
        self.consultation = Consultation.objects.create(
            farmer=self.farmer_user,
            expert=self.expert,
            subject="Tomato spots",
            message="Yellow spots on leaves",
            status="Pending"
        )
        
        self.detection = DiseaseDetection.objects.create(
            farmer=self.farmer_user,
            farm=self.farm,
            crop="Cotton",
            prediction="Cotton Leaf Curl",
            confidence=95.0,
            status="Diseased"
        )
        
        self.rec_log = CropRecommendationLog.objects.create(
            user=self.farmer_user,
            city="Ahmedabad",
            district="Ahmedabad",
            soil_type="Black",
            season="Kharif",
            recommended_crop="Cotton",
            confidence=98.5
        )
        
        self.w_log = WeatherRequestLog.objects.create(
            user=self.farmer_user,
            city="Ahmedabad",
            temperature=32.5,
            condition="Sunny"
        )

    def test_analytics_dashboard_metrics(self):
        url = reverse('analytics:dashboard')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        
        data = response.data['data']
        self.assertEqual(data['total_farmers'], 1)
        self.assertEqual(data['total_farms'], 1)
        self.assertEqual(data['total_crop_records'], 1)
        self.assertEqual(data['total_consultations'], 1)
        self.assertEqual(data['total_government_schemes'], 1)
        self.assertEqual(data['disease_predictions'], 1)
        self.assertEqual(data['crop_recommendations'], 1)
        self.assertEqual(data['weather_requests'], 1)

    def test_analytics_charts_data(self):
        url = reverse('analytics:charts')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        
        self.assertIn('farmers_by_district', response.data)
        self.assertIn('crop_recommendations', response.data)
        self.assertIn('disease_status', response.data)
        self.maxDiff = None
        self.assertEqual(response.data['farmers_by_district'][0]['district'], "Ahmedabad")
        self.assertEqual(response.data['top_lists']['crops'][0]['crop_name'], "Cotton")

    def test_analytics_export_csv(self):
        url = reverse('analytics:export')
        response = self.client.get(url, {'format': 'csv'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'text/csv')

    def test_analytics_export_pdf(self):
        url = reverse('analytics:export')
        response = self.client.get(url, {'format': 'pdf'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'application/pdf')

    def test_analytics_forbidden_for_non_admin(self):
        # Authenticate as normal farmer
        self.client.force_authenticate(user=self.farmer_user)
        url = reverse('analytics:dashboard')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
