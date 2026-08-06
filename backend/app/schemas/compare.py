from datetime import datetime

from pydantic import BaseModel


class CompareDNSOut(BaseModel):
    domain: str
    latest_at: datetime
    previous_at: datetime | None = None
    added_records: list[str] = []
    removed_records: list[str] = []
    record_count_now: int
    record_count_before: int


class CompareSSLOUT(BaseModel):
    domain: str
    latest_at: datetime
    previous_at: datetime | None = None
    days_left_now: int | None = None
    days_left_before: int | None = None
    expires_at_now: datetime | None = None
    expires_at_before: datetime | None = None
    is_valid_now: bool | None = None
    is_valid_before: bool | None = None
