from motor.motor_asyncio import AsyncIOMotorClient
import os

# Read MongoDB URI from environment variables or use default local instance
MONGO_DETAILS = os.getenv("MONGO_URI", "mongodb://localhost:27017")

client = AsyncIOMotorClient(MONGO_DETAILS)
database = client.medical_platform

# Collections
hospitals_collection = database.get_collection("hospitals")
users_collection = database.get_collection("users")
inventory_collection = database.get_collection("inventory")
records_collection = database.get_collection("records")
invoices_collection = database.get_collection("invoices")
scans_collection = database.get_collection("scans")
scan_requests_collection = database.get_collection("scan_requests")
appointments_collection = database.get_collection("appointments")

# Helper function to parse ObjectId to string for Pydantic
def user_helper(user) -> dict:
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "role": user["role"],
        "full_name": user.get("full_name"),
        "hospital_id": str(user["hospital_id"]) if user.get("hospital_id") else None,
        "specialty": user.get("specialty"),
        "display_id": user.get("display_id"),
        "is_active": user.get("is_active", True)
    }
