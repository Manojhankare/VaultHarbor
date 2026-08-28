"""Device management service."""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.devices.schemas import DeviceRegisterRequest, DeviceResponse
from app.extensions import db
from app.models.device import Device, utcnow
from app.security.permissions import get_owned_device
from app.utils.errors import NotFoundError


def _to_response(device: Device) -> DeviceResponse:
    return DeviceResponse(
        id=device.id,
        device_name=device.device_name,
        device_type=device.device_type,
        device_identifier=device.device_identifier,
        last_seen_at=device.last_seen_at.isoformat() if device.last_seen_at else None,
        created_at=device.created_at.isoformat(),
        updated_at=device.updated_at.isoformat(),
    )


def register_device(user_id: uuid.UUID, payload: DeviceRegisterRequest) -> DeviceResponse:
    existing = db.session.scalar(
        select(Device).where(
            Device.user_id == user_id,
            Device.device_identifier == payload.device_identifier,
        )
    )
    if existing:
        existing.device_name = payload.device_name
        existing.device_type = payload.device_type
        existing.last_seen_at = utcnow()
        db.session.commit()
        return _to_response(existing)

    device = Device(
        user_id=user_id,
        device_name=payload.device_name,
        device_type=payload.device_type,
        device_identifier=payload.device_identifier,
        last_seen_at=utcnow(),
    )
    db.session.add(device)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        existing = db.session.scalar(
            select(Device).where(
                Device.user_id == user_id,
                Device.device_identifier == payload.device_identifier,
            )
        )
        if existing is None:
            raise
        return _to_response(existing)
    return _to_response(device)


def list_devices(user_id: uuid.UUID) -> list[DeviceResponse]:
    devices = db.session.scalars(
        select(Device).where(Device.user_id == user_id).order_by(Device.created_at.desc())
    ).all()
    return [_to_response(device) for device in devices]


def delete_device(user_id: uuid.UUID, device_id: uuid.UUID) -> None:
    device = get_owned_device(user_id, device_id)
    db.session.delete(device)
    db.session.commit()


def heartbeat_device(user_id: uuid.UUID, device_id: uuid.UUID) -> DeviceResponse:
    device = get_owned_device(user_id, device_id)
    device.last_seen_at = utcnow()
    db.session.commit()
    return _to_response(device)
