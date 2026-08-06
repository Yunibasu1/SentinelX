from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.db import Base


class PasswordCheck(Base):
    __tablename__ = "password_checks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    password_length: Mapped[int] = mapped_column(Integer)
    entropy_bits: Mapped[float] = mapped_column(default=0)
    has_lower: Mapped[bool] = mapped_column(Boolean, default=False)
    has_upper: Mapped[bool] = mapped_column(Boolean, default=False)
    has_digit: Mapped[bool] = mapped_column(Boolean, default=False)
    has_special: Mapped[bool] = mapped_column(Boolean, default=False)
    in_dictionary: Mapped[bool] = mapped_column(Boolean, default=False)
    crack_time_seconds: Mapped[float] = mapped_column(default=0)
    score: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
