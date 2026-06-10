from fastapi import APIRouter, Depends, HTTPException
from typing import List
from bson import ObjectId
from enums import UserRole, RecordStatus, ScanType
from database import records_collection, scans_collection, appointments_collection, users_collection, scan_requests_collection
from dependencies import get_current_user, require_role
from datetime import datetime

from utils import generate_display_id

router = APIRouter(prefix="/api/doctor", tags=["Doctors"])

@router.post("/prescribe")
async def prescribe_medicine(patient_id: str, medicine_id: str, instructions: str, current_user: dict = Depends(require_role([UserRole.DOCTOR]))):
    """Doctor prescribes a medicine to a patient."""
    prescription = {
        "doctor_id": current_user["id"],
        "patient_id": patient_id,
        "medicine_id": medicine_id,
        "instructions": instructions,
        "hospital_id": ObjectId(current_user["hospital_id"]) if current_user.get("hospital_id") else None,
        "date_prescribed": datetime.utcnow().isoformat(),
        "status": RecordStatus.PENDING,
        "display_id": generate_display_id("PRSC")
    }
    
    new_record = await records_collection.insert_one(prescription)
    return {"message": "Prescription added successfully", "display_id": prescription["display_id"]}

@router.get("/patients/{patient_id}/history")
async def get_patient_history(patient_id: str, current_user: dict = Depends(require_role([UserRole.DOCTOR, UserRole.PATIENT]))):
    """Doctors view history; Patients view their own history."""
    if current_user["role"] == UserRole.PATIENT and current_user["id"] != patient_id:
        raise HTTPException(status_code=403, detail="You can only view your own medical history")
        
    records = []
    async for record in records_collection.find({"patient_id": patient_id}):
        record["id"] = str(record["_id"])
        if "hospital_id" in record:
            record["hospital_id"] = str(record["hospital_id"])
        del record["_id"]
        records.append(record)
    return records

@router.post("/request_scan")
async def request_medical_scan(patient_id: str, scan_type: ScanType, current_user: dict = Depends(require_role([UserRole.DOCTOR]))):
    """Submits a scan request directly to the Lab Team queue."""
    scan_req = {
        "doctor_id": current_user["id"],
        "hospital_id": ObjectId(current_user["hospital_id"]) if current_user.get("hospital_id") else None,
        "patient_id": patient_id,
        "scan_type": scan_type,
        "status": RecordStatus.PENDING,
        "display_id": generate_display_id("SCAN"),
        "date_requested": datetime.utcnow().isoformat()
    }
    new_req = await scan_requests_collection.insert_one(scan_req)
    return {"message": f"{scan_type} request submitted to Lab successfully", "display_id": scan_req["display_id"]}

@router.get("/patients")
async def list_patients(current_user: dict = Depends(require_role([UserRole.DOCTOR]))):
    """Lists all patients registered in the same hospital as the doctor."""
    patients = []
    # Cast hospital_id to ObjectId to match database type
    hosp_id = ObjectId(current_user["hospital_id"]) if current_user.get("hospital_id") else None
    
    async for patient in users_collection.find({"role": UserRole.PATIENT, "hospital_id": hosp_id}):
        patient["id"] = str(patient["_id"])
        if "hospital_id" in patient:
            patient["hospital_id"] = str(patient["hospital_id"])
        del patient["_id"]
        if "password" in patient: del patient["password"]
        patients.append(patient)
    return patients

@router.get("/appointments")
async def list_doctor_appointments(current_user: dict = Depends(require_role([UserRole.DOCTOR]))):
    """List appointments for the current doctor."""
    appointments = []
    async for appt in appointments_collection.find({"doctor_id": current_user["id"]}):
        appt["id"] = str(appt["_id"])
        if "hospital_id" in appt: appt["hospital_id"] = str(appt["hospital_id"])
        del appt["_id"]
        appointments.append(appt)
    return appointments

@router.get("/scans/completed")
async def get_completed_scans(current_user: dict = Depends(require_role([UserRole.DOCTOR]))):
    """Retrieves all completed scan requests for the current doctor's hospital."""
    completed = []
    hosp_id = ObjectId(current_user["hospital_id"]) if current_user.get("hospital_id") else None
    async for req in scan_requests_collection.find({"hospital_id": hosp_id, "status": RecordStatus.COMPLETED}):
        req["id"] = str(req["_id"])
        if "hospital_id" in req:
            req["hospital_id"] = str(req["hospital_id"])
        del req["_id"]
        # In a real app, join with scans_collection to get the actual file_path
        completed.append(req)
    return completed
