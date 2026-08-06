from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.db import get_db
from app.models.notification import ActivityLog, Notification
from app.models.user import User
from app.schemas.notification import ActivityLogOut, NotificationOut
from app.services import notification_service

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationOut])
def list_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )


@router.get("/unread-count", response_model=int)
def unread_count(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id, Notification.read.is_(False))
        .count()
    )


@router.post("/{notification_id}/read", response_model=NotificationOut)
def mark_read(notification_id: int, db: Session = Depends(get_db),
              current_user: User = Depends(get_current_user)):
    record = db.get(Notification, notification_id)
    if not record or record.user_id != current_user.id:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    record.read = True
    db.commit()
    db.refresh(record)
    return record


@router.get("/logs", response_model=list[ActivityLogOut])
def list_logs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(ActivityLog)
        .filter(ActivityLog.user_id == current_user.id)
        .order_by(ActivityLog.created_at.desc())
        .limit(100)
        .all()
    )


@router.get("/check-certs")
def check_certs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notification_service.check_expiring_certs(db, current_user)
    return {"ok": True}
