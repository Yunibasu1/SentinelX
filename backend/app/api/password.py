from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.db import get_db
from app.models.password import PasswordCheck
from app.models.user import User
from app.schemas.password import PasswordCheckOut, PasswordCheckRequest
from app.services import notification_service, password_service

router = APIRouter(prefix="/password", tags=["password"])


@router.post("/check", response_model=PasswordCheckOut)
def check(data: PasswordCheckRequest, db: Session = Depends(get_db),
          current_user: User = Depends(get_current_user)):
    result = password_service.analyze_password(data.password)
    record = PasswordCheck(user_id=current_user.id, **result)
    db.add(record)
    db.commit()
    db.refresh(record)
    notification_service.log_activity(
        db, current_user, "Análisis de contraseña", f"Score {record.score}/4"
    )
    return record


@router.get("/history", response_model=list[PasswordCheckOut])
def history(db: Session = Depends(get_db),
            current_user: User = Depends(get_current_user)):
    return (
        db.query(PasswordCheck)
        .filter(PasswordCheck.user_id == current_user.id)
        .order_by(PasswordCheck.created_at.desc())
        .limit(50)
        .all()
    )
