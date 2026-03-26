from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os, models
from database import engine
from routers import auth_router, members, payments, announcements, messages, finance
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="LOBA API", version="1.0.0", description="Lautai Old Boys Association API")

# Production-safe CORS configuration
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
if ENVIRONMENT == "production":
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "").split(",")
else:
    CORS_ORIGINS = ["http://localhost:5173", "http://localhost:3000", "http://localhost:8000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth_router.router)
app.include_router(members.router)
app.include_router(payments.router)
app.include_router(announcements.router)
app.include_router(messages.router)
app.include_router(finance.router)

@app.get("/")
def root():
    return {"message": "LOBA API is running", "version": "1.0.0"}

@app.get("/api/health")
def health():
    return {"status": "ok"}
