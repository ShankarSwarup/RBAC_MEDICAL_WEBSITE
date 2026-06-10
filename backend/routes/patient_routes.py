from fastapi import APIRouter, Depends, HTTPException, Response
from typing import List
from models import AppointmentCreate
from enums import UserRole
from database import appointments_collection, users_collection, hospitals_collection
from dependencies import get_current_user, require_role
from utils import generate_display_id
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/patients", tags=["Patients"])

@router.post("/book_appointment")
async def book_appointment(appointment: AppointmentCreate, current_user: dict = Depends(require_role([UserRole.PATIENT]))):
    """Patient books an appointment for a specific Hospital, Department, and Doctor.
    patient_id is taken from JWT for security — not from request body."""
    appt_dict = {
        "patient_id": current_user["id"],  # Always from JWT, not from request body
        "hospital_id": ObjectId(appointment.hospital_id),
        "department": appointment.department,
        "doctor_id": appointment.doctor_id,
        "appointment_date": appointment.appointment_date.isoformat(),
        "notes": appointment.notes,
        "status": "SCHEDULED",
        "display_id": generate_display_id("APT"),
    }
    
    new_appt = await appointments_collection.insert_one(appt_dict)
    return {"message": "Appointment booked successfully", "display_id": appt_dict["display_id"]}

@router.get("/my_appointments")
async def get_my_appointments(current_user: dict = Depends(require_role([UserRole.PATIENT]))):
    """Patient views their upcoming appointments with readable IDs."""
    appointments = []
    async for appt in appointments_collection.find({"patient_id": current_user["id"]}):
        appt["id"] = str(appt["_id"])
        if "hospital_id" in appt: appt["hospital_id"] = str(appt["hospital_id"])
        del appt["_id"]
        appointments.append(appt)
    return appointments

@router.get("/doctors")
async def get_doctors_for_booking(hospital_id: str, department: str | None = None):
    """Returns a list of doctors filtered by hospital and optionally by department (specialty)."""
    query = {
        "role": UserRole.DOCTOR,
        "hospital_id": ObjectId(hospital_id)
    }
    if department:
        query["specialty"] = department
        
    doctors = []
    async for doc in users_collection.find(query):
        doc["id"] = str(doc["_id"])
        doc["hospital_id"] = str(doc["hospital_id"])
        del doc["_id"]
        if "password" in doc: del doc["password"]
        doctors.append(doc)
    return doctors

@router.get("/export_ehr")
async def export_ehr(current_user: dict = Depends(require_role([UserRole.PATIENT]))):
    """Generates a text/markdown file representing the patient's EHR."""
    content = f"# Electronic Health Record\n\n"
    content += f"**Patient ID:** {current_user.get('display_id', current_user['id'])}\n"
    content += f"**Name:** {current_user.get('full_name', 'N/A')}\n"
    content += f"**Email:** {current_user['email']}\n"
    content += f"**Date Generated:** {datetime.utcnow().isoformat()}\n\n"
    content += "## Confidentiality Notice\nThis document contains sensitive medical information protected by platform policy.\n"
    
    return Response(
        content=content,
        media_type="text/markdown",
        headers={"Content-Disposition": f"attachment; filename=EHR_{current_user.get('display_id', current_user['id'])}.md"}
    )

@router.get("/my_records")
async def get_patient_records(current_user: dict = Depends(require_role([UserRole.PATIENT]))):
    """Retrieves all medical records and scans for the authenticated patient."""
    from database import records_collection, scans_collection
    
    prescriptions = []
    async for r in records_collection.find({"patient_id": current_user["id"]}):
        r["id"] = str(r["_id"])
        if "hospital_id" in r:
            r["hospital_id"] = str(r["hospital_id"])
        del r["_id"]
        prescriptions.append(r)
        
    scans = []
    async for s in scans_collection.find({"patient_id": current_user["id"]}):
        s["id"] = str(s["_id"])
        if "hospital_id" in s:
            s["hospital_id"] = str(s["hospital_id"])
        del s["_id"]
        scans.append(s)
        
    return {"prescriptions": prescriptions, "scans": scans}

@router.get("/medicine_info")
async def get_medicine_info(query: str):
    """Proxy to OpenFDA API to get information about a medicine."""
    import httpx
    from urllib.parse import quote
    safe_query = quote(query, safe="")
    url = f"https://api.fda.gov/drug/label.json?search=openfda.brand_name:{safe_query}&limit=1"
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(url)
            if response.status_code != 200:
                url2 = f"https://api.fda.gov/drug/label.json?search=openfda.generic_name:{safe_query}&limit=1"
                response = await client.get(url2)
                if response.status_code != 200:
                    return {"name": query, "error": "Medicine details not found. Please verify the brand name (e.g. Advil, Tylenol)."}
            data = response.json()
            result = data["results"][0]
            return {
                "name": result.get("openfda", {}).get("brand_name", [query])[0],
                "indications": result.get("indications_and_usage", ["Usage instructions not found."])[0],
                "warnings": result.get("warnings", [None])[0],
                "dosage": result.get("dosage_and_administration", [None])[0],
                "purpose": result.get("purpose", [None])[0],
            }
        except Exception as e:
            return {"name": query, "error": "Failed to connect to pharmaceutical database."}
