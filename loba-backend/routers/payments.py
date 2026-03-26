from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
import models, auth, os, shutil, uuid
from datetime import datetime

router = APIRouter(prefix="/api/payments", tags=["Payments"])
UPLOAD_DIR = "uploads"


@router.post("/submit")
async def submit_payment(
    amount: str = Form(...),
    payment_year: str = Form(...),
    proof: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user)
):
    ext = proof.filename.split(".")[-1]
    filename = f"proof_{current_user.id}_{uuid.uuid4().hex}.{ext}"
    path = os.path.join(UPLOAD_DIR, filename)
    with open(path, "wb") as f:
        shutil.copyfileobj(proof.file, f)
    payment = models.Payment(
        member_id=current_user.id,
        amount=amount,
        payment_year=payment_year,
        proof_url=f"/uploads/{filename}",
        status="Submitted"
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return {"id": payment.id, "status": payment.status, "message": "Payment submitted for review"}


@router.get("/my")
def my_payments(db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    payments = db.query(models.Payment).filter(models.Payment.member_id == current_user.id).all()
    return [{"id": p.id, "amount": p.amount, "payment_year": p.payment_year,
             "proof_url": p.proof_url, "status": p.status, "admin_note": p.admin_note,
             "submitted_at": str(p.submitted_at)} for p in payments]


@router.get("/", dependencies=[Depends(auth.require_admin)])
def list_payments(db: Session = Depends(get_db), status: str = None):
    q = db.query(models.Payment)
    if status:
        q = q.filter(models.Payment.status == status)
    payments = q.all()
    result = []
    for p in payments:
        m = p.member
        result.append({
            "id": p.id, "member_id": p.member_id,
            "member_name": f"{m.first_name} {m.last_name}" if m else "Unknown",
            "member_email": m.email if m else "",
            "amount": p.amount, "payment_year": p.payment_year,
            "proof_url": p.proof_url, "status": p.status,
            "admin_note": p.admin_note, "submitted_at": str(p.submitted_at)
        })
    return result


@router.patch("/{payment_id}/review", dependencies=[Depends(auth.require_super_admin)])
def review_payment(payment_id: int, action: str, admin_note: str = "",
                   db: Session = Depends(get_db)):
    if action not in ("approve", "reject"):
        raise HTTPException(status_code=400, detail="Action must be approve or reject")
    p = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Payment not found")
    p.status = "Approved" if action == "approve" else "Rejected"
    p.admin_note = admin_note
    p.reviewed_at = datetime.utcnow()
    if action == "approve":
        member = db.query(models.Member).filter(models.Member.id == p.member_id).first()
        if member:
            member.is_active = True
    db.commit()
    return {"status": p.status}
