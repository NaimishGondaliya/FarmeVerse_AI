from django.core.management.base import BaseCommand
from expert.models import AgricultureExpert

class Command(BaseCommand):
    help = 'Seed database with sample Gujarat Agriculture Experts'

    def handle(self, *args, **kwargs):
        experts_data = [
            {
                "name": "Dr. Arvind Patel",
                "specialization": "Horticulture & Fruit Crops",
                "qualification": "Ph.D. in Horticulture",
                "experience": 15,
                "district": "Rajkot",
                "phone": "+91-9876543210",
                "email": "arvind.patel@farmverse.org",
                "office_address": "Agricultural Research Station, Kalawad Road, Rajkot - 360005",
                "languages": "Gujarati, Hindi, English",
                "availability": "Monday to Friday, 10 AM - 5 PM",
                "google_map_link": "https://maps.google.com/?q=Rajkot",
                "rating": 4.8,
                "photo": "/static/experts/arvind_patel.jpg"
            },
            {
                "name": "Dr. Ramesh Bhalani",
                "specialization": "Plant Pathology & Pest Management",
                "qualification": "Ph.D. in Plant Pathology (Junagadh Agricultural University)",
                "experience": 18,
                "district": "Junagadh",
                "phone": "+91-9988776655",
                "email": "ramesh.bhalani@farmverse.org",
                "office_address": "College of Agriculture, JAU Campus, Junagadh - 362001",
                "languages": "Gujarati, English",
                "availability": "Tuesday & Thursday, 11 AM - 4 PM",
                "google_map_link": "https://maps.google.com/?q=Junagadh",
                "rating": 4.9,
                "photo": "/static/experts/ramesh_bhalani.jpg"
            },
            {
                "name": "Dr. Sanjay Vavdiya",
                "specialization": "Organic Farming & Soil Health",
                "qualification": "M.Sc. in Agriculture (Soil Science)",
                "experience": 10,
                "district": "Amreli",
                "phone": "+91-9426153728",
                "email": "sanjay.vavdiya@farmverse.org",
                "office_address": "Organic Farming Extension Center, Station Road, Amreli - 365601",
                "languages": "Gujarati, Hindi",
                "availability": "Monday to Saturday, 9 AM - 2 PM",
                "google_map_link": "https://maps.google.com/?q=Amreli",
                "rating": 4.7,
                "photo": "/static/experts/sanjay_vavdiya.jpg"
            },
            {
                "name": "Dr. Meera Joshi",
                "specialization": "Agronomy & Crop Rotation",
                "qualification": "Ph.D. in Agronomy",
                "experience": 12,
                "district": "Ahmedabad",
                "phone": "+91-9123456789",
                "email": "meera.joshi@farmverse.org",
                "office_address": "Gujarat Agriculture Biotech Lab, Vastrapur, Ahmedabad - 380015",
                "languages": "Gujarati, Hindi, English",
                "availability": "Wednesday & Friday, 2 PM - 6 PM",
                "google_map_link": "https://maps.google.com/?q=Ahmedabad",
                "rating": 4.6,
                "photo": "/static/experts/meera_joshi.jpg"
            },
            {
                "name": "Prof. Rajesh Sanghani",
                "specialization": "Greenhouse Technology & Micro Irrigation",
                "qualification": "M.Tech in Agricultural Engineering",
                "experience": 14,
                "district": "Surat",
                "phone": "+91-9567890123",
                "email": "rajesh.sanghani@farmverse.org",
                "office_address": "Surat Irrigation Engineering Institute, Athwalines, Surat - 395007",
                "languages": "Gujarati, English",
                "availability": "Monday to Friday, 10 AM - 4 PM",
                "google_map_link": "https://maps.google.com/?q=Surat",
                "rating": 4.8,
                "photo": "/static/experts/rajesh_sanghani.jpg"
            },
            {
                "name": "Dr. Hitesh Gohil",
                "specialization": "Cotton & Oilseeds Production",
                "qualification": "Ph.D. in Genetics & Plant Breeding",
                "experience": 16,
                "district": "Vadodara",
                "phone": "+91-9408765432",
                "email": "hitesh.gohil@farmverse.org",
                "office_address": "Oilseeds Research Center, Gotri, Vadodara - 390021",
                "languages": "Gujarati, Hindi",
                "availability": "Monday & Wednesday, 10 AM - 5 PM",
                "google_map_link": "https://maps.google.com/?q=Vadodara",
                "rating": 4.7,
                "photo": "/static/experts/hitesh_gohil.jpg"
            },
            {
                "name": "Dr. K. M. Jadeja",
                "specialization": "Dryland Farming & Water Harvesting",
                "qualification": "Ph.D. in Dryland Agriculture",
                "experience": 20,
                "district": "Bhavnagar",
                "phone": "+91-9824012345",
                "email": "km.jadeja@farmverse.org",
                "office_address": "Dryland Agriculture Extension Office, Kalanala, Bhavnagar - 364001",
                "languages": "Gujarati, Hindi, English",
                "availability": "Tuesday & Thursday, 10 AM - 3 PM",
                "google_map_link": "https://maps.google.com/?q=Bhavnagar",
                "rating": 4.9,
                "photo": "/static/experts/km_jadeja.jpg"
            },
            {
                "name": "Dr. Amrita Kurien",
                "specialization": "Dairy Farming & Fodder Management",
                "qualification": "Ph.D. in Animal Husbandry (Anand Agricultural University)",
                "experience": 11,
                "district": "Anand",
                "phone": "+91-9904234567",
                "email": "amrita.kurien@farmverse.org",
                "office_address": "Dairy Extension Department, AAU Main Campus, Anand - 388110",
                "languages": "Gujarati, English",
                "availability": "Monday to Friday, 9 AM - 4 PM",
                "google_map_link": "https://maps.google.com/?q=Anand",
                "rating": 4.8,
                "photo": "/static/experts/amrita_kurien.jpg"
            },
            {
                "name": "Dr. Vikram Chaudhary",
                "specialization": "Sustainable Farming & Pest Control",
                "qualification": "M.Sc. in Entomology",
                "experience": 8,
                "district": "Mehsana",
                "phone": "+91-9428543210",
                "email": "vikram.chaudhary@farmverse.org",
                "office_address": "Krishi Vigyan Kendra (KVK), Mehsana Highway, Mehsana - 384002",
                "languages": "Gujarati, Hindi",
                "availability": "Monday to Saturday, 8 AM - 1 PM",
                "google_map_link": "https://maps.google.com/?q=Mehsana",
                "rating": 4.5,
                "photo": "/static/experts/vikram_chaudhary.jpg"
            },
            {
                "name": "Dr. R. K. Patel",
                "specialization": "Spices & Seed Spices Extension",
                "qualification": "Ph.D. in Spices Research",
                "experience": 22,
                "district": "Banaskantha",
                "phone": "+91-9724123456",
                "email": "rk.patel@farmverse.org",
                "office_address": "Main Seed Spices Research Station, JAU Campus, Dantiwada, Banaskantha - 385505",
                "languages": "Gujarati, Hindi, English",
                "availability": "Friday, 10 AM - 5 PM",
                "google_map_link": "https://maps.google.com/?q=Banaskantha",
                "rating": 5.0,
                "photo": "/static/experts/rk_patel.jpg"
            }
        ]

        count = 0
        for data in experts_data:
            expert, created = AgricultureExpert.objects.update_or_create(
                email=data["email"],
                defaults=data
            )
            if created:
                count += 1
            else:
                self.stdout.write(f"Updated expert: {expert.name}")

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {count} new Agriculture Experts!"))
