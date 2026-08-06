from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.db import get_db
from app.models.dns import DNSLookup, DNSRecord
from app.models.user import User
from app.schemas.dns import DNSAnalyzeRequest, DNSLookupOut, DNSLookupSummary
from app.services import dns_service, notification_service

router = APIRouter(prefix="/dns", tags=["dns"])


@router.post("/analyze", response_model=DNSLookupOut)
def analyze(data: DNSAnalyzeRequest, db: Session = Depends(get_db),
            current_user: User = Depends(get_current_user)):
    try:
        results = dns_service.analyze_domain(data.domain)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    lookup = DNSLookup(user_id=current_user.id, domain=data.domain.strip().lower())
    for record_type, records in results.items():
        for value, priority in records:
            lookup.records.append(
                DNSRecord(type=record_type, value=value, priority=priority)
            )

    db.add(lookup)
    db.commit()
    db.refresh(lookup)
    notification_service.log_activity(
        db, current_user, "Análisis DNS", f"Dominio {data.domain.strip().lower()}"
    )
    return lookup


@router.get("/history", response_model=list[DNSLookupSummary])
def history(db: Session = Depends(get_db),
            current_user: User = Depends(get_current_user)):
    lookups = (
        db.query(DNSLookup)
        .filter(DNSLookup.user_id == current_user.id)
        .order_by(DNSLookup.created_at.desc())
        .all()
    )
    return [
        DNSLookupSummary(
            id=lookup.id,
            domain=lookup.domain,
            created_at=lookup.created_at,
            record_count=len(lookup.records),
        )
        for lookup in lookups
    ]


@router.get("/history/{lookup_id}", response_model=DNSLookupOut)
def detail(lookup_id: int, db: Session = Depends(get_db),
           current_user: User = Depends(get_current_user)):
    lookup = (
        db.query(DNSLookup)
        .filter(DNSLookup.id == lookup_id, DNSLookup.user_id == current_user.id)
        .first()
    )
    if lookup is None:
        raise HTTPException(status_code=404, detail="Análisis no encontrado")
    return lookup
