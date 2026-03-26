from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func as sqlfunc
from pydantic import BaseModel
from typing import Optional
from database import get_db
from datetime import datetime
import models, auth

router = APIRouter(prefix="/api/finance", tags=["Finance"])


# ── Account Info ──────────────────────────────────────────────

class AccountInfoCreate(BaseModel):
    bank_name: str
    account_name: str
    account_number: str


@router.post("/account")
def set_account_info(data: AccountInfoCreate, db: Session = Depends(get_db),
                     current_user=Depends(auth.require_finance)):
    existing = db.query(models.AccountInfo).filter(models.AccountInfo.is_active == True).first()
    if existing:
        existing.bank_name = data.bank_name
        existing.account_name = data.account_name
        existing.account_number = data.account_number
        existing.updated_by = current_user.id
    else:
        acct = models.AccountInfo(bank_name=data.bank_name, account_name=data.account_name,
                                  account_number=data.account_number, updated_by=current_user.id)
        db.add(acct)
    db.commit()
    return {"message": "Account info updated"}


@router.get("/account")
def get_account_info(db: Session = Depends(get_db),
                     current_user=Depends(auth.get_current_user)):
    acct = db.query(models.AccountInfo).filter(models.AccountInfo.is_active == True).first()
    if not acct:
        return None
    return {"id": acct.id, "bank_name": acct.bank_name, "account_name": acct.account_name,
            "account_number": acct.account_number, "updated_at": str(acct.updated_at)}


# ── Balance (finance + super_admin only) ──────────────────────

@router.get("/balance")
def get_balance(db: Session = Depends(get_db),
                current_user=Depends(auth.require_finance)):
    # Calculate totals from string amounts
    approved_payments = db.query(models.Payment).filter(models.Payment.status == "Approved").all()
    total_approved = sum(float(p.amount or 0) for p in approved_payments)

    approved_expenses = db.query(models.ExpenseRequest).filter(models.ExpenseRequest.status == "Approved").all()
    total_expenses = sum(float(e.amount or 0) for e in approved_expenses)

    total_payments = len(approved_payments)
    pending_payments = db.query(models.Payment).filter(models.Payment.status == "Submitted").count()

    return {
        "total_income": float(total_approved),
        "total_expenses": float(total_expenses),
        "balance": float(total_approved) - float(total_expenses),
        "total_payments": total_payments,
        "pending_payments": pending_payments,
    }


# ── Expense Requests ─────────────────────────────────────────

class ExpenseCreate(BaseModel):
    title: str
    description: str
    amount: str
    category: Optional[str] = "General"


@router.post("/expenses")
def create_expense(data: ExpenseCreate, db: Session = Depends(get_db),
                   current_user=Depends(auth.require_finance)):
    expense = models.ExpenseRequest(
        title=data.title, description=data.description,
        amount=data.amount, category=data.category,
        requested_by=current_user.id
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    # Notify all super_admins
    super_admins = db.query(models.Member).filter(models.Member.role == "super_admin").all()
    for sa in super_admins:
        notif = models.Notification(
            user_id=sa.id,
            title="New Expense Request",
            message=f"{current_user.first_name} {current_user.last_name} submitted an expense request: {data.title} - ₦{data.amount}"
        )
        db.add(notif)
    db.commit()
    return {"id": expense.id, "message": "Expense request submitted for approval"}


@router.get("/expenses")
def list_expenses(db: Session = Depends(get_db),
                  current_user=Depends(auth.require_finance)):
    expenses = db.query(models.ExpenseRequest).order_by(models.ExpenseRequest.created_at.desc()).all()
    return [{
        "id": e.id, "title": e.title, "description": e.description,
        "amount": e.amount, "category": e.category, "status": e.status,
        "admin_note": e.admin_note,
        "requester_name": f"{e.requester.first_name} {e.requester.last_name}" if e.requester else "Unknown",
        "reviewer_name": f"{e.reviewer.first_name} {e.reviewer.last_name}" if e.reviewer else None,
        "created_at": str(e.created_at), "reviewed_at": str(e.reviewed_at) if e.reviewed_at else None,
    } for e in expenses]


@router.patch("/expenses/{expense_id}/review", dependencies=[Depends(auth.require_super_admin)])
def review_expense(expense_id: int, action: str, admin_note: str = "",
                   db: Session = Depends(get_db),
                   current_user=Depends(auth.require_super_admin)):
    if action not in ("approve", "reject"):
        raise HTTPException(status_code=400, detail="Action must be approve or reject")
    e = db.query(models.ExpenseRequest).filter(models.ExpenseRequest.id == expense_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Expense request not found")
    e.status = "Approved" if action == "approve" else "Rejected"
    e.admin_note = admin_note
    e.reviewed_by = current_user.id
    e.reviewed_at = datetime.utcnow()
    db.commit()
    # Notify the finance user who requested
    notif = models.Notification(
        user_id=e.requested_by,
        title=f"Expense {e.status}",
        message=f"Your expense request \"{e.title}\" (₦{e.amount}) has been {e.status.lower()} by {current_user.first_name} {current_user.last_name}." +
                (f" Note: {admin_note}" if admin_note else "")
    )
    db.add(notif)
    db.commit()
    return {"status": e.status}


# ── Notifications ─────────────────────────────────────────────

@router.get("/notifications")
def get_notifications(db: Session = Depends(get_db),
                      current_user=Depends(auth.get_current_user)):
    notifs = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    ).order_by(models.Notification.created_at.desc()).limit(50).all()
    return [{
        "id": n.id, "title": n.title, "message": n.message,
        "is_read": n.is_read, "created_at": str(n.created_at)
    } for n in notifs]


@router.patch("/notifications/{notif_id}/read")
def mark_read(notif_id: int, db: Session = Depends(get_db),
              current_user=Depends(auth.get_current_user)):
    n = db.query(models.Notification).filter(
        models.Notification.id == notif_id, models.Notification.user_id == current_user.id
    ).first()
    if n:
        n.is_read = True
        db.commit()
    return {"ok": True}


@router.patch("/notifications/read-all")
def mark_all_read(db: Session = Depends(get_db),
                  current_user=Depends(auth.get_current_user)):
    db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"ok": True}
