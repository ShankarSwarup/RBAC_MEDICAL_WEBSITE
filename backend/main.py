from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

from routes import auth_routes, hospital_routes, pharma_routes, doctor_routes, lab_routes, patient_routes, admin_routes

app = FastAPI(title="Medical Website API", version="1.0.0", description="Multi-tenant RBAC Medical Platform")

_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_routes.router)
app.include_router(hospital_routes.router)
app.include_router(pharma_routes.router)
app.include_router(doctor_routes.router)
app.include_router(lab_routes.router)
app.include_router(patient_routes.router)
app.include_router(admin_routes.router)

@app.get("/")
async def root():
    return {"message": "Medical API is running successfully"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
