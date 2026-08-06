from datetime import datetime

from pydantic import BaseModel, Field


class DNSAnalyzeRequest(BaseModel):
    domain: str = Field(description="Dominio a analizar, ejemplo: google.com")


class DNSRecordOut(BaseModel):
    type: str
    value: str
    priority: int | None = None


class DNSLookupOut(BaseModel):
    id: int
    domain: str
    created_at: datetime
    records: list[DNSRecordOut]

    model_config = {"from_attributes": True}


class DNSLookupSummary(BaseModel):
    id: int
    domain: str
    created_at: datetime
    record_count: int

    model_config = {"from_attributes": True}
