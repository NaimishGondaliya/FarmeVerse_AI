from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from decimal import Decimal
from unittest.mock import patch
from .models import DiseaseDetection

User = get_user_model()

class DiseaseDetectionAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            mobile='9876543210',
            email='testfarmer@example.com',
            full_name='Test Farmer',
            password='Password123!',
            role='Farmer'
        )
        self.client.force_authenticate(user=self.user)
        
        # Create a dummy image for testing uploads
        self.dummy_image = SimpleUploadedFile(
            name='tomato_leaf.jpg',
            content=b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b',
            content_type='image/jpeg'
        )

    def test_ping_endpoint(self):
        url = reverse('disease_detection:ping')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'online')

    def test_upload_missing_fields(self):
        url = reverse('disease_detection:upload')
        # Missing image and crop
        response = self.client.post(url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])

    def test_upload_crop_detection_tomato(self):
        url = reverse('disease_detection:upload')
        response = self.client.post(url, {
            'image': self.dummy_image,
            'crop': 'Tomato'
        }, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        
        data = response.data['data']
        self.assertEqual(data['prediction'], 'Tomato Late Blight')
        self.assertEqual(data['status'], 'Diseased')
        self.assertEqual(float(data['confidence']), 92.50)
        self.assertIn('copper-based fungicides', data['treatment'])

    @patch('disease_detection.views.predict_cotton_disease')
    def test_upload_crop_detection_cotton(self, mock_predict):
        mock_predict.return_value = {
            "prediction": "Cotton Leaf Curl",
            "confidence": 88.00,
            "probabilities": {
                "Aphids": 1.00,
                "Army worm": 2.00,
                "Bacterial Blight": 4.00,
                "Healthy": 3.00,
                "Powdery Mildew": 2.00,
                "Target spot": 88.00
            },
            "status": "Diseased",
            "description": "Mock description",
            "treatment": "Apply insecticide to control whiteflies (vector). Uproot and burn infected plants.",
            "prevention": "Plant resistant varieties. Maintain weed-free environment around fields."
        }
        url = reverse('disease_detection:upload')
        cotton_image = SimpleUploadedFile(
            name='cotton.jpg',
            content=self.dummy_image.read(),
            content_type='image/jpeg'
        )
        response = self.client.post(url, {
            'image': cotton_image,
            'crop': 'Cotton'
        }, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        
        data = response.data['data']
        self.assertEqual(data['prediction'], 'Cotton Leaf Curl')
        self.assertEqual(data['status'], 'Diseased')
        self.assertEqual(float(data['confidence']), 88.00)
        self.assertIn('whiteflies', data['treatment'])

    def test_upload_crop_detection_healthy(self):
        url = reverse('disease_detection:upload')
        generic_image = SimpleUploadedFile(
            name='leaf.jpg',
            content=self.dummy_image.read(),
            content_type='image/jpeg'
        )
        response = self.client.post(url, {
            'image': generic_image,
            'crop': 'Wheat'
        }, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        
        data = response.data['data']
        self.assertEqual(data['prediction'], 'Healthy')
        self.assertEqual(data['status'], 'Healthy')
        self.assertEqual(float(data['confidence']), 98.20)

    def test_history_list_and_delete_all(self):
        # Seed two detections
        DiseaseDetection.objects.create(
            farmer=self.user,
            crop="Carrot",
            image="diseases/carrot.jpg",
            prediction="Healthy",
            confidence=Decimal("99.10"),
            status="Healthy"
        )
        DiseaseDetection.objects.create(
            farmer=self.user,
            crop="Rice",
            image="diseases/rice.jpg",
            prediction="Healthy",
            confidence=Decimal("98.50"),
            status="Healthy"
        )
        
        url_history = reverse('disease_detection:history')
        # Test list history
        response = self.client.get(url_history)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        
        # Test delete all history
        response_delete = self.client.delete(url_history)
        self.assertEqual(response_delete.status_code, status.HTTP_200_OK)
        self.assertTrue(response_delete.data['success'])
        self.assertEqual(DiseaseDetection.objects.count(), 0)

    def test_history_detail_and_delete_specific(self):
        record = DiseaseDetection.objects.create(
            farmer=self.user,
            crop="Onion",
            image="diseases/onion.jpg",
            prediction="Healthy",
            confidence=Decimal("99.90"),
            status="Healthy"
        )
        
        url_detail = reverse('disease_detection:history-detail', kwargs={'pk': record.pk})
        
        # Get details
        response = self.client.get(url_detail)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['crop'], 'Onion')
        
        # Delete specific history details
        response_delete = self.client.delete(url_detail)
        self.assertEqual(response_delete.status_code, status.HTTP_200_OK)
        self.assertTrue(response_delete.data['success'])
        self.assertEqual(DiseaseDetection.objects.count(), 0)

