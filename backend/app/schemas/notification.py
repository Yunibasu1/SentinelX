from datetime import datetime

from pydantic import BaseModel


class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    kind: str
    read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ActivityLogOut(BaseModel):
    id: int
    action: str
    detail: str
    ip: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
