from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.db import Base


class WhoisCheck(Base):
    __tablename__ = "whois_checks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    domain: Mapped[str] = mapped_column(String(255), nullable=False)
    registrar: Mapped[str | None] = mapped_column(String(255), default=None)
    status: Mapped[str | None] = mapped_column(String(255), default=None)
    creation_date: Mapped[datetime | None] = mapped_column(DateTime, default=None)
    expiration_date: Mapped[datetime | None] = mapped_column(DateTime, default=None)
    updated_date: Mapped[datetime | None] = mapped_column(DateTime, default=None)
    name_servers: Mapped[str | None] = mapped_column(Text, default=None)
    error: Mapped[str | None] = mapped_column(Text, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
