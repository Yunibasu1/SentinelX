from datetime import datetime

from pydantic import BaseModel


class WhoisCheckRequest(BaseModel):
    domain: str


class WhoisCheckOut(BaseModel):
    id: int
    domain: str
    registrar: str | None = None
    status: str | None = None
    creation_date: datetime | None = None
    expiration_date: datetime | None = None
    updated_date: datetime | None = None
    name_servers: str | None = None
    error: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
