from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.db import get_db
from app.models.jwt import JwtInspection
from app.models.user import User
from app.schemas.jwt import JwtInspectionOut, JwtInspectRequest
from app.services import jwt_service

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
