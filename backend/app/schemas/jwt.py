from datetime import datetime

from pydantic import BaseModel


class JwtInspectRequest(BaseModel):
    token: str


class JwtInspectionOut(BaseModel):
    id: int
    algorithm: str | None = None
    subject: str | None = None
    issuer: str | None = None
    audience: str | None = None
    expires_at: datetime | None = None
    issued_at: datetime | None = None
    payload_json: str | None = None
    warnings: str | None = None
    error: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
