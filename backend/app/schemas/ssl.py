from datetime import datetime

from pydantic import BaseModel


class SSLCheckRequest(BaseModel):
    domain: str


class SSLCheckOut(BaseModel):
    id: int
    domain: str
    is_valid: bool
    days_left: int
    issuer: str | None = None
    subject: str | None = None
    serial_number: str | None = None
    tls_version: str | None = None
    signature_algorithm: str | None = None
    expires_at: datetime | None = None
    error: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
