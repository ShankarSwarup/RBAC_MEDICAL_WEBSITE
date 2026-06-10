from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from bson import ObjectId
from models import UserCreate, UserLogin, Token, UserBase
from auth import get_password_hash, verify_password, create_access_token
from database import users_collection, user_helper
from dependencies import get_current_user
from utils import generate_display_id
from enums import UserRole

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Role-to-display-ID prefix mapping
ROLE_PREFIX_MAP = {
    UserRole.PATIENT: "PAT",
    UserRole.DOCTOR: "DOC",
    UserRole.ADMIN: "ADM",
    UserRole.SUPERADMIN: "SUP",
    UserRole.PHARMA: "PHR",
    UserRole.LAB_TECH: "LAB",
}

@router.post("/register", response_model=UserBase)
async def register(user: UserCreate):
    """Register a new user. Automatically generates a human-readable display_id based on role."""
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user_dict = user.dict()
    user_dict["password"] = get_password_hash(user_dict["password"])
    
    # Auto-generate display_id if not provided
    if not user_dict.get("display_id"):
        prefix = ROLE_PREFIX_MAP.get(user_dict.get("role"), "USR")
        user_dict["display_id"] = generate_display_id(prefix)
    
    if user_dict.get("hospital_id"):
        try:
            user_dict["hospital_id"] = ObjectId(user_dict["hospital_id"])
        except Exception:
            pass # Keep as string if not a valid ObjectId
            
    new_user = await users_collection.insert_one(user_dict)
    created_user = await users_collection.find_one({"_id": new_user.inserted_id})
    return user_helper(created_user)

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Authenticate user and return a JWT access token."""
    user = await users_collection.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(
        data={
            "email": user["email"],
            "role": user["role"],
            "hospital_id": str(user.get("hospital_id")) if user.get("hospital_id") else None
        }
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserBase)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    """Returns the authenticated user's profile data."""
    return current_user
