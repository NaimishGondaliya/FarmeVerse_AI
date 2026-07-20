from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
import datetime

from expert.models import AgricultureExpert
from consultation.models import Consultation, ConsultationReply

User = get_user_model()

class AdminConsultationTests(APITestCase):

    def setUp(self):
        # Create an admin user
        self.admin_user = User.objects.create_superuser(
            mobile="9999999999", 
            email="admin@test.com", 
            full_name="System Admin",
            password="adminpassword"
        )
        # Create a farmer user
        self.farmer_user = User.objects.create_user(
            mobile="9876543211",
            email="farmer1@test.com", 
            full_name="Kisan Patel",
            password="farmerpassword",
            role="Farmer"
        )
        # Create an expert
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

        # Create consultation tickets
        self.c1 = Consultation.objects.create(
            farmer=self.farmer_user,
            expert=self.expert,
            subject="Tomato Leaf Disease",
            message="There are yellow spots on leaves.",
            status="Pending"
        )
        self.c2 = Consultation.objects.create(
            farmer=self.farmer_user,
            expert=self.expert,
            subject="Wheat Crop Fertilizers",
            message="Which NPK ratio is best?",
            status="Replied"
        )
        self.c3 = Consultation.objects.create(
            farmer=self.farmer_user,
            expert=self.expert,
            subject="Cotton Pest Infection",
            message="Insects on cotton buds.",
            status="Closed"
        )

        # Add replies
        ConsultationReply.objects.create(
            consultation=self.c2,
            sender="Expert",
            message="Use NPK 19-19-19 water soluble ratio."
        )

        # Generate simple JWT tokens for authentication
        self.admin_token = str(AccessToken.for_user(self.admin_user))
        self.farmer_token = str(AccessToken.for_user(self.farmer_user))

    def test_stats_authentication_required(self):
        url = reverse('adminpanel:consultation-stats')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_stats_admin_permission_required(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.farmer_token}')
        url = reverse('adminpanel:consultation-stats')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_consultation_stats(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        url = reverse('adminpanel:consultation-stats')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_consultations'], 3)
        self.assertEqual(response.data['pending'], 1)
        self.assertEqual(response.data['replied'], 1)
        self.assertEqual(response.data['closed'], 1)
        self.assertEqual(response.data['today_consultations'], 3)

    def test_list_consultations_searching(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        url = reverse('adminpanel:consultation-list')
        
        # Search by subject
        response = self.client.get(url, {'search': 'Tomato'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_count'], 1)
        self.assertEqual(response.data['results'][0]['subject'], "Tomato Leaf Disease")

        # Search by Farmer Name
        response = self.client.get(url, {'search': 'Kisan'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_count'], 3)

        # Search by Consultation ID
        response = self.client.get(url, {'search': str(self.c3.id)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_count'], 1)
        self.assertEqual(response.data['results'][0]['id'], self.c3.id)

    def test_list_consultations_filtering(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        url = reverse('adminpanel:consultation-list')

        # Filter by status: Closed
        response = self.client.get(url, {'status': 'Closed'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_count'], 1)
        self.assertEqual(response.data['results'][0]['status'], 'Closed')

        # Filter by status: Pending
        response = self.client.get(url, {'status': 'Pending'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_count'], 1)

    def test_list_consultations_sorting(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        url = reverse('adminpanel:consultation-list')

        # Sorted by Oldest
        response = self.client.get(url, {'sort': 'oldest'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # c1 is created first
        self.assertEqual(response.data['results'][0]['id'], self.c1.id)

        # Sorted by Newest (default)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['results'][0]['id'], self.c3.id)

    def test_get_consultation_detail(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        url = reverse('adminpanel:consultation-detail', kwargs={'pk': self.c2.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['subject'], "Wheat Crop Fertilizers")
        self.assertEqual(len(response.data['replies']), 1)
        self.assertEqual(response.data['replies'][0]['message'], "Use NPK 19-19-19 water soluble ratio.")

    def test_patch_consultation_status_close_and_reopen(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        
        # Mark Closed
        url = reverse('adminpanel:consultation-status', kwargs={'pk': self.c1.pk})
        response = self.client.patch(url, {'status': 'Closed'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'Closed')
        self.c1.refresh_from_db()
        self.assertEqual(self.c1.status, 'Closed')

        # Reopen Closed (sets status back to Pending)
        url = reverse('adminpanel:consultation-status', kwargs={'pk': self.c3.pk})
        response = self.client.patch(url, {'status': 'Pending'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'Pending')
        self.c3.refresh_from_db()
        self.assertEqual(self.c3.status, 'Pending')

    def test_soft_delete_consultation(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        url = reverse('adminpanel:consultation-detail', kwargs={'pk': self.c1.pk})
        
        # Soft delete
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        
        self.c1.refresh_from_db()
        self.assertTrue(self.c1.is_deleted)

        # Checking listing should not show soft deleted
        list_url = reverse('adminpanel:consultation-list')
        list_response = self.client.get(list_url)
        self.assertEqual(list_response.data['total_count'], 2)
        # Ticket 1 should be gone from admin list
        ticket_ids = [t['id'] for t in list_response.data['results']]
        self.assertNotIn(self.c1.id, ticket_ids)


from django.core.files.uploadedfile import SimpleUploadedFile

class AdminProfileTests(APITestCase):

    def setUp(self):
        # Create an admin user
        self.admin_user = User.objects.create_superuser(
            mobile="9999999901",
            email="admin_profile@test.com",
            full_name="Profile Admin",
            password="AdminPassword123!"
        )
        # Create another user to test unique email/mobile validation
        self.other_user = User.objects.create_user(
            mobile="8888888888",
            email="other@test.com",
            full_name="Other User",
            password="password123!",
            role="Farmer"
        )
        self.admin_token = str(AccessToken.for_user(self.admin_user))
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')

    def test_get_profile_unauthorized(self):
        self.client.credentials()  # Clear auth
        response = self.client.get('/api/admin/profile/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_profile_success(self):
        response = self.client.get('/api/admin/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["full_name"], "Profile Admin")
        self.assertEqual(response.data["email"], "admin_profile@test.com")
        self.assertEqual(response.data["language"], "ENG")  # Default preference
        self.assertEqual(response.data["theme"], "Light")

    def test_put_profile_success(self):
        payload = {
            "full_name": "Updated Admin",
            "email": "updated_admin@test.com",
            "mobile": "9999999900",  # exactly 10 digits
            "username": "superadmin",
            "language": "GUJ",
            "theme": "Dark"
        }
        response = self.client.put('/api/admin/profile/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.admin_user.refresh_from_db()
        self.assertEqual(self.admin_user.full_name, "Updated Admin")
        self.assertEqual(self.admin_user.email, "updated_admin@test.com")
        self.assertEqual(self.admin_user.mobile, "9999999900")
        
        self.assertEqual(response.data["username"], "superadmin")
        self.assertEqual(response.data["language"], "GUJ")
        self.assertEqual(response.data["theme"], "Dark")

    def test_put_profile_validation_errors(self):
        # 1. Invalid email
        payload = {
            "full_name": "Updated Admin",
            "email": "invalidemail",
            "mobile": "8123456789",
            "language": "ENG",
            "theme": "Light"
        }
        response = self.client.put('/api/admin/profile/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

        # 2. Invalid mobile (digits length != 10)
        payload = {
            "full_name": "Updated Admin",
            "email": "fresh@test.com",
            "mobile": "12345",
            "language": "ENG",
            "theme": "Light"
        }
        response = self.client.put('/api/admin/profile/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("mobile", response.data)

        # 3. Duplicate email
        payload = {
            "full_name": "Updated Admin",
            "email": "other@test.com",  # taken by other_user
            "mobile": "7123456789",
            "language": "ENG",
            "theme": "Light"
        }
        response = self.client.put('/api/admin/profile/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_patch_change_password_success(self):
        payload = {
            "current_password": "AdminPassword123!",
            "new_password": "StrictNewPassword123$$",
            "confirm_password": "StrictNewPassword123$$"
        }
        response = self.client.patch('/api/admin/change-password/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.admin_user.refresh_from_db()
        self.assertTrue(self.admin_user.check_password("StrictNewPassword123$$"))

    def test_patch_change_password_validation(self):
        # 1. Incorrect current password
        payload = {
            "current_password": "wrongpassword",
            "new_password": "StrictNewPassword123$$",
            "confirm_password": "StrictNewPassword123$$"
        }
        response = self.client.patch('/api/admin/change-password/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("current_password", response.data)

        # 2. Mismatch new passwords
        payload = {
            "current_password": "AdminPassword123!",
            "new_password": "StrictNewPassword123$$",
            "confirm_password": "StrictNewPassword123##"
        }
        response = self.client.patch('/api/admin/change-password/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("confirm_password", response.data)

        # 3. Weak new password (no uppercase or digits)
        payload = {
            "current_password": "AdminPassword123!",
            "new_password": "weak",
            "confirm_password": "weak"
        }
        response = self.client.patch('/api/admin/change-password/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("new_password", response.data)

    def test_profile_photo_upload_and_delete(self):
        mock_file = SimpleUploadedFile("avatar.jpg", b"file_content", content_type="image/jpeg")
        response = self.client.post('/api/admin/profile/photo/', {"profile_picture": mock_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.data["profile_picture"])

        # Test DELETE photo
        delete_response = self.client.delete('/api/admin/profile/photo/')
        self.assertEqual(delete_response.status_code, status.HTTP_200_OK)
        self.assertNullImage = delete_response.data["profile_picture"]
        self.assertIsNone(self.assertNullImage)

