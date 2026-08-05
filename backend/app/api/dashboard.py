from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


class DashboardStats(BaseModel):
    servers: int
    domains: int
    ssl_expiring: int
    alerts: int
    last_scan: str


@router.get("/stats", response_model=DashboardStats)
def get_stats(current_user: User = Depends(get_current_user)):
    return DashboardStats(
        servers=0,
        domains=0,
        ssl_expiring=0,
        alerts=0,
        last_scan="Sin escaneos todavía",
    )
