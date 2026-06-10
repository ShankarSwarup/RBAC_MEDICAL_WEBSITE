from fastapi import APIRouter, Depends, HTTPException
from typing import List
from bson import ObjectId
from models import MedicineCreate
from enums import UserRole, RecordStatus
from database import inventory_collection, invoices_collection, records_collection
from dependencies import get_current_user, require_role
from datetime import datetime

from utils import generate_display_id

router = APIRouter(prefix="/api/pharma", tags=["Pharmacy Inventory"])

@router.post("/inventory")
async def add_medicine_v1(medicine: MedicineCreate, current_user: dict = Depends(require_role([UserRole.PHARMA, UserRole.ADMIN]))):
    """Old endpoint kept for compatibility."""
    return await add_inventory(medicine, current_user)

@router.get("/inventory")
async def get_inventory(current_user: dict = Depends(get_current_user)):
    """Users view inventory for their assigned hospital."""
    hospital_id_str = current_user.get("hospital_id")
    if not hospital_id_str:
        return []
    
    hosp_id = ObjectId(hospital_id_str)
    items = []
    async for item in inventory_collection.find({"hospital_id": hosp_id}):
        item["id"] = str(item["_id"])
        if "hospital_id" in item:
            item["hospital_id"] = str(item["hospital_id"])
        del item["_id"]
        items.append(item)
    return items

@router.post("/dispense")
async def dispense_medicine(prescription_id: str, current_user: dict = Depends(require_role([UserRole.PHARMA]))):
    """Pharma dispenses medicine based on a Doctor's prescription."""
    prescription = await records_collection.find_one({"_id": ObjectId(prescription_id)})
    if not prescription:
         raise HTTPException(status_code=404, detail="Prescription not found")
     
    # Compare hospital_id safely — prescription stores ObjectId, current_user has string
    rx_hospital_id = str(prescription.get("hospital_id", ""))
    user_hospital_id = str(current_user.get("hospital_id", ""))
    if rx_hospital_id != user_hospital_id:
         raise HTTPException(status_code=403, detail="Prescription does not belong to your hospital")
         
    # Generate Invoice
    invoice = {
        "pharma_id": current_user["id"],
        "patient_id": prescription["patient_id"],
        "hospital_id": current_user["hospital_id"],
        "prescription_id": prescription_id,
        "amount_due": 150.00,
        "status": "UNPAID",
        "display_id": generate_display_id("INV"),
        "date_issued": datetime.utcnow().isoformat()
    }
    
    # Decrement stock
    hosp_id = ObjectId(current_user["hospital_id"])
    await inventory_collection.update_one(
        {"hospital_id": hosp_id, "name": prescription["medicine_id"]},
        {"$inc": {"stock_level": -1}}
    )

    await invoices_collection.insert_one(invoice)
    await records_collection.update_one({"_id": ObjectId(prescription_id)}, {"$set": {"status": "FULFILLED"}})
    
    return {"message": "Medicine dispensed", "display_id": invoice["display_id"]}

@router.get("/prescriptions/pending")
async def get_pending_prescriptions(current_user: dict = Depends(require_role([UserRole.PHARMA]))):
    """Retrieve all prescriptions that need fulfillment."""
    pending = []
    hosp_id = ObjectId(current_user["hospital_id"])
    async for rec in records_collection.find({"hospital_id": hosp_id, "status": RecordStatus.PENDING}):
        rec["id"] = str(rec["_id"])
        if "hospital_id" in rec:
            rec["hospital_id"] = str(rec["hospital_id"])
        del rec["_id"]
        pending.append(rec)
    return pending

@router.post("/inventory/add")
async def add_inventory(medicine: MedicineCreate, current_user: dict = Depends(require_role([UserRole.PHARMA, UserRole.ADMIN]))):
    """Adds fresh inventory definitions to the local hospital."""
    item = medicine.dict()
    item["hospital_id"] = ObjectId(current_user["hospital_id"])
    item["display_id"] = generate_display_id("MED")
    item["last_updated"] = datetime.utcnow().isoformat()
    new_item = await inventory_collection.insert_one(item)
    return {"message": "Inventory successfully updated.", "display_id": item["display_id"]}
