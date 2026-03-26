from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from database import get_db
import models, auth

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


class RegisterRequest(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str
    middle_name: Optional[str] = None
    phone_primary: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


@router.post("/register", status_code=201)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(models.Member).filter(models.Member.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    member = models.Member(
        email=req.email,
        hashed_password=auth.get_password_hash(req.password),
        first_name=req.first_name,
        last_name=req.last_name,
        middle_name=req.middle_name,
        phone_primary=req.phone_primary,
        role="member",
        is_active=False,
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    return {"message": "Registration successful. Your account will be activated after payment verification.", "id": member.id}


@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.Member).filter(models.Member.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    token = auth.create_access_token({"sub": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
            "is_active": user.is_active,
        }
    }


@router.get("/me")
def get_me(current_user: models.Member = Depends(auth.get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "photo_url": current_user.photo_url,
        "membership_category": current_user.membership_category,
        "chapter": current_user.chapter,
    }
