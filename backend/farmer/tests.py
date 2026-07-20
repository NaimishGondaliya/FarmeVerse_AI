from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Farm, Crop, Expense, Sales

User = get_user_model()

class FarmAPITests(APITestCase):

    def setUp(self):
        # Create users
        self.user1 = User.objects.create_user(
            mobile='9876543210',
            email='farmer1@example.com',
            full_name='Farmer One',
            password='Password123!',
            role='Farmer'
        )
        self.user2 = User.objects.create_user(
            mobile='9876543211',
            email='farmer2@example.com',
            full_name='Farmer Two',
            password='Password123!',
            role='Farmer'
        )

        # Create a farm for user1
        self.farm1 = Farm.objects.create(
            farmer=self.user1,
            farm_name="Plot A",
            village="Village A",
            taluka="Taluka A",
            district="Rajkot",
            total_area=5.50,
            area_unit="Acre",
            soil_type="Black",
            irrigation_type="Drip"
        )

        # URL for listing/creating
        self.list_create_url = reverse('farmer:farms')
        
    def test_list_farms_unauthenticated(self):
        """Unauthenticated requests should return 401."""
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_farms_authenticated(self):
        """Authenticated farmer should list only their farms."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check that it returns one farm
        data = response.data['data']
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['farm_name'], "Plot A")

    def test_create_farm_valid(self):
        """Create a farm with valid data."""
        self.client.force_authenticate(user=self.user1)
        payload = {
            "farm_name": "Plot B",
            "village": "Village B",
            "taluka": "Taluka B",
            "district": "Surat",
            "total_area": 10.0,
            "area_unit": "Hectare",
            "soil_type": "Red Clay",
            "irrigation_type": "Sprinkler"
        }
        response = self.client.post(self.list_create_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Farm.objects.filter(farm_name="Plot B", farmer=self.user1).exists())

    def test_create_farm_invalid_area(self):
        """Creating a farm with total_area <= 0 should fail validation."""
        self.client.force_authenticate(user=self.user1)
        payload = {
            "farm_name": "Plot B",
            "village": "Village B",
            "taluka": "Taluka B",
            "district": "Surat",
            "total_area": 0,
            "area_unit": "Hectare",
            "soil_type": "Red Clay",
            "irrigation_type": "Sprinkler"
        }
        response = self.client.post(self.list_create_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("total_area", response.data['errors'])

    def test_update_farm_by_owner(self):
        """Owner should be able to update their farm."""
        self.client.force_authenticate(user=self.user1)
        detail_url = reverse('farmer:farm_detail', kwargs={'pk': self.farm1.id})
        payload = {
            "farm_name": "Plot A Updated"
        }
        response = self.client.put(detail_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.farm1.refresh_from_db()
        self.assertEqual(self.farm1.farm_name, "Plot A Updated")

    def test_update_farm_by_other_fails(self):
        """Updating someone else's farm should return 404."""
        self.client.force_authenticate(user=self.user2)
        detail_url = reverse('farmer:farm_detail', kwargs={'pk': self.farm1.id})
        payload = {
            "farm_name": "Plot A Updated"
        }
        response = self.client.put(detail_url, payload)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_farm_by_owner(self):
        """Owner should be able to delete their farm."""
        self.client.force_authenticate(user=self.user1)
        detail_url = reverse('farmer:farm_detail', kwargs={'pk': self.farm1.id})
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Farm.objects.filter(id=self.farm1.id).exists())

    def test_delete_farm_by_other_fails(self):
        """Deleting someone else's farm should return 404."""
        self.client.force_authenticate(user=self.user2)
        detail_url = reverse('farmer:farm_detail', kwargs={'pk': self.farm1.id})
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Farm.objects.filter(id=self.farm1.id).exists())


class CropAPITests(APITestCase):

    def setUp(self):
        # Create users
        self.user1 = User.objects.create_user(
            mobile='9876543210',
            email='farmer1@example.com',
            full_name='Farmer One',
            password='Password123!',
            role='Farmer'
        )
        self.user2 = User.objects.create_user(
            mobile='9876543211',
            email='farmer2@example.com',
            full_name='Farmer Two',
            password='Password123!',
            role='Farmer'
        )

        # Create a farm for user1
        self.farm1 = Farm.objects.create(
            farmer=self.user1,
            farm_name="Plot A",
            village="Village A",
            taluka="Taluka A",
            district="Rajkot",
            total_area=5.50,
            area_unit="Acre",
            soil_type="Black",
            irrigation_type="Drip"
        )
        # Create a farm for user2
        self.farm2 = Farm.objects.create(
            farmer=self.user2,
            farm_name="Plot B",
            village="Village B",
            taluka="Taluka B",
            district="Surat",
            total_area=10.0,
            area_unit="Hectare",
            soil_type="Red Clay",
            irrigation_type="Sprinkler"
        )

        # Create a crop linked to farm1
        self.crop1 = Crop.objects.create(
            farm=self.farm1,
            crop_name="Wheat",
            crop_variety="Lok-1",
            season="Rabi",
            sowing_date="2026-11-01",
            expected_harvest_date="2027-03-01",
            area_used=3.0,
            area_unit="Acre",
            expected_yield=120.0,
            seed_cost=1000.0,
            fertilizer_cost=1500.0,
            pesticide_cost=800.0,
            labour_cost=2000.0,
            other_cost=500.0,
            crop_status="Sown",
            disease_status="Healthy"
        )

        self.list_create_url = reverse('farmer:crops')

    def test_crop_total_cost_calculation(self):
        """Test that the Crop model automatically calculates the total cost correctly."""
        self.assertEqual(self.crop1.total_cost, 5800.0)

    def test_list_crops_unauthenticated(self):
        """Unauthenticated requests should return 401."""
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_crops_authenticated_owner(self):
        """Authenticated farmer should list only crops from their farms."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data['data']
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['crop_name'], "Wheat")

    def test_list_crops_authenticated_non_owner(self):
        """Farmer2 should see no crops because they have no crop mapped to their farms."""
        self.client.force_authenticate(user=self.user2)
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data['data']
        self.assertEqual(len(data), 0)

    def test_create_crop_valid(self):
        """Create a crop record on farmer's own farm."""
        self.client.force_authenticate(user=self.user1)
        payload = {
            "farm": self.farm1.id,
            "crop_name": "Cotton",
            "crop_variety": "BT-Cotton",
            "season": "Kharif",
            "sowing_date": "2026-06-15",
            "expected_harvest_date": "2026-11-30",
            "area_used": 2.5,
            "area_unit": "Acre",
            "expected_yield": 80.0,
            "seed_cost": 2000.0,
            "fertilizer_cost": 3000.0,
            "pesticide_cost": 1500.0,
            "labour_cost": 4000.0,
            "other_cost": 1000.0,
            "crop_status": "Sown",
            "disease_status": "Healthy"
        }
        response = self.client.post(self.list_create_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Crop.objects.filter(crop_name="Cotton", farm=self.farm1).exists())
        # Check calculation returned in API representation
        self.assertEqual(response.data['data']['total_cost'], 11500.0)

    def test_create_crop_non_owned_farm(self):
        """Farmer cannot add a crop to another farmer's farm."""
        self.client.force_authenticate(user=self.user1)
        payload = {
            "farm": self.farm2.id,
            "crop_name": "Cotton",
            "crop_variety": "BT-Cotton",
            "season": "Kharif",
            "sowing_date": "2026-06-15",
            "expected_harvest_date": "2026-11-30",
            "area_used": 2.5,
            "area_unit": "Acre",
            "expected_yield": 80.0
        }
        response = self.client.post(self.list_create_url, payload)
        # Should raise validation error
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("farm", response.data['errors'])

    def test_create_crop_invalid_dates(self):
        """Expected harvest date before sowing date should fail validation."""
        self.client.force_authenticate(user=self.user1)
        payload = {
            "farm": self.farm1.id,
            "crop_name": "Gram",
            "crop_variety": "Desi",
            "season": "Rabi",
            "sowing_date": "2026-11-01",
            "expected_harvest_date": "2026-10-01", # invalid
            "area_used": 1.0,
            "area_unit": "Acre",
            "expected_yield": 20.0
        }
        response = self.client.post(self.list_create_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("expected_harvest_date", response.data['errors'])

    def test_update_crop_owner(self):
        """Owner should be able to update their crop."""
        self.client.force_authenticate(user=self.user1)
        detail_url = reverse('farmer:crop_detail', kwargs={'pk': self.crop1.id})
        payload = {
            "crop_name": "Wheat Updated",
            "actual_yield": 130.0,
            "crop_status": "Harvested",
            "harvest_date": "2027-02-28"
        }
        response = self.client.put(detail_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.crop1.refresh_from_db()
        self.assertEqual(self.crop1.crop_name, "Wheat Updated")
        self.assertEqual(self.crop1.actual_yield, 130.0)
        self.assertEqual(self.crop1.crop_status, "Harvested")

    def test_update_crop_non_owner(self):
        """Updating someone else's crop should return 404."""
        self.client.force_authenticate(user=self.user2)
        detail_url = reverse('farmer:crop_detail', kwargs={'pk': self.crop1.id})
        payload = {
            "crop_name": "Wheat Updated"
        }
        response = self.client.put(detail_url, payload)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class ExpenseAPITests(APITestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(
            mobile='9876543210',
            email='farmer1@example.com',
            full_name='Farmer One',
            password='Password123!',
            role='Farmer'
        )
        self.user2 = User.objects.create_user(
            mobile='9876543211',
            email='farmer2@example.com',
            full_name='Farmer Two',
            password='Password123!',
            role='Farmer'
        )
        self.farm1 = Farm.objects.create(
            farmer=self.user1,
            farm_name="Plot A",
            village="Village A",
            taluka="Taluka A",
            district="Rajkot",
            total_area=5.50,
            area_unit="Acre",
            soil_type="Black",
            irrigation_type="Drip"
        )
        self.crop1 = Crop.objects.create(
            farm=self.farm1,
            crop_name="Wheat",
            crop_variety="Lok-1",
            season="Rabi",
            sowing_date="2026-11-01",
            expected_harvest_date="2027-03-01",
            area_used=3.0,
            area_unit="Acre",
            expected_yield=120.0
        )
        self.expense1 = Expense.objects.create(
            crop=self.crop1,
            expense_type="Seed",
            amount=500.00,
            expense_date="2026-11-02",
            description="High quality seeds"
        )
        self.list_create_url = reverse('farmer:expenses')

    def test_list_expenses_unauthenticated(self):
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_expenses_authenticated_owner(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data['data']
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['expense_type'], "Seed")

    def test_list_expenses_authenticated_non_owner(self):
        self.client.force_authenticate(user=self.user2)
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data['data']
        self.assertEqual(len(data), 0)

    def test_create_expense_valid(self):
        self.client.force_authenticate(user=self.user1)
        payload = {
            "crop": self.crop1.id,
            "expense_type": "Fertilizer",
            "amount": 1200.00,
            "expense_date": "2026-11-10",
            "description": "Urea and NPK"
        }
        response = self.client.post(self.list_create_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Expense.objects.filter(expense_type="Fertilizer", crop=self.crop1).exists())
        self.crop1.refresh_from_db()
        self.assertEqual(self.crop1.total_expenses, 1700.00)

    def test_create_expense_invalid_negative_amount(self):
        self.client.force_authenticate(user=self.user1)
        payload = {
            "crop": self.crop1.id,
            "expense_type": "Labour",
            "amount": -50.00,
            "expense_date": "2026-11-10"
        }
        response = self.client.post(self.list_create_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("amount", response.data['errors'])

    def test_create_expense_non_owned_crop(self):
        self.client.force_authenticate(user=self.user2)
        payload = {
            "crop": self.crop1.id,
            "expense_type": "Pesticide",
            "amount": 350.00,
            "expense_date": "2026-11-10"
        }
        response = self.client.post(self.list_create_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("crop", response.data['errors'])


class SalesAPITests(APITestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(
            mobile='9876543210',
            email='farmer1@example.com',
            full_name='Farmer One',
            password='Password123!',
            role='Farmer'
        )
        self.user2 = User.objects.create_user(
            mobile='9876543211',
            email='farmer2@example.com',
            full_name='Farmer Two',
            password='Password123!',
            role='Farmer'
        )
        self.farm1 = Farm.objects.create(
            farmer=self.user1,
            farm_name="Plot A",
            village="Village A",
            taluka="Taluka A",
            district="Rajkot",
            total_area=5.50,
            area_unit="Acre",
            soil_type="Black",
            irrigation_type="Drip"
        )
        self.crop1 = Crop.objects.create(
            farm=self.farm1,
            crop_name="Wheat",
            crop_variety="Lok-1",
            season="Rabi",
            sowing_date="2026-11-01",
            expected_harvest_date="2027-03-01",
            area_used=3.0,
            area_unit="Acre",
            expected_yield=120.0
        )
        self.sale1 = Sales.objects.create(
            crop=self.crop1,
            market_yard="Gondal APMC",
            sale_date="2027-03-05",
            sold_quantity=100.00,
            price_per_kg=35.00
        )
        self.list_create_url = reverse('farmer:sales')

    def test_sales_total_revenue_auto_calculation(self):
        self.assertEqual(self.sale1.total_revenue, 3500.00)

    def test_list_sales_unauthenticated(self):
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_sales_authenticated_owner(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data['data']
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['market_yard'], "Gondal APMC")

    def test_list_sales_authenticated_non_owner(self):
        self.client.force_authenticate(user=self.user2)
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data['data']
        self.assertEqual(len(data), 0)

    def test_create_sales_valid(self):
        self.client.force_authenticate(user=self.user1)
        payload = {
            "crop": self.crop1.id,
            "market_yard": "Rajkot APMC",
            "sale_date": "2027-03-10",
            "sold_quantity": 250.00,
            "price_per_kg": 40.00
        }
        response = self.client.post(self.list_create_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Sales.objects.filter(market_yard="Rajkot APMC", crop=self.crop1).exists())
        self.crop1.refresh_from_db()
        self.assertEqual(self.crop1.total_revenues, 13500.00)

    def test_create_sales_invalid_negative_price(self):
        self.client.force_authenticate(user=self.user1)
        payload = {
            "crop": self.crop1.id,
            "market_yard": "Rajkot APMC",
            "sale_date": "2027-03-10",
            "sold_quantity": 250.00,
            "price_per_kg": -2.00
        }
        response = self.client.post(self.list_create_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("price_per_kg", response.data['errors'])

    def test_create_sales_non_owned_crop(self):
        self.client.force_authenticate(user=self.user2)
        payload = {
            "crop": self.crop1.id,
            "market_yard": "Rajkot APMC",
            "sale_date": "2027-03-10",
            "sold_quantity": 250.00,
            "price_per_kg": 40.00
        }
        response = self.client.post(self.list_create_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("crop", response.data['errors'])


