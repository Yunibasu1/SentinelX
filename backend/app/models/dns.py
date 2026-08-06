from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.db import Base


class DNSLookup(Base):
    __tablename__ = "dns_lookups"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    domain: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    records: Mapped[list["DNSRecord"]] = relationship(
        back_populates="lookup", cascade="all, delete-orphan"
    )


class DNSRecord(Base):
    __tablename__ = "dns_records"

    id: Mapped[int] = mapped_column(primary_key=True)
    lookup_id: Mapped[int] = mapped_column(ForeignKey("dns_lookups.id"), index=True)
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    value: Mapped[str] = mapped_column(String(512), nullable=False)
    priority: Mapped[int | None] = mapped_column(default=None)

    lookup: Mapped[DNSLookup] = relationship(back_populates="records")
