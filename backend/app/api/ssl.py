from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.db import get_db
from app.models.ssl import SSLCheck
from app.models.user import User
from app.schemas.ssl import SSLCheckOut, SSLCheckRequest
from app.services import ssl_service

router = APIRouter(prefix="/ssl", tags=["ssl"])


@router.post("/check", response_model=SSLCheckOut)
def check(data: SSLCheckRequest, db: Session = Depends(get_db),
          current_user: User = Depends(get_current_user)):
    result = ssl_service.check_ssl(data.domain)

    record = SSLCheck(user_id=current_user.id, **result)
    db.add(record)
    db.commit()
    db.refresh(record)
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
