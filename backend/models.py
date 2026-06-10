from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime
from enums import UserRole, AppointmentStatus, ScanType, RecordStatus

# --- User Models ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole
    hospital_id: Optional[str] = None
    specialty: Optional[str] = None # For Doctors (e.g., Cardiology, Pediatrics)
    display_id: Optional[str] = None # Readable ID like PAT-001 or DOC-123
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None
    role: str | None = None
    hospital_id: str | None = None

# --- Hospital Models ---
class HospitalBase(BaseModel):
    name: str
    address: str
    location_city: str = "Metropolis" # For location-based filtering
    departments: List[str] = ["General"] # OPDs available
    contact_email: EmailStr
    display_id: Optional[str] = None

class HospitalCreate(HospitalBase):
    pass

class HospitalDB(HospitalBase):
    id: str

# --- Appointment Models ---
class AppointmentStatus(str, Enum):
    SCHEDULED = "SCHEDULED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class AppointmentCreate(BaseModel):
    hospital_id: str
    department: str
    doctor_id: str
    appointment_date: datetime
    notes: Optional[str] = None
    display_id: Optional[str] = None

# --- Inventory Models ---
class MedicineCreate(BaseModel):
    name: str
    description: str
    side_effects: Optional[str] = None
    stock_level: int
    price: float
    hospital_id: Optional[str] = None
    display_id: Optional[str] = None
