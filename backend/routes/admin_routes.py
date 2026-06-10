from fastapi import APIRouter, Depends, HTTPException
from database import users_collection, hospitals_collection
from dependencies import require_role
from enums import UserRole

router = APIRouter(prefix="/api/admin", tags=["Super Admin"])

@router.get("/analytics")
async def get_system_analytics(current_user: dict = Depends(require_role([UserRole.SUPERADMIN]))):
    """Secure endpoint for Super Admins to view total system aggregations plus patient list."""
    hospitals_count = await hospitals_collection.count_documents({})
    doctors_count = await users_collection.count_documents({"role": UserRole.DOCTOR})
    patients_count = await users_collection.count_documents({"role": UserRole.PATIENT})
    staff_count = await users_collection.count_documents({"role": {"$in": [UserRole.LAB_TECH, UserRole.PHARMA, UserRole.ADMIN]}})
    
    # Build patient list for the registry table
    patient_list = []
    async for p in users_collection.find({"role": UserRole.PATIENT}, limit=50):
        p_data = {
            "id": str(p["_id"]),
            "email": p.get("email"),
            "full_name": p.get("full_name"),
            "display_id": p.get("display_id"),
            "hospital_id": str(p["hospital_id"]) if p.get("hospital_id") else None,
        }
        patient_list.append(p_data)
    
    return {
        "hospitals": hospitals_count,
        "doctors": doctors_count,
        "patients": patients_count,
        "other_staff": staff_count,
        "patient_list": patient_list
    }
