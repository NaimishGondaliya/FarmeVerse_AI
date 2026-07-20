from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import GovernmentScheme

class GovernmentSchemesAPITests(APITestCase):
    def setUp(self):
        # Create test schemes
        self.scheme1 = GovernmentScheme.objects.create(
            scheme_name="PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
            gujarati_name="પીએમ કિસાન સન્માન નિધિ",
            scheme_type="Central",
            description="Provides Rs 6000 per year.",
            eligibility="Landholding farmers.",
            benefits="Rs 6000 cash.",
            required_documents="Aadhaar, Land records.",
            official_website="https://pmkisan.gov.in/",
            apply_link="https://pmkisan.gov.in/",
            farmer_category="Small & Marginal Farmers",
            crop_category="All Crops",
            status="Active"
        )
        self.scheme2 = GovernmentScheme.objects.create(
            scheme_name="Organic Farming Assistance Scheme",
            gujarati_name="સજીવ ખેતી સહાય યોજના",
            scheme_type="Gujarat",
            description="Cow rearing assistance.",
            eligibility="Organic farmers.",
            benefits="Rs 900/month.",
            required_documents="Cow registry.",
            official_website="https://ikhedut.gujarat.gov.in/",
            apply_link="https://ikhedut.gujarat.gov.in/",
            farmer_category="Organic Farmers",
            crop_category="Organic Crops",
            status="Active"
        )
        self.scheme_inactive = GovernmentScheme.objects.create(
            scheme_name="Inactive Scheme test",
            gujarati_name="નિષ્ક્રિય યોજના",
            scheme_type="Central",
            description="Inactive scheme",
            eligibility="None",
            benefits="None",
            required_documents="None",
            farmer_category="All",
            crop_category="All",
            status="Inactive"
        )

    def test_ping_endpoint(self):
        url = reverse('government_schemes:ping')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'online')

    def test_list_schemes_default_active(self):
        url = reverse('government_schemes:list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        # Check active schemes are returned
        names = [item['scheme_name'] for item in response.data]
        self.assertIn("PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)", names)
        self.assertIn("Organic Farming Assistance Scheme", names)
        self.assertNotIn("Inactive Scheme test", names)

    def test_list_schemes_all(self):
        url = reverse('government_schemes:list')
        response = self.client.get(url, {'status': 'all'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_detail_scheme_success(self):
        url = reverse('government_schemes:detail', kwargs={'pk': self.scheme1.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['scheme_name'], self.scheme1.scheme_name)

    def test_detail_scheme_not_found(self):
        url = reverse('government_schemes:detail', kwargs={'pk': 99999})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_search_by_name(self):
        url = reverse('government_schemes:search')
        response = self.client.get(url, {'search': 'Organic'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['scheme_name'], "Organic Farming Assistance Scheme")

    def test_search_by_gujarati_name(self):
        url = reverse('government_schemes:search')
        response = self.client.get(url, {'search': 'પીએમ'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['scheme_name'], "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)")

    def test_search_by_state_central(self):
        url = reverse('government_schemes:search')
        response = self.client.get(url, {'state': 'Central'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['scheme_name'], "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)")

    def test_search_by_state_gujarat(self):
        url = reverse('government_schemes:search')
        response = self.client.get(url, {'state': 'Gujarat'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['scheme_name'], "Organic Farming Assistance Scheme")

    def test_search_by_crop(self):
        url = reverse('government_schemes:search')
        response = self.client.get(url, {'crop': 'Organic'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['scheme_name'], "Organic Farming Assistance Scheme")

    def test_search_by_farmer_type(self):
        url = reverse('government_schemes:search')
        response = self.client.get(url, {'farmer_type': 'Marginal'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['scheme_name'], "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)")

    def test_categories_endpoint(self):
        url = reverse('government_schemes:categories')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.assertIn("Central", response.data['scheme_types'])
        self.assertIn("Gujarat", response.data['scheme_types'])
        
        self.assertIn("Small & Marginal Farmers", response.data['farmer_categories'])
        self.assertIn("Organic Farmers", response.data['farmer_categories'])
        
        self.assertIn("All Crops", response.data['crop_categories'])
        self.assertIn("Organic Crops", response.data['crop_categories'])


from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()

class GovernmentSchemesAdminAPITests(APITestCase):
    def setUp(self):
        # Create users
        self.admin_user = User.objects.create_superuser(
            mobile="9999999999", 
            email="admin@test.com", 
            full_name="System Admin",
            password="adminpassword"
        )
        self.farmer_user = User.objects.create_user(
            mobile="9876543211",
            email="farmer1@test.com", 
            full_name="Kisan Patel",
            password="farmerpassword",
            role="Farmer"
        )
        
        self.admin_token = str(AccessToken.for_user(self.admin_user))
        self.farmer_token = str(AccessToken.for_user(self.farmer_user))

        # Create schemes
        self.scheme1 = GovernmentScheme.objects.create(
            scheme_name="PM-KISAN",
            gujarati_name="પીએમ કિસાન",
            scheme_type="Central",
            description="PM-KISAN description",
            eligibility="Eligibility text",
            benefits="Benefits text",
            status="Active",
            featured=True
        )
        self.scheme2 = GovernmentScheme.objects.create(
            scheme_name="Draft Scheme Example",
            gujarati_name="ડ્રાફ્ટ યોજના",
            scheme_type="Gujarat",
            description="Draft desc",
            eligibility="Eligibility text",
            benefits="Benefits text",
            status="Draft",
            featured=False
        )

    def test_stats_anonymous_denied(self):
        response = self.client.get('/api/admin/schemes/stats/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_stats_farmer_denied(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.farmer_token}')
        response = self.client.get('/api/admin/schemes/stats/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_stats_admin_success(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        response = self.client.get('/api/admin/schemes/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_schemes'], 2)
        self.assertEqual(response.data['active_schemes'], 1)
        self.assertEqual(response.data['draft_schemes'], 1)
        self.assertEqual(response.data['expired_schemes'], 0)

    def test_admin_list_success(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        response = self.client.get('/api/admin/schemes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertEqual(response.data['count'], 2)

    def test_admin_create_scheme(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        payload = {
            "scheme_name": "New Admin Scheme",
            "title": "New Admin Scheme",
            "description": "Details",
            "eligibility": "Everyone",
            "benefits": "Good benefits",
            "status": "Draft",
            "department": "Agriculture Department",
            "category": "Subsidy",
            "featured": True
        }
        response = self.client.post('/api/admin/schemes/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['scheme_name'], "New Admin Scheme")
        self.assertTrue(response.data['featured'])

    def test_admin_update_scheme(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        payload = {
            "status": "Expired",
            "description": "Updated description"
        }
        response = self.client.put(f'/api/admin/schemes/{self.scheme1.id}/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], "Expired")
        self.assertEqual(response.data['description'], "Updated description")

    def test_admin_delete_scheme_soft(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        response = self.client.delete(f'/api/admin/schemes/{self.scheme1.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.scheme1.refresh_from_db()
        self.assertTrue(self.scheme1.is_deleted)

