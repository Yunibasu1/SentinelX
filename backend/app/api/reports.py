from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.db import get_db
from app.models.user import User
from app.services import notification_service, report_service

router = APIRouter(prefix="/reports", tags=["reports"])


def _stream(data: bytes, media_type: str) -> Response:
    return Response(
        content=data,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename=informe_sentinelx.{'pdf' if 'pdf' in media_type else ('xlsx' if 'spreadsheet' in media_type else 'csv')}"},
    )


@router.get("/csv")
def export_csv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notification_service.log_activity(db, current_user, "Descarga de informe", "Formato CSV")
    return _stream(report_service.build_csv(db, current_user), "text/csv")


@router.get("/excel")
def export_excel(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notification_service.log_activity(db, current_user, "Descarga de informe", "Formato Excel")
    return _stream(report_service.build_excel(db, current_user), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")


@router.get("/pdf")
def export_pdf(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notification_service.log_activity(db, current_user, "Descarga de informe", "Formato PDF")
    return _stream(report_service.build_pdf(db, current_user), "application/pdf")
