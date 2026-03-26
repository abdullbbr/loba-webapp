from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models, auth

router = APIRouter(prefix="/api/messages", tags=["Messages"])

class MessageCreate(BaseModel):
    subject: str
    body: str
    recipient_filter: Optional[str] = "all"

@router.post("/broadcast", dependencies=[Depends(auth.require_admin)])
def broadcast_message(data: MessageCreate, db: Session = Depends(get_db),
                      current_user=Depends(auth.get_current_user)):
    msg = models.Message(subject=data.subject, body=data.body,
                         sender_id=current_user.id,
                         recipient_filter=data.recipient_filter)
    db.add(msg)
    db.commit()
    q = db.query(models.Member)
    if data.recipient_filter == "active":
        q = q.filter(models.Member.is_active == True)
    elif data.recipient_filter == "inactive":
        q = q.filter(models.Member.is_active == False)
    count = q.count()
    return {"message": f"Message broadcast to {count} members", "sent_to": count}

@router.get("/", dependencies=[Depends(auth.require_admin)])
def list_messages(db: Session = Depends(get_db)):
    msgs = db.query(models.Message).order_by(models.Message.sent_at.desc()).all()
    return [{"id": m.id, "subject": m.subject, "body": m.body,
             "recipient_filter": m.recipient_filter, "sent_at": str(m.sent_at),
             "sender_name": (m.sender.first_name + " " + m.sender.last_name) if m.sender else "System"}
            for m in msgs]


@router.get("/inbox")
def member_inbox(db: Session = Depends(get_db),
                 current_user: models.Member = Depends(auth.get_current_user)):
    q = db.query(models.Message)
    if current_user.is_active:
        q = q.filter(models.Message.recipient_filter.in_(["all", "active"]))
    else:
        q = q.filter(models.Message.recipient_filter.in_(["all", "inactive"]))
    msgs = q.order_by(models.Message.sent_at.desc()).all()
    return [{"id": m.id, "subject": m.subject, "body": m.body,
             "sent_at": str(m.sent_at),
             "sender_name": (m.sender.first_name + " " + m.sender.last_name) if m.sender else "System"}
            for m in msgs]

@router.get("/stats", dependencies=[Depends(auth.require_admin)])
def stats(db: Session = Depends(get_db)):
    total = db.query(models.Member).count()
    active = db.query(models.Member).filter(models.Member.is_active == True).count()
    pending_payments = db.query(models.Payment).filter(models.Payment.status == "Submitted").count()
    announcements = db.query(models.Announcement).count()
    messages_sent = db.query(models.Message).count()
    return {
        "total_members": total,
        "active_members": active,
        "inactive_members": total - active,
        "pending_payments": pending_payments,
        "total_announcements": announcements,
        "total_broadcasts": messages_sent,
    }
