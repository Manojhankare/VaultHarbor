"""Authorization helpers."""

from __future__ import annotations

import uuid

from sqlalchemy import select

from app.extensions import db
from app.models.device import Device
from app.utils.errors import NotFoundError


def get_owned_device(user_id: uuid.UUID, device_id: uuid.UUID) -> Device:
    device = db.session.scalar(
        select(Device).where(Device.id == device_id, Device.user_id == user_id)
    )
    if device is None:
        raise NotFoundError("Device not found.")
    return device
