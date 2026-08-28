"""Device schemas."""

from __future__ import annotations

import uuid
from typing import Literal

from pydantic import BaseModel, Field


class DeviceRegisterRequest(BaseModel):
    device_name: str = Field(min_length=1, max_length=100)
    device_type: Literal["browser", "desktop", "mobile", "other"] = "browser"
    device_identifier: str = Field(min_length=8, max_length=256)


class DeviceResponse(BaseModel):
    id: uuid.UUID
    device_name: str
    device_type: str
    device_identifier: str
    last_seen_at: str | None
    created_at: str
    updated_at: str
