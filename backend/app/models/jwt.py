import base64
import json
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.db import Base


class JwtInspection(Base):
    __tablename__ = "jwt_inspections"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    algorithm: Mapped[str | None] = mapped_column(String(50), default=None)
    subject: Mapped[str | None] = mapped_column(String(255), default=None)
    issuer: Mapped[str | None] = mapped_column(String(255), default=None)
    audience: Mapped[str | None] = mapped_column(String(255), default=None)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime, default=None)
    issued_at: Mapped[datetime | None] = mapped_column(DateTime, default=None)
    payload_json: Mapped[str | None] = mapped_column(Text, default=None)
    warnings: Mapped[str | None] = mapped_column(Text, default=None)
    error: Mapped[str | None] = mapped_column(Text, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
