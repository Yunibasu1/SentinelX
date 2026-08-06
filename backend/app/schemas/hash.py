from datetime import datetime

from pydantic import BaseModel


class FileHashOut(BaseModel):
    id: int
    filename: str
    sha256: str
    sha512: str
    md5: str
    size_bytes: int
    created_at: datetime

    model_config = {"from_attributes": True}
