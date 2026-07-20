from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from expert.models import AgricultureExpert
from consultation.models import Consultation, ConsultationReply
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken

User = get_user_model()

class ConsultationAPITests(APITestCase):
    def setUp(self):
        # Create a Farmer User
        self.farmer = User.objects.create(
            mobile="9900990099",
            email="bhavesh@farmer.com",
            password=make_password("password123"),
            full_name="Bhavesh Patel",
            role="Farmer"
        )
        self.farmer_token = str(AccessToken.for_user(self.farmer))

        # Create another Farmer User
        self.other_farmer = User.objects.create(
            mobile="9900990088",
            email="ramesh@farmer.com",
            password=make_password("password123"),
            full_name="Ramesh Patel",
            role="Farmer"
        )
        self.other_farmer_token = str(AccessToken.for_user(self.other_farmer))

        # Create an Expert
        self.expert = AgricultureExpert.objects.create(
            name="Dr. Amit Shah",
            password=make_password("password123"),
            specialization="Agronomy",
            qualification="PhD in Agronomy",
            experience=10,
            phone="9000990099",
            email="amit@expert.com",
            district="Ahmedabad",
            languages="Gujarati, English"
        )
        
        # Manually create token for expert to match role-based claims in expert authentication
        refresh = RefreshToken()
        refresh['role'] = 'Expert'
        refresh['user_id'] = self.expert.id
        refresh['email'] = self.expert.email
        refresh['name'] = self.expert.name
        self.expert_token = str(refresh.access_token)

        # Create another Expert
        self.other_expert = AgricultureExpert.objects.create(
            name="Dr. Sita Patel",
            password=make_password("password123"),
            specialization="Horticulture",
            qualification="PhD in Horticulture",
            experience=8,
            phone="9000990088",
            email="sita@expert.com",
            district="Anand",
            languages="Gujarati"
        )
        
        refresh_other = RefreshToken()
        refresh_other['role'] = 'Expert'
        refresh_other['user_id'] = self.other_expert.id
        refresh_other['email'] = self.other_expert.email
        refresh_other['name'] = self.other_expert.name
        self.other_expert_token = str(refresh_other.access_token)

        # URLs
        self.create_list_url = reverse('consultation:create-list')
        self.farmer_list_url = reverse('consultation:farmer-list')
        self.expert_list_url = reverse('consultation:expert-list')

    def authenticate_as_user(self, token):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_farmer_can_create_consultation(self):
        self.authenticate_as_user(self.farmer_token)
        data = {
            "expert": self.expert.id,
            "subject": "Tomato Leaf Curl Virus",
            "message": "My tomato fields show curling leaves and yellowing margins."
        }
        response = self.client.post(self.create_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], "Pending")
        self.assertEqual(response.data["subject"], "Tomato Leaf Curl Virus")
        self.assertEqual(response.data["farmer"], self.farmer.uuid) # key field is uuid

    def test_expert_cannot_create_consultation(self):
        self.authenticate_as_user(self.expert_token)
        data = {
            "expert": self.other_expert.id,
            "subject": "Tomato issue",
            "message": "Some description."
        }
        response = self.client.post(self.create_list_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_farmer_consultations(self):
        # Create consultation
        consultation = Consultation.objects.create(
            farmer=self.farmer,
            expert=self.expert,
            subject="Soil testing question",
            message="What is the ideal pH for cotton?"
        )

        # Farmer checks list
        self.authenticate_as_user(self.farmer_token)
        response = self.client.get(self.farmer_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], consultation.id)

        # Other farmer checks list
        self.authenticate_as_user(self.other_farmer_token)
        response = self.client.get(self.farmer_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_expert_inbox(self):
        # Create consultation assigned to self.expert
        consultation = Consultation.objects.create(
            farmer=self.farmer,
            expert=self.expert,
            subject="Cotton pest attack",
            message="Help with pink bollworm."
        )

        # Expert checks inbox
        self.authenticate_as_user(self.expert_token)
        response = self.client.get(self.expert_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], consultation.id)

        # Other expert checks inbox
        self.authenticate_as_user(self.other_expert_token)
        response = self.client.get(self.expert_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_consultation_details_and_permissions(self):
        consultation = Consultation.objects.create(
            farmer=self.farmer,
            expert=self.expert,
            subject="Details check",
            message="Verify permission parameters."
        )
        detail_url = reverse('consultation:detail', kwargs={'pk': consultation.id})

        # Associated farmer can view
        self.authenticate_as_user(self.farmer_token)
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Associated expert can view
        self.authenticate_as_user(self.expert_token)
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Other farmers cannot view
        self.authenticate_as_user(self.other_farmer_token)
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Other experts cannot view
        self.authenticate_as_user(self.other_expert_token)
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_sending_replies_and_status_transitions(self):
        consultation = Consultation.objects.create(
            farmer=self.farmer,
            expert=self.expert,
            subject="Discussion Thread",
            message="Initial question from farmer.",
            status="Pending"
        )
        reply_url = reverse('consultation:reply', kwargs={'pk': consultation.id})

        # Expert replies
        self.authenticate_as_user(self.expert_token)
        response = self.client.post(reply_url, {"message": "You should apply nitrogen fertilizer."})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["sender"], "Expert")

        # Verify consultation status updated to 'Replied'
        consultation.refresh_from_db()
        self.assertEqual(consultation.status, "Replied")
        self.assertEqual(consultation.replies.count(), 1)

        # Farmer replies
        self.authenticate_as_user(self.farmer_token)
        response = self.client.post(reply_url, {"message": "Thank you, what about water?"})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["sender"], "Farmer")

        # Verify consultation status updated back to 'Pending'
        consultation.refresh_from_db()
        self.assertEqual(consultation.status, "Pending")
        self.assertEqual(consultation.replies.count(), 2)

    def test_closing_consultation(self):
        consultation = Consultation.objects.create(
            farmer=self.farmer,
            expert=self.expert,
            subject="Closing test",
            message="Message.",
            status="Pending"
        )
        close_url = reverse('consultation:close', kwargs={'pk': consultation.id})
        reply_url = reverse('consultation:reply', kwargs={'pk': consultation.id})

        # Authenticated farmer closes the consultation
        self.authenticate_as_user(self.farmer_token)
        response = self.client.post(close_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        consultation.refresh_from_db()
        self.assertEqual(consultation.status, "Closed")

        # Check that replying to a closed consultation is blocked
        self.authenticate_as_user(self.expert_token)
        response = self.client.post(reply_url, {"message": "Expert trying to reply to closed thread."})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
