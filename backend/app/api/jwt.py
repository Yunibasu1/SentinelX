from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.db import get_db
from app.models.jwt import JwtInspection
from app.models.user import User
from app.schemas.jwt import JwtInspectionOut, JwtInspectRequest
from app.services import jwt_service, notification_service

router = APIRouter(prefix="/jwt", tags=["jwt"])


@router.post("/inspect", response_model=JwtInspectionOut)
def inspect(data: JwtInspectRequest, db: Session = Depends(get_db),
            current_user: User = Depends(get_current_user)):
    try:
        result = jwt_service.inspect_token(data.token)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    record = JwtInspection(user_id=current_user.id, **result)
    db.add(record)
    db.commit()
    db.refresh(record)
    notification_service.log_activity(db, current_user, "Inspección JWT", f"Algoritmo {record.algorithm}")
    return record


@router.get("/history", response_model=list[JwtInspectionOut])
def history(db: Session = Depends(get_db),
            current_user: User = Depends(get_current_user)):
    return (
        db.query(JwtInspection)
        .filter(JwtInspection.user_id == current_user.id)
        .order_by(JwtInspection.created_at.desc())
        .limit(50)
        .all()
    )


@router.get("/history/{record_id}", response_model=JwtInspectionOut)
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
        db, current_user, "Eliminación JWT", f"Consulta {record_id}"
    )
    return {"ok": True}


def _get_record(db: Session, current_user: User, record_id: int) -> JwtInspection:
    record = (
        db.query(JwtInspection)
        .filter(JwtInspection.id == record_id, JwtInspection.user_id == current_user.id)
        .first()
    )
    if record is None:
        raise HTTPException(status_code=404, detail="Consulta no encontrada")
    return record
