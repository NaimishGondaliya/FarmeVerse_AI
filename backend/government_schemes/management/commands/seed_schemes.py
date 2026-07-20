from django.core.management.base import BaseCommand
from government_schemes.models import GovernmentScheme

class Command(BaseCommand):
    help = "Populate the SQLite database with default pre-seeded Gujarat and Central government farmer schemes."

    def handle(self, *args, **options):
        schemes = [
            {
                "scheme_name": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
                "gujarati_name": "પીએમ કિસાન સન્માન નિધિ",
                "scheme_type": "Central",
                "description": "An initiative by the Government of India that provides Rs 6,000 per year in three equal installments directly to the bank accounts of all landholding farmer families.",
                "eligibility": "All landholding farmer families who have cultivable land in their names.",
                "benefits": "Financial assistance of Rs. 6000 per year, delivered in three equal installments of Rs. 2000 every four months.",
                "required_documents": "Aadhaar Card, Land ownership documents (7/12 and 8A extracts), Bank Account Passbook, Identity Proof.",
                "official_website": "https://pmkisan.gov.in/",
                "apply_link": "https://pmkisan.gov.in/RegistrationForm.aspx",
                "farmer_category": "Small & Marginal Farmers, Landowners",
                "crop_category": "All Crops",
                "status": "Active",
            },
            {
                "scheme_name": "PMFBY (Pradhan Mantri Fasal Bima Yojana)",
                "gujarati_name": "પ્રધાનમંત્રી ફસલ બીમા યોજના",
                "scheme_type": "Central",
                "description": "A comprehensive government crop insurance scheme safeguarding farmers against crop failures caused by natural calamities, pests, and diseases.",
                "eligibility": "All farmers, including owner-cultivators, tenant farmers, and sharecroppers growing notified crops in notified areas.",
                "benefits": "Financial security with comprehensive crop insurance. Premium rates are very low: 2% for Kharif crops, 1.5% for Rabi crops, and 5% for commercial/horticultural crops.",
                "required_documents": "Aadhaar Card, Land Records (7/12 and 8A), Official Sowing Certificate, Bank Account Details.",
                "official_website": "https://pmfby.gov.in/",
                "apply_link": "https://pmfby.gov.in/",
                "farmer_category": "All Farmers, Tenant Farmers",
                "crop_category": "Grains, Oilseeds, Commercial Crops, Horticultural Crops",
                "status": "Active",
            },
            {
                "scheme_name": "Soil Health Card Scheme",
                "gujarati_name": "સોઈલ હેલ્થ કાર્ડ યોજના",
                "scheme_type": "Central",
                "description": "Promotes soil-test-based nutrient management. Farmers receive recommendations on appropriate chemical and organic fertilizer dosages customized for their soil type to improve yield.",
                "eligibility": "All agricultural landowners across India.",
                "benefits": "Free soil testing and customized recommendations for 12 key soil nutrients (macro, secondary, and micro nutrients) to reduce input costs.",
                "required_documents": "Soil sample details, Land holding details, Aadhaar Card.",
                "official_website": "https://soilhealth.dac.gov.in/",
                "apply_link": "https://soilhealth.dac.gov.in/",
                "farmer_category": "All Farmers",
                "crop_category": "All Crops",
                "status": "Active",
            },
            {
                "scheme_name": "Kisan Credit Card (KCC)",
                "gujarati_name": "કિસાન ક્રેડિટ કાર્ડ",
                "scheme_type": "Central",
                "description": "Introduced to provide timely and flexible credit to farmers for their short-term agricultural expenses (seeds, fertilizers, pesticides), machinery maintenance, and consumption needs.",
                "eligibility": "All farmers, including owner cultivators, tenant farmers, oral lessees, sharecroppers, and joint liability groups.",
                "benefits": "Access to crop loans up to Rs 3 Lakh at low subsidized interest rates (starting at 4% with timely repayment interest subvention benefits).",
                "required_documents": "Aadhaar Card, Voter ID, Land ownership certificate (7/12, 8A), Sowing Details, Passport size photographs.",
                "official_website": "https://www.kccform.in/",
                "apply_link": "https://www.kccform.in/",
                "farmer_category": "All Farmers, Oral Lessees, Sharecroppers",
                "crop_category": "All Crops",
                "status": "Active",
            },
            {
                "scheme_name": "Pradhan Mantri Krishi Sinchai Yojana (PMKSY)",
                "gujarati_name": "પ્રધાનમંત્રી કૃષિ સિંચાઈ યોજના",
                "scheme_type": "Central",
                "description": "Aimed at developing and optimizing water resources, improving on-farm water use efficiency through 'Per Drop More Crop' technologies, and ensuring wider irrigation access.",
                "eligibility": "Farmers owning agricultural land with a viable water source, cooperative farming societies, and self-help groups.",
                "benefits": "Subsidies up to 55-60% for installing micro-irrigation systems (drip and sprinkler systems), helping save water and fertilizer.",
                "required_documents": "Aadhaar Card, Land Registry records (7/12 & 8A extracts), Water Source Availability Certificate, Bank details, vendor quotation.",
                "official_website": "https://pmksy.gov.in/",
                "apply_link": "https://pmksy.gov.in/",
                "farmer_category": "All Farmers",
                "crop_category": "All Crops, Cotton, Vegetables",
                "status": "Active",
            },
            {
                "scheme_name": "Gujarat iKhedut Portal Schemes",
                "gujarati_name": "આઈ-ખેડૂત પોર્ટલ યોજનાઓ",
                "scheme_type": "Gujarat",
                "description": "A unified platform by the Government of Gujarat providing various subsidies for purchase of agricultural machinery, tractors, power tillers, solar power fencing, and greenhouses.",
                "eligibility": "Farmers residing and farming in Gujarat state, possessing valid land ownership documents.",
                "benefits": "Financial subsidies up to 40% to 75% on various agricultural assets, tools, inputs, and post-harvest infrastructure.",
                "required_documents": "Aadhaar Card, Cast Certificate (for specific categories), 7/12 and 8A extracts, Bank Passbook, active mobile number.",
                "official_website": "https://ikhedut.gujarat.gov.in/",
                "apply_link": "https://ikhedut.gujarat.gov.in/Public/Scheme_Current_Status.aspx",
                "farmer_category": "All Gujarat Farmers",
                "crop_category": "All Crops, Horticulture, Floriculture",
                "status": "Active",
            },
            {
                "scheme_name": "National Agriculture Market (eNAM)",
                "gujarati_name": "રાષ્ટ્રીય કૃષિ બજાર (eNAM)",
                "scheme_type": "Central",
                "description": "A pan-India electronic trading portal that networks existing APMC mandis to create a unified national market for agricultural commodities, ensuring competitive prices.",
                "eligibility": "Farmers, individual traders, commission agents, and farmer producer organizations (FPOs) registered with integrated APMCs.",
                "benefits": "Real-time price discovery, online bidding for transparency, elimination of middlemen, and direct digital payouts to bank accounts.",
                "required_documents": "APMC registration receipt, Bank account bank statement, Aadhaar Card, active mobile number.",
                "official_website": "https://enam.gov.in/",
                "apply_link": "https://enam.gov.in/web/register",
                "farmer_category": "All Farmers, FPOs, Traders",
                "crop_category": "Grains, Pulses, Spices, Oilseeds, Fruits & Vegetables",
                "status": "Active",
            },
            {
                "scheme_name": "Micro Irrigation Scheme (GGRC)",
                "gujarati_name": "માઇક્રો ઇરીગેશન યોજના",
                "scheme_type": "Gujarat",
                "description": "Subsidized water conservation implementation driven by the Gujarat Green Revolution Company (GGRC), helping farmers adopt drip and sprinkler irrigation.",
                "eligibility": "Landholding farmers of Gujarat state with an operational water source (borewell/canal/well).",
                "benefits": "State subsidy of up to 70% of the cost for general farmers and up to 85% for SC/ST category farmers.",
                "required_documents": "Copy of 7/12 & 8-A land registry extracts, water source electrical connection certificate, Aadhaar card copy, bank details.",
                "official_website": "https://ggrc.co.in/",
                "apply_link": "https://ggrc.co.in/",
                "farmer_category": "All Gujarat Farmers, SC/ST Farmers",
                "crop_category": "All Crops, Cotton, Groundnut",
                "status": "Active",
            },
            {
                "scheme_name": "Organic Farming Assistance Scheme",
                "gujarati_name": "સજીવ ખેતી સહાય યોજના",
                "scheme_type": "Gujarat",
                "description": "Financial assistance program by Gujarat's Department of Agriculture to promote organic manure production, cow-rearing, and biological crop pest control.",
                "eligibility": "Gujarat farmers transitioning to organic, natural, or ZBNF (Zero Budget Natural Farming) systems.",
                "benefits": "Direct financial aid of Rs 10,000 per hectare (up to 2 ha limit) and monthly livestock maintenance aid of Rs 900 for organic dairy compost feedstock.",
                "required_documents": "Assistance scheme registration, proof of organic cow ownership, land records, Aadhaar Card, bank passbook.",
                "official_website": "https://ikhedut.gujarat.gov.in/",
                "apply_link": "https://ikhedut.gujarat.gov.in/",
                "farmer_category": "Organic Farmers, Small & Marginal Farmers",
                "crop_category": "Organic Grains, Vegetables, Spices",
                "status": "Active",
            },
            {
                "scheme_name": "Solar Pump Scheme (PM-KUSUM)",
                "gujarati_name": "સોલાર પંપ યોજના (પીએમ-કુસુમ)",
                "scheme_type": "Central",
                "description": "Helps farmers replace existing diesel-powered pumps with clean solar pumps. Reduces irrigation grid electricity costs and allows generation of surplus green energy.",
                "eligibility": "Farmers, groups, cooperative societies, and water user associations owning land with minor irrigation facilities.",
                "benefits": "60% direct subsidy for installing solar pumps (30% Central grant, 30% State grant), plus options to sell surplus generated solar energy back to local grids.",
                "required_documents": "Aadhaar Card, Land ownership extracts (7/12 & 8A), Bank account details, electricity connection certificate (if applicable).",
                "official_website": "https://mnre.gov.in/",
                "apply_link": "https://www.ikhedut.gujarat.gov.in/",
                "farmer_category": "All Farmers, Cooperatives",
                "crop_category": "All Crops",
                "status": "Active",
            }
        ]

        count = 0
        for s_data in schemes:
            obj, created = GovernmentScheme.objects.update_or_create(
                scheme_name=s_data["scheme_name"],
                defaults=s_data
            )
            if created:
                count += 1
                self.stdout.write(self.style.SUCCESS(f"Successfully seeded: {obj.scheme_name}"))
            else:
                self.stdout.write(f"Updated existing: {obj.scheme_name}")

        self.stdout.write(self.style.SUCCESS(f"Database seeding completed. {count} new schemes inserted."))
