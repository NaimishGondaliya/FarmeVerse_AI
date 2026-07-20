import os
import django
import sys
import unittest
from django.utils import timezone
from datetime import timedelta

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from authentication.models import OTP

User = get_user_model()


class TestAuthenticationEndpoints(unittest.TestCase):
    def setUp(self):
        self.client = APIClient()
        # Clean up database tables
        User.objects.all().delete()
        OTP.objects.all().delete()

        self.farmer_register_payload = {
            "full_name": "Ramesh Patel",
            "mobile": "9876543210",
            "email": "ramesh.patel@example.com",
            "password": "FarmerPassword@123",
            "role": "Farmer"
        }

        self.expert_register_payload = {
            "full_name": "Dr. Amit Shah",
            "mobile": "9998887776",
            "email": "amit.shah@example.com",
            "password": "ExpertPassword#456",
            "role": "Expert"
        }

    def tearDown(self):
        User.objects.all().delete()
        OTP.objects.all().delete()

    def test_01_registration_flow(self):
        print("\n--- Testing Registration Flow ---")
        # 1. Register Farmer
        response = self.client.post("/api/auth/register/", self.farmer_register_payload, format='json')
        print(f"Register farmer status: {response.status_code}")
        print(f"Register farmer response: {response.json()}")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.json()["success"])
        self.assertEqual(response.json()["data"]["mobile"], "9876543210")

        # 2. Check duplicate registration (mobile)
        response_dup = self.client.post("/api/auth/register/", self.farmer_register_payload, format='json')
        print(f"Register duplicate status: {response_dup.status_code}")
        self.assertEqual(response_dup.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response_dup.json()["success"])
        self.assertIn("mobile", response_dup.json()["errors"])

    def test_02_login_and_profile_flow(self):
        print("\n--- Testing Login and Profile Flow ---")
        # 1. Create and verify a farmer manually
        user = User.objects.create_user(
            mobile="9876543210",
            email="ramesh@example.com",
            full_name="Ramesh Patel",
            role="Farmer",
            password="FarmerPassword@123"
        )
        user.is_verified = True
        user.save()

        # 2. Login
        login_payload = {
            "credential": "9876543210",
            "password": "FarmerPassword@123",
            "role": "Farmer"
        }
        response = self.client.post("/api/auth/login/", login_payload, format='json')
        print(f"Login status: {response.status_code}")
        print(f"Login body: {response.json()}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.json()["success"])
        
        access_token = response.json()["data"]["tokens"]["access"]
        refresh_token = response.json()["data"]["tokens"]["refresh"]
        self.assertIsNotNone(access_token)

        # 3. Get Profile (Protected Router)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        response_profile = self.client.get("/api/auth/profile/")
        print(f"Get profile status: {response_profile.status_code}")
        print(f"Get profile response: {response_profile.json()}")
        self.assertEqual(response_profile.status_code, status.HTTP_200_OK)
        self.assertEqual(response_profile.json()["data"]["full_name"], "Ramesh Patel")

        # 4. Update Profile
        update_payload = {
            "full_name": "Ramesh Patel Revised",
            "email": "ramesh.new@example.com"
        }
        response_update = self.client.put("/api/auth/profile/update/", update_payload, format='json')
        print(f"Update profile status: {response_update.status_code}")
        print(f"Update profile response: {response_update.json()}")
        self.assertEqual(response_update.status_code, status.HTTP_200_OK)
        self.assertEqual(response_update.json()["data"]["full_name"], "Ramesh Patel Revised")

        # 5. Logout
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        logout_payload = {"refresh": refresh_token}
        response_logout = self.client.post("/api/auth/logout/", logout_payload, format='json')
        print(f"Logout status: {response_logout.status_code}")
        self.assertEqual(response_logout.status_code, status.HTTP_200_OK)

    def test_03_forgot_password_reset_flow(self):
        print("\n--- Testing Forgot Password Reset Flow ---")
        # 1. Create farmer
        user = User.objects.create_user(
            mobile="9876543210",
            email="ramesh@example.com",
            full_name="Ramesh Patel",
            role="Farmer",
            password="OldPassword@123"
        )

        # 2. Trigger forgot password
        forgot_payload = {"mobile": "9876543210"}
        response = self.client.post("/api/auth/forgot-password/", forgot_payload, format='json')
        print(f"Forgot password init status: {response.status_code}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 3. Retrieve OTP from Mongo database to simulate verification
        otp_record = OTP.objects.filter(mobile="9876543210").first()
        self.assertIsNotNone(otp_record)
        otp_code = otp_record.otp_code
        print(f"Simulated retrieved OTP: {otp_code}")

        # 4. Verify OTP
        verify_payload = {
            "mobile": "9876543210",
            "otp_code": otp_code
        }
        response_verify = self.client.post("/api/auth/verify-otp/", verify_payload, format='json')
        print(f"OTP verification status: {response_verify.status_code}")
        self.assertEqual(response_verify.status_code, status.HTTP_200_OK)

        # 5. Reset Password
        reset_payload = {
            "mobile": "9876543210",
            "new_password": "NewPassword@987",
            "confirm_password": "NewPassword@987"
        }
        response_reset = self.client.post("/api/auth/reset-password/", reset_payload, format='json')
        print(f"Reset password status: {response_reset.status_code}")
        self.assertEqual(response_reset.status_code, status.HTTP_200_OK)

        # 6. Verify login with NEW password
        login_payload = {
            "credential": "9876543210",
            "password": "NewPassword@987",
            "role": "Farmer"
        }
        response_login = self.client.post("/api/auth/login/", login_payload, format='json')
        print(f"Login with reset status: {response_login.status_code}")
        self.assertEqual(response_login.status_code, status.HTTP_200_OK)
        self.assertTrue(response_login.json()["success"])


if __name__ == "__main__":
    unittest.main()
