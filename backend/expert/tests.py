from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.hashers import make_password
from rest_framework import status
from rest_framework.test import APITestCase
from .models import AgricultureExpert

class AgricultureExpertAPITests(APITestCase):

    def setUp(self):
        # Create test experts
        self.expert1 = AgricultureExpert.objects.create(
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
        self.expert2 = AgricultureExpert.objects.create(
            name="Dr. Ramesh Bhalani",
            photo="/static/ramesh.jpg",
            qualification="Ph.D. in Plant Pathology",
            specialization="Pest Management",
            experience=18,
            district="Junagadh",
            phone="9988776655",
            email="ramesh@test.com",
            office_address="Junagadh Office",
            languages="Gujarati, Hindi",
            availability="Tuesday",
            google_map_link="https://maps.google.com/?q=Junagadh",
            rating=4.9
        )

    def test_list_all_experts(self):
        url = reverse('expert:list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should return both sorted by rating (4.9 first, then 4.8)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['name'], "Dr. Ramesh Bhalani")
        self.assertEqual(response.data[1]['name'], "Dr. Arvind Patel")

    def test_retrieve_expert_detail_success(self):
        url = reverse('expert:detail', kwargs={'pk': self.expert1.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.expert1.name)
        self.assertEqual(response.data['specialization'], self.expert1.specialization)

    def test_retrieve_expert_detail_not_found(self):
        url = reverse('expert:detail', kwargs={'pk': 9999})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)

    def test_search_by_district(self):
        url = reverse('expert:search')
        
        # Filtering for Rajkot (case-insensitive)
        response = self.client.get(url, {'district': 'rajkot'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], "Dr. Arvind Patel")

        # Filtering for Junagadh
        response = self.client.get(url, {'district': 'Junagadh'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], "Dr. Ramesh Bhalani")

        # Filtering for invalid district
        response = self.client.get(url, {'district': 'Surat'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_search_by_name(self):
        url = reverse('expert:search')
        response = self.client.get(url, {'name': 'Arvind'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], "Dr. Arvind Patel")

    def test_search_by_specialization(self):
        url = reverse('expert:search')
        response = self.client.get(url, {'specialization': 'Pest'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], "Dr. Ramesh Bhalani")

    def test_search_by_language(self):
        url = reverse('expert:search')
        
        response = self.client.get(url, {'language': 'English'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], "Dr. Arvind Patel")

        # Matching both because they both have Gujarati
        response = self.client.get(url, {'language': 'Gujarati'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_districts_list(self):
        url = reverse('expert:districts')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should return sorted distinct districts: ['Junagadh', 'Rajkot']
        self.assertEqual(response.data, ['Junagadh', 'Rajkot'])

    def test_register_expert_success(self):
        url = reverse('expert:register')
        payload = {
            "name": "Dr. Subhash Patel",
            "specialization": "Agronomy",
            "district": "Anand",
            "languages": "Gujarati",
            "phone": "9999988888",
            "email": "subhash@test.com",
            "password": "securepassword123",
            "qualification": "M.Sc. in Agronomy",
            "experience": 10
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['email'], "subhash@test.com")

    def test_login_expert_success(self):
        # First ensure expert has password
        self.expert1.password = make_password("mypassword")
        self.expert1.save()

        url = reverse('expert:login')
        payload = {
            "email": "arvind@test.com",
            "password": "mypassword"
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)
        self.assertIn('user', response.data)

    def test_login_expert_invalid_credentials(self):
        url = reverse('expert:login')
        payload = {
            "email": "arvind@test.com",
            "password": "wrongpassword"
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_dashboard_unauthenticated(self):
        url = reverse('expert:dashboard')
        response = self.client.get(url)
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_dashboard_authenticated(self):
        # Generate token
        self.expert1.password = make_password("mypassword")
        self.expert1.save()

        login_url = reverse('expert:login')
        login_res = self.client.post(login_url, {"email": "arvind@test.com", "password": "mypassword"}, format='json')
        token = login_res.data['tokens']['access']

        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        url = reverse('expert:dashboard')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['profile']['name'], "Dr. Arvind Patel")
        self.assertIn('stats', response.data)

    def test_update_expert_profile_success(self):
        self.expert1.password = make_password("mypassword")
        self.expert1.save()

        login_url = reverse('expert:login')
        login_res = self.client.post(login_url, {"email": "arvind@test.com", "password": "mypassword"}, format='json')
        token = login_res.data['tokens']['access']

        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        url = reverse('expert:detail', kwargs={'pk': self.expert1.pk})
        
        payload = {
            "name": "Dr. Arvind Patel Updated",
            "specialization": "Horticulture Expert",
            "district": "Rajkot",
            "languages": "Gujarati, English",
            "phone": "9876543210",
            "email": "arvind@test.com"
        }
        response = self.client.put(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Dr. Arvind Patel Updated")

    def test_update_expert_profile_unauthorized(self):
        url = reverse('expert:detail', kwargs={'pk': self.expert1.pk})
        payload = {
            "name": "Dr. Arvind Patel Updated"
        }
        response = self.client.put(url, payload, format='json')
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_delete_expert_success(self):
        self.expert1.password = make_password("mypassword")
        self.expert1.save()

        login_url = reverse('expert:login')
        login_res = self.client.post(login_url, {"email": "arvind@test.com", "password": "mypassword"}, format='json')
        token = login_res.data['tokens']['access']

        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        url = reverse('expert:detail', kwargs={'pk': self.expert1.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(AgricultureExpert.objects.filter(pk=self.expert1.pk).exists())



