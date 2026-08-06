from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.db import get_db
from app.models.hash import FileHash
from app.models.user import User
from app.schemas.hash import FileHashOut
from app.services import hash_service, notification_service

router = APIRouter(prefix="/hash", tags=["hash"])

MAX_SIZE = 50 * 1024 * 1024  # 50 MB


@router.post("/upload", response_model=FileHashOut)
async def upload(file: UploadFile = File(...), db: Session = Depends(get_db),
                 current_user: User = Depends(get_current_user)):
    data = await file.read()
    if len(data) > MAX_SIZE:
        raise HTTPException(status_code=413, detail="El archivo supera el límite de 50 MB")

    hashes = hash_service.compute_hashes(data)
    record = FileHash(
        user_id=current_user.id,
        filename=file.filename or "archivo",
        size_bytes=len(data),
        **hashes,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    notification_service.log_activity(
        db, current_user, "Hash de archivo", f"Archivo {record.filename}"
    )
    return record


@router.get("/history", response_model=list[FileHashOut])
def history(db: Session = Depends(get_db),
            current_user: User = Depends(get_current_user)):
    return (
        db.query(FileHash)
        .filter(FileHash.user_id == current_user.id)
        .order_by(FileHash.created_at.desc())
        .limit(50)
        .all()
    )


@router.get("/history/{record_id}", response_model=FileHashOut)
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
        db, current_user, "Eliminación hash", f"Consulta {record_id}"
    )
    return {"ok": True}


def _get_record(db: Session, current_user: User, record_id: int) -> FileHash:
    record = (
        db.query(FileHash)
        .filter(FileHash.id == record_id, FileHash.user_id == current_user.id)
        .first()
    )
    if record is None:
        raise HTTPException(status_code=404, detail="Consulta no encontrada")
    return record
