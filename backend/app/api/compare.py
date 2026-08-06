from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.db import get_db
from app.models.dns import DNSLookup
from app.models.ssl import SSLCheck
from app.models.user import User
from app.schemas.compare import CompareDNSOut, CompareSSLOUT

router = APIRouter(prefix="/compare", tags=["compare"])


def _pick_two(items, newest_first: bool = True):
    ordered = sorted(items, key=lambda x: x.created_at, reverse=newest_first)
    if len(ordered) >= 2:
        return ordered[0], ordered[1]
    return ordered[0] if ordered else None, None


@router.get("/dns", response_model=CompareDNSOut)
def compare_dns(domain: str, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    lookups = (
        db.query(DNSLookup)
        .filter(DNSLookup.user_id == current_user.id, DNSLookup.domain == domain)
        .all()
    )
    latest, previous = _pick_two(lookups)
    if latest is None:
        raise HTTPException(status_code=404, detail="No hay análisis DNS para ese dominio")

    def record_map(lookup):
        return {(r.type, r.value): r for r in lookup.records}

    old_map = record_map(previous) if previous else {}

    added, removed = [], []
    for key in record_map(latest):
        if key not in old_map:
            added.append(key)
    if previous:
        for key in old_map:
            if key not in record_map(latest):
                removed.append(key)

    return CompareDNSOut(
        domain=domain,
        latest_at=latest.created_at,
        previous_at=previous.created_at if previous else None,
        added_records=[" ".join(k) for k in added],
        removed_records=[" ".join(k) for k in removed],
        record_count_now=len(record_map(latest)),
        record_count_before=len(old_map),
    )


@router.get("/ssl", response_model=CompareSSLOUT)
def compare_ssl(domain: str, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    checks = (
        db.query(SSLCheck)
        .filter(SSLCheck.user_id == current_user.id, SSLCheck.domain == domain)
        .all()
    )
    latest, previous = _pick_two(checks)
    if latest is None:
        raise HTTPException(status_code=404, detail="No hay análisis SSL para ese dominio")

    return CompareSSLOUT(
        domain=domain,
        latest_at=latest.created_at,
        previous_at=previous.created_at if previous else None,
        days_left_now=latest.days_left,
        days_left_before=previous.days_left if previous else None,
        expires_at_now=latest.expires_at,
        expires_at_before=previous.expires_at if previous else None,
        is_valid_now=latest.is_valid,
        is_valid_before=previous.is_valid if previous else None,
    )
