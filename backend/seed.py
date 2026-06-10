import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import os
from utils import generate_display_id

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

MONGO_DETAILS = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_DETAILS)
database = client.medical_platform

hospitals_collection = database.get_collection("hospitals")
users_collection = database.get_collection("users")
inventory_collection = database.get_collection("inventory")

async def seed_database():
    print("Clearing existing data...")
    await users_collection.delete_many({})
    await hospitals_collection.delete_many({})
    await inventory_collection.delete_many({})

    password_hash = pwd_context.hash("password123")

    print("Creating hospitals...")
    hospitals_data = [
        {
            "name": "General City Hospital",
            "address": "123 Health Ave, Downtown",
            "location_city": "Metropolis",
            "departments": ["Cardiology", "Pediatrics", "Orthopedics", "General"],
            "contact_email": "info@generalcity.com",
            "display_id": generate_display_id("HOSP")
        },
        {
            "name": "St. Luke's Clinic",
            "address": "456 Wellness Rd, Northview",
            "location_city": "Metropolis",
            "departments": ["Dermatology", "Neurology", "Psychiatry"],
            "contact_email": "contact@stlukes.com",
            "display_id": generate_display_id("HOSP")
        }
    ]
    
    hospitals = []
    for h in hospitals_data:
        res = await hospitals_collection.insert_one(h)
        h["_id"] = res.inserted_id
        hospitals.append(h)

    hosp1_id = hospitals[0]["_id"]
    hosp2_id = hospitals[1]["_id"]

    print("Creating users...")
    users = [
        # SuperAdmin
        {
            "email": "superadmin@medical.com",
            "full_name": "Chief Executive",
            "role": "SUPERADMIN",
            "password": password_hash,
            "hospital_id": None,
            "display_id": generate_display_id("SA"),
            "is_active": True
        },
        # Hospital 1 Staff
        {
            "email": "admin@hospital.com",
            "full_name": "Hospital Admin One",
            "role": "ADMIN",
            "password": password_hash,
            "hospital_id": hosp1_id,
            "display_id": generate_display_id("ADM"),
            "is_active": True
        },
        {
            "email": "doctor@hospital.com",
            "full_name": "Dr. John Cardiology",
            "role": "DOCTOR",
            "specialty": "Cardiology",
            "password": password_hash,
            "hospital_id": hosp1_id,
            "display_id": generate_display_id("DOC"),
            "is_active": True
        },
        {
            "email": "pediatrician@hospital.com",
            "full_name": "Dr. Sarah Kids",
            "role": "DOCTOR",
            "specialty": "Pediatrics",
            "password": password_hash,
            "hospital_id": hosp1_id,
            "display_id": generate_display_id("DOC"),
            "is_active": True
        },
        # Hospital 2 Staff
        {
            "email": "neuro@stlukes.com",
            "full_name": "Dr. Brain Neurology",
            "role": "DOCTOR",
            "specialty": "Neurology",
            "password": password_hash,
            "hospital_id": hosp2_id,
            "display_id": generate_display_id("DOC"),
            "is_active": True
        },
        # General Patient
        {
            "email": "patient@hospital.com",
            "full_name": "Alice Patient",
            "role": "PATIENT",
            "password": password_hash,
            "hospital_id": hosp1_id,
            "display_id": generate_display_id("PAT"),
            "is_active": True
        },
        # Departments Staff
        {
            "email": "pharma@hospital.com",
            "full_name": "Pharmacist Mark",
            "role": "PHARMA",
            "password": password_hash,
            "hospital_id": hosp1_id,
            "display_id": generate_display_id("PH"),
            "is_active": True
        },
        {
            "email": "lab@hospital.com",
            "full_name": "Lab Tech Nina",
            "role": "LAB_TECH",
            "password": password_hash,
            "hospital_id": hosp1_id,
            "display_id": generate_display_id("LAB"),
            "is_active": True
        },
        {
            "email": "patient2@hospital.com",
            "full_name": "Bob Patient",
            "role": "PATIENT",
            "password": password_hash,
            "hospital_id": hosp1_id,
            "display_id": generate_display_id("PAT"),
            "is_active": True
        }
    ]

    await users_collection.insert_many(users)

    print("Seeding inventory...")
    medicines = [
        {
            "name": "Amoxicillin",
            "description": "Antibiotic",
            "stock_level": 50,
            "price": 10.5,
            "hospital_id": hosp1_id,
            "display_id": generate_display_id("MED")
        },
        {
            "name": "Paracetamol",
            "description": "Pain reliever",
            "stock_level": 100,
            "price": 2.0,
            "hospital_id": hosp1_id,
            "display_id": generate_display_id("MED")
        }
    ]
    await inventory_collection.insert_many(medicines)

    print("\nDatabase re-seeded with enhanced fields!")
    print("------------------------------------------")
    print("Test Accounts (all password: password123):")
    print("  SuperAdmin : superadmin@medical.com")
    print("  Local Admin: admin@hospital.com (General City Hospital)")
    print("  Doctor     : doctor@hospital.com (Cardiology)")
    print("  Doctor     : pediatrician@hospital.com (Pediatrics)")
    print("  Doctor     : neuro@stlukes.com (St. Luke's - Neurology)")
    print("  Patient    : patient@hospital.com (Alice Patient)")
    print("  Patient    : patient2@hospital.com (Bob Patient)")
    print("  Pharma     : pharma@hospital.com")
    print("  Lab Tech   : lab@hospital.com")
    print("  City       : Metropolis (select this in patient booking)")

if __name__ == "__main__":
    asyncio.run(seed_database())
