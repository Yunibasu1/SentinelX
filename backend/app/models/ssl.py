from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.db import Base


class SSLCheck(Base):
    __tablename__ = "ssl_checks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    domain: Mapped[str] = mapped_column(String(255), nullable=False)
    is_valid: Mapped[bool] = mapped_column(Boolean, default=False)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime, default=None)
    days_left: Mapped[int] = mapped_column(Integer, default=0)
    issuer: Mapped[str | None] = mapped_column(String(512), default=None)
    subject: Mapped[str | None] = mapped_column(String(512), default=None)
    serial_number: Mapped[str | None] = mapped_column(String(255), default=None)
    tls_version: Mapped[str | None] = mapped_column(String(50), default=None)
    signature_algorithm: Mapped[str | None] = mapped_column(String(100), default=None)
    error: Mapped[str | None] = mapped_column(Text, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
