from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.db import get_db
from app.models.user import User
from app.models.whois import WhoisCheck
from app.schemas.whois import WhoisCheckOut, WhoisCheckRequest
from app.services import whois_service

router = APIRouter(prefix="/whois", tags=["whois"])


@router.post("/check", response_model=WhoisCheckOut)
def check(data: WhoisCheckRequest, db: Session = Depends(get_db),
          current_user: User = Depends(get_current_user)):
    result = whois_service.check_whois(data.domain)

    record = WhoisCheck(user_id=current_user.id, **result)
    db.add(record)
    db.commit()
    db.refresh(record)
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
