from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List
from bson import ObjectId
from models import HospitalCreate, HospitalDB
from enums import UserRole
from database import hospitals_collection, users_collection
from dependencies import get_current_user, require_role
from utils import generate_display_id

router = APIRouter(prefix="/api/hospitals", tags=["Hospitals"])

@router.post("/", response_model=HospitalDB)
async def create_hospital(hospital: HospitalCreate, current_user: dict = Depends(require_role([UserRole.SUPERADMIN]))):
    """Only SuperAdmins can register new hospitals to the platform."""
    hospital_dict = hospital.dict()
    hospital_dict["display_id"] = generate_display_id("HOSP")
    new_hospital = await hospitals_collection.insert_one(hospital_dict)
    
    created_hospital = await hospitals_collection.find_one({"_id": new_hospital.inserted_id})
    created_hospital["id"] = str(created_hospital["_id"])
    return created_hospital

@router.get("/me")
async def get_my_hospital(current_user: dict = Depends(get_current_user)):
    """Retrieve details for the current user's assigned hospital."""
    hosp_id_str = current_user.get("hospital_id")
    if not hosp_id_str:
        raise HTTPException(status_code=404, detail="No hospital affiliation found for this user.")
        
    hosp = await hospitals_collection.find_one({"_id": ObjectId(hosp_id_str)})
    if not hosp:
        raise HTTPException(status_code=404, detail="Hospital data not found.")
        
    hosp["id"] = str(hosp["_id"])
    del hosp["_id"]
    return hosp

@router.get("/cities")
async def get_available_cities():
    """Returns a list of all distinct cities that have registered hospitals."""
    cities = await hospitals_collection.distinct("location_city")
    return {"cities": cities}

@router.get("/", response_model=List[HospitalDB])
async def list_hospitals(city: str | None = None):
    """List all available hospitals, optionally filtered by city."""
    query = {}
    if city:
        query["location_city"] = city
        
    hospitals = []
    async for hospital in hospitals_collection.find(query):
        hospital["id"] = str(hospital["_id"])
        hospitals.append(hospital)
    return hospitals

@router.get("/analytics")
async def get_platform_analytics(current_user: dict = Depends(require_role([UserRole.SUPERADMIN]))):
    """Platform-wide analytics for SuperAdmin, including detailed patient snapshots."""
    from database import records_collection, scans_collection
    
    total_hospitals = await hospitals_collection.count_documents({})
    total_patients_count = await users_collection.count_documents({"role": UserRole.PATIENT})
    total_doctors = await users_collection.count_documents({"role": UserRole.DOCTOR})
    total_prescriptions = await records_collection.count_documents({})
    total_scans = await scans_collection.count_documents({})
    
    patients = []
    async for p in users_collection.find({"role": UserRole.PATIENT}, limit=50):
        p["id"] = str(p["_id"])
        if p.get("hospital_id"):
             p["hospital_id"] = str(p["hospital_id"])
        del p["_id"]
        if "password" in p: del p["password"]
        patients.append(p)
    
    return {
        "stats": {
            "hospitals": total_hospitals,
            "patients": total_patients_count,
            "doctors": total_doctors,
            "prescriptions": total_prescriptions,
            "scans": total_scans
        },
        "patients": patients
    }

@router.put("/me/departments")
async def update_departments(
    payload: dict = Body(...),
    current_user: dict = Depends(require_role([UserRole.ADMIN]))
):
    """Local Admins can update the list of OPD departments their hospital offers.
    Expects JSON body: { "departments": ["Cardiology", "Neurology"] }
    """
    hospital_id = current_user.get("hospital_id")
    if not hospital_id:
        raise HTTPException(status_code=400, detail="Admin is not assigned to a hospital.")
    
    departments = payload.get("departments", [])
    if not isinstance(departments, list):
        raise HTTPException(status_code=422, detail="departments must be a list of strings.")

    await hospitals_collection.update_one(
        {"_id": ObjectId(hospital_id)},
        {"$set": {"departments": departments}}
    )
    return {"message": "OPD departments updated successfully", "departments": departments}
