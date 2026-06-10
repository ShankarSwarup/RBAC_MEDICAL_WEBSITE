from enum import Enum

class UserRole(str, Enum):
    SUPERADMIN = "SUPERADMIN"
    ADMIN = "ADMIN"
    DOCTOR = "DOCTOR"
    PATIENT = "PATIENT"
    PHARMA = "PHARMA"
    LAB_TECH = "LAB_TECH"

class AppointmentStatus(str, Enum):
    SCHEDULED = "SCHEDULED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class ScanType(str, Enum):
    MRI = "MRI"
    CT = "CT"
    XRAY = "XRAY"
    BLOOD_WORK = "BLOOD_WORK"

class RecordStatus(str, Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
