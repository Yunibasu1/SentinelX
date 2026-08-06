from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.db import get_db
from app.models.ssl import SSLCheck
from app.models.user import User
from app.schemas.ssl import SSLCheckOut, SSLCheckRequest
from app.services import notification_service, ssl_service

router = APIRouter(prefix="/ssl", tags=["ssl"])


@router.post("/check", response_model=SSLCheckOut)
def check(data: SSLCheckRequest, db: Session = Depends(get_db),
          current_user: User = Depends(get_current_user)):
    result = ssl_service.check_ssl(data.domain)

    record = SSLCheck(user_id=current_user.id, **result)
    db.add(record)
    db.commit()
    db.refresh(record)
    notification_service.log_activity(
        db, current_user, "Comprobación SSL", f"Dominio {data.domain.strip().lower()}"
    )
    return record


@router.get("/history", response_model=list[SSLCheckOut])
def history(db: Session = Depends(get_db),
            current_user: User = Depends(get_current_user)):
    return (
        db.query(SSLCheck)
        .filter(SSLCheck.user_id == current_user.id)
        .order_by(SSLCheck.created_at.desc())
        .limit(50)
        .all()
    )


@router.get("/history/{record_id}", response_model=SSLCheckOut)
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
        db, current_user, "Eliminación SSL", f"Consulta {record_id}"
    )
    return {"ok": True}


def _get_record(db: Session, current_user: User, record_id: int) -> SSLCheck:
    record = (
        db.query(SSLCheck)
        .filter(SSLCheck.id == record_id, SSLCheck.user_id == current_user.id)
        .first()
    )
    if record is None:
        raise HTTPException(status_code=404, detail="Consulta no encontrada")
    return record
