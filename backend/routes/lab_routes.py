from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List
from bson import ObjectId
from enums import UserRole, RecordStatus, ScanType
from database import scans_collection, scan_requests_collection
from dependencies import get_current_user, require_role
import shutil
import os
from datetime import datetime

from utils import generate_display_id

router = APIRouter(prefix="/api/labs", tags=["Lab Technician"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload_scan")
async def upload_patient_scan(patient_id: str, scan_type: ScanType, file: UploadFile = File(...), current_user: dict = Depends(require_role([UserRole.LAB_TECH]))):
    """Lab Tech uploads an MRI or Lab Report for a patient."""
    file_location = f"{UPLOAD_DIR}/{patient_id}_{file.filename}"
    
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
        
    scan_record = {
        "lab_tech_id": current_user["id"],
        "patient_id": patient_id,
        "scan_type": scan_type,
        "file_path": file_location,
        "hospital_id": ObjectId(current_user["hospital_id"]) if current_user.get("hospital_id") else None,
        "upload_date": datetime.utcnow().isoformat(),
        "display_id": generate_display_id("RPT")
    }
    
    new_scan = await scans_collection.insert_one(scan_record)
    
    # Mark the request as COMPLETED
    await scan_requests_collection.update_many(
        {"patient_id": patient_id, "scan_type": scan_type, "status": RecordStatus.PENDING},
        {"$set": {"status": RecordStatus.COMPLETED}}
    )
    
    return {"message": f"Successfully uploaded {file.filename}", "display_id": scan_record["display_id"]}

@router.get("/patient/{patient_id}")
async def get_patient_scans(patient_id: str, current_user: dict = Depends(get_current_user)):
    """Doctors, Patients, and Lab Techs can view uploaded scans."""
    if current_user["role"] == UserRole.PATIENT and current_user["id"] != patient_id:
         raise HTTPException(status_code=403, detail="You can only view your own scans")
         
    scans = []
    async for scan in scans_collection.find({"patient_id": patient_id}):
        scan["id"] = str(scan["_id"])
        if "hospital_id" in scan: scan["hospital_id"] = str(scan["hospital_id"])
        del scan["_id"]
        scans.append(scan)
    return scans

@router.get("/requests/pending")
async def get_pending_scan_requests(current_user: dict = Depends(require_role([UserRole.LAB_TECH]))):
    """Retrieves all pending scan requests for the technician's hospital (with readable IDs)."""
    pending = []
    hosp_id = ObjectId(current_user["hospital_id"]) if current_user.get("hospital_id") else None
    async for req in scan_requests_collection.find({"hospital_id": hosp_id, "status": RecordStatus.PENDING}):
        req["id"] = str(req["_id"])
        if "hospital_id" in req: req["hospital_id"] = str(req["hospital_id"])
        del req["_id"]
        pending.append(req)
    return pending
