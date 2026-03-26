from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models, auth, os, shutil, uuid

router = APIRouter(prefix="/api/members", tags=["Members"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    nationality: Optional[str] = None
    state_of_origin: Optional[str] = None
    nin: Optional[str] = None
    phone_primary: Optional[str] = None
    phone_alternate: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state_of_residence: Optional[str] = None
    entry_year: Optional[str] = None
    graduation_year: Optional[str] = None
    house: Optional[str] = None
    set_year: Optional[str] = None
    highest_qualification: Optional[str] = None
    institution_after: Optional[str] = None
    field_of_study: Optional[str] = None
    certifications: Optional[str] = None
    occupation: Optional[str] = None
    employer: Optional[str] = None
    industry: Optional[str] = None
    years_experience: Optional[str] = None
    linkedin: Optional[str] = None
    skills: Optional[str] = None
    marital_status: Optional[str] = None
    num_children: Optional[int] = None
    spouse_name: Optional[str] = None
    membership_category: Optional[str] = None
    chapter: Optional[str] = None
    previous_roles: Optional[str] = None
    areas_of_interest: Optional[str] = None
    referral_source: Optional[str] = None


def member_to_dict(m):
    return {
        "id": m.id, "email": m.email, "role": m.role, "is_active": m.is_active,
        "created_at": str(m.created_at) if m.created_at else None,
        "first_name": m.first_name, "middle_name": m.middle_name, "last_name": m.last_name,
        "date_of_birth": m.date_of_birth, "gender": m.gender, "nationality": m.nationality,
        "state_of_origin": m.state_of_origin, "nin": m.nin, "photo_url": m.photo_url,
        "phone_primary": m.phone_primary, "phone_alternate": m.phone_alternate,
        "address": m.address, "city": m.city, "state_of_residence": m.state_of_residence,
        "entry_year": m.entry_year, "graduation_year": m.graduation_year, "house": m.house,
        "set_year": m.set_year, "highest_qualification": m.highest_qualification,
        "institution_after": m.institution_after, "field_of_study": m.field_of_study,
        "certifications": m.certifications, "occupation": m.occupation, "employer": m.employer,
        "industry": m.industry, "years_experience": m.years_experience, "linkedin": m.linkedin,
        "skills": m.skills, "marital_status": m.marital_status, "num_children": m.num_children,
        "spouse_name": m.spouse_name, "membership_category": m.membership_category,
        "chapter": m.chapter, "previous_roles": m.previous_roles,
        "areas_of_interest": m.areas_of_interest, "referral_source": m.referral_source,
    }


@router.get("/me")
def get_my_profile(current_user=Depends(auth.get_current_user)):
    return member_to_dict(current_user)


@router.put("/me")
def update_my_profile(data: ProfileUpdate, db: Session = Depends(get_db),
                       current_user=Depends(auth.get_current_user)):
    for field, value in data.dict(exclude_none=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return member_to_dict(current_user)


@router.post("/me/photo")
async def upload_photo(file: UploadFile = File(...), db: Session = Depends(get_db),
                       current_user=Depends(auth.get_current_user)):
    ext = file.filename.split(".")[-1]
    filename = f"photo_{current_user.id}_{uuid.uuid4().hex}.{ext}"
    path = os.path.join(UPLOAD_DIR, filename)
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    current_user.photo_url = f"/uploads/{filename}"
    db.commit()
    return {"photo_url": current_user.photo_url}


@router.get("/directory")
def member_directory(db: Session = Depends(get_db),
                     current_user=Depends(auth.get_current_user),
                     search: Optional[str] = Query(None)):
    q = db.query(models.Member).filter(models.Member.is_active == True)
    if search:
        q = q.filter(
            (models.Member.first_name.ilike(f"%{search}%")) |
            (models.Member.last_name.ilike(f"%{search}%")) |
            (models.Member.occupation.ilike(f"%{search}%"))
        )
    members = q.limit(200).all()
    return [{"id": m.id, "first_name": m.first_name, "last_name": m.last_name,
             "occupation": m.occupation, "employer": m.employer, "city": m.city,
             "state_of_residence": m.state_of_residence, "set_year": m.set_year,
             "photo_url": m.photo_url, "membership_category": m.membership_category,
             "chapter": m.chapter, "linkedin": m.linkedin} for m in members]


@router.get("/", dependencies=[Depends(auth.require_admin)])
def list_members(db: Session = Depends(get_db), skip: int = 0, limit: int = 100,
                 search: Optional[str] = Query(None), is_active: Optional[bool] = Query(None)):
    q = db.query(models.Member)
    if search:
        q = q.filter(
            (models.Member.first_name.ilike(f"%{search}%")) |
            (models.Member.last_name.ilike(f"%{search}%")) |
            (models.Member.email.ilike(f"%{search}%"))
        )
    if is_active is not None:
        q = q.filter(models.Member.is_active == is_active)
    total = q.count()
    members = q.offset(skip).limit(limit).all()
    return {"total": total, "members": [member_to_dict(m) for m in members]}


@router.get("/{member_id}", dependencies=[Depends(auth.require_admin)])
def get_member(member_id: int, db: Session = Depends(get_db)):
    m = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Member not found")
    return member_to_dict(m)


@router.patch("/{member_id}/activate", dependencies=[Depends(auth.require_super_admin)])
def toggle_activate(member_id: int, db: Session = Depends(get_db)):
    m = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Not found")
    m.is_active = not m.is_active
    db.commit()
    return {"is_active": m.is_active}


@router.patch("/{member_id}/role", dependencies=[Depends(auth.require_super_admin)])
def change_role(member_id: int, role: str, db: Session = Depends(get_db)):
    if role not in ("member", "admin", "super_admin", "finance"):
        raise HTTPException(status_code=400, detail="Invalid role")
    m = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Not found")
    m.role = role
    db.commit()
    return {"role": m.role}


@router.patch("/{member_id}/reset-password", dependencies=[Depends(auth.require_super_admin)])
def reset_password(member_id: int, new_password: str, db: Session = Depends(get_db)):
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    m = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Not found")
    m.hashed_password = auth.get_password_hash(new_password)
    db.commit()
    return {"message": f"Password reset for {m.first_name} {m.last_name}"}


@router.get("/export/excel", dependencies=[Depends(auth.require_super_admin)])
def export_excel(db: Session = Depends(get_db)):
    from fastapi.responses import StreamingResponse
    import openpyxl
    from io import BytesIO
    members = db.query(models.Member).all()
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "LOBA Members"
    headers = ["ID", "First Name", "Middle Name", "Last Name", "Email", "Phone",
               "Gender", "Date of Birth", "State of Origin", "City",
               "State of Residence", "Set Year", "Entry Year", "Graduation Year",
               "Highest Qualification", "Field of Study", "Occupation", "Employer",
               "Industry", "Membership Category", "Chapter", "Is Active", "Registered At"]
    ws.append(headers)
    for m in members:
        ws.append([m.id, m.first_name, m.middle_name, m.last_name, m.email,
                   m.phone_primary, m.gender, m.date_of_birth, m.state_of_origin,
                   m.city, m.state_of_residence, m.set_year, m.entry_year,
                   m.graduation_year, m.highest_qualification, m.field_of_study,
                   m.occupation, m.employer, m.industry, m.membership_category,
                   m.chapter, "Yes" if m.is_active else "No",
                   str(m.created_at) if m.created_at else ""])
    stream = BytesIO()
    wb.save(stream)
    stream.seek(0)
    return StreamingResponse(stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=LOBA_Members.xlsx"})
