from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

class CropRecommendationAPITests(APITestCase):
    def test_predict_success(self):
        url = reverse('crop_recommendation:predict')
        data = {
            "N": 90,
            "P": 42,
            "K": 43,
            "temperature": 29.0,
            "humidity": 75.0,
            "ph": 6.5,
            "rainfall": 180.0,
            "soil_type": "Black Soil",
            "season": "Kharif",
            "district": "Rajkot",
            "irrigation": "Medium"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('recommended_crop', response.data)
        self.assertIn('confidence', response.data)
        self.assertIsInstance(response.data['confidence'], float)

    def test_predict_missing_fields(self):
        url = reverse('crop_recommendation:predict')
        data = {
            "N": 90,
            "P": 42
            # Missing other fields
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertEqual(response.data['error'], 'Invalid values')
        self.assertIn('K', response.data['details'])

    def test_predict_invalid_values(self):
        url = reverse('crop_recommendation:predict')
        data = {
            "N": 90,
            "P": 42,
            "K": 43,
            "temperature": 29.0,
            "humidity": 150.0, # Invalid humidity (>100)
            "ph": 6.5,
            "rainfall": -5.0, # Invalid rainfall (<0)
            "soil_type": "Black Soil",
            "season": "Kharif",
            "district": "Rajkot",
            "irrigation": "Medium"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertEqual(response.data['error'], 'Invalid values')
        self.assertIn('humidity', response.data['details'])
        self.assertIn('rainfall', response.data['details'])

    def test_predict_city_mapping_success(self):
        url = reverse('crop_recommendation:predict')
        # Sending city Gondal (should map to Rajkot and Black Soil)
        # district and soil_type are explicitly not sent here!
        data = {
            "N": 90,
            "P": 42,
            "K": 43,
            "temperature": 29.5,
            "humidity": 70.0,
            "ph": 6.5,
            "rainfall": 180.0,
            "city": "Gondal"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('recommended_crop', response.data)

    def test_predict_backward_compatible_district(self):
        url = reverse('crop_recommendation:predict')
        # Sending only district Surat, without city.
        # Should map to Surat and Alluvial Soil
        data = {
            "N": 90,
            "P": 42,
            "K": 43,
            "temperature": 27.0,
            "humidity": 65.0,
            "ph": 6.5,
            "rainfall": 200.0,
            "district": "Surat"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

    def test_predict_invalid_city_fallback(self):
        url = reverse('crop_recommendation:predict')
        # Sending invalid city Name 'London'. Should fallback safely to Rajkot/Black Soil.
        data = {
            "N": 90,
            "P": 42,
            "K": 43,
            "temperature": 29.0,
            "humidity": 60.0,
            "ph": 6.5,
            "rainfall": 150.0,
            "city": "London"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
