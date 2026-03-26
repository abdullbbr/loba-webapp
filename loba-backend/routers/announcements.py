from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models, auth

router = APIRouter(prefix="/api/announcements", tags=["Announcements"])


class AnnouncementCreate(BaseModel):
    title: str
    content: str
    category: Optional[str] = "General"
    is_pinned: Optional[bool] = False


@router.get("/")
def list_announcements(db: Session = Depends(get_db), skip: int = 0, limit: int = 20):
    announcements = db.query(models.Announcement).order_by(
        models.Announcement.is_pinned.desc(),
        models.Announcement.created_at.desc()
    ).offset(skip).limit(limit).all()
    return [{"id": a.id, "title": a.title, "content": a.content, "category": a.category,
             "is_pinned": a.is_pinned, "created_at": str(a.created_at),
             "author_name": f"{a.author.first_name} {a.author.last_name}" if a.author else "Admin"}
            for a in announcements]


@router.post("/", dependencies=[Depends(auth.require_admin)])
def create_announcement(data: AnnouncementCreate, db: Session = Depends(get_db),
                        current_user=Depends(auth.require_admin)):
    a = models.Announcement(title=data.title, content=data.content,
                             category=data.category, is_pinned=data.is_pinned,
                             author_id=current_user.id)
    db.add(a)
    db.commit()
    db.refresh(a)
    return {"id": a.id, "title": a.title, "message": "Announcement created"}


@router.put("/{ann_id}", dependencies=[Depends(auth.require_admin)])
def update_announcement(ann_id: int, data: AnnouncementCreate, db: Session = Depends(get_db)):
    a = db.query(models.Announcement).filter(models.Announcement.id == ann_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Not found")
    a.title = data.title
    a.content = data.content
    a.category = data.category
    a.is_pinned = data.is_pinned
    db.commit()
    return {"message": "Updated"}


@router.delete("/{ann_id}", dependencies=[Depends(auth.require_admin)])
def delete_announcement(ann_id: int, db: Session = Depends(get_db)):
    a = db.query(models.Announcement).filter(models.Announcement.id == ann_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(a)
    db.commit()
    return {"message": "Deleted"}
