from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.db import get_db
from app.models.user import User
from app.models.whois import WhoisCheck
from app.schemas.whois import WhoisCheckOut, WhoisCheckRequest
from app.services import notification_service, whois_service

router = APIRouter(prefix="/whois", tags=["whois"])


@router.post("/check", response_model=WhoisCheckOut)
def check(data: WhoisCheckRequest, db: Session = Depends(get_db),
          current_user: User = Depends(get_current_user)):
    result = whois_service.check_whois(data.domain)

    record = WhoisCheck(user_id=current_user.id, **result)
    db.add(record)
    db.commit()
    db.refresh(record)
    notification_service.log_activity(
        db, current_user, "Consulta WHOIS", f"Dominio {data.domain.strip().lower()}"
    )
    return record


@router.get("/history", response_model=list[WhoisCheckOut])
def history(db: Session = Depends(get_db),
            current_user: User = Depends(get_current_user)):
    return (
        db.query(WhoisCheck)
        .filter(WhoisCheck.user_id == current_user.id)
        .order_by(WhoisCheck.created_at.desc())
        .limit(50)
        .all()
    )


@router.get("/history/{record_id}", response_model=WhoisCheckOut)
def detail(record_id: int, db: Session = Depends(get_db),
           current_user: User = Depends(get_current_user)):
    record = _get_record(db, current_user, record_id)
    return record


@router.delete("/history/{record_id}")
def delete(record_id: int, db: Session = Depends(get_db),
           current_user: User = Depends(get_current_user)):
    record = _get_record(db, current_user, record_id)
    db.delete(record)
    db.commit()
    notification_service.log_activity(
        db, current_user, "Eliminación WHOIS", f"Consulta {record_id}"
    )
    return {"ok": True}


def _get_record(db: Session, current_user: User, record_id: int) -> WhoisCheck:
    record = (
        db.query(WhoisCheck)
        .filter(WhoisCheck.id == record_id, WhoisCheck.user_id == current_user.id)
        .first()
    )
    if record is None:
        raise HTTPException(status_code=404, detail="Consulta no encontrada")
    return record
