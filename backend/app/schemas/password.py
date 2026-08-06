from datetime import datetime

from pydantic import BaseModel


class PasswordCheckRequest(BaseModel):
    password: str


class PasswordCheckOut(BaseModel):
    id: int
    password_length: int
    entropy_bits: float
    has_lower: bool
    has_upper: bool
    has_digit: bool
    has_special: bool
    in_dictionary: bool
    crack_time_seconds: float
    score: int
    created_at: datetime

    model_config = {"from_attributes": True}
