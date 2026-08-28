"""Device routes."""

from __future__ import annotations

import uuid

from flask import Blueprint, g, request

from app.devices import service
from app.devices.schemas import DeviceRegisterRequest
from app.security.auth import require_auth
from app.utils.responses import success_response
from app.utils.validation import parse_payload

devices_bp = Blueprint("devices", __name__, url_prefix="/api/v1/devices")


@devices_bp.post("")
@require_auth
def register_device():
    payload = parse_payload(DeviceRegisterRequest, request.get_json(silent=True))
    device = service.register_device(g.current_user.id, payload)
    return success_response({"device": device.model_dump()}, status=201)


@devices_bp.get("")
@require_auth
def list_devices():
    devices = service.list_devices(g.current_user.id)
    return success_response({"devices": [d.model_dump() for d in devices]})


@devices_bp.delete("/<uuid:device_id>")
@require_auth
def delete_device(device_id: uuid.UUID):
    service.delete_device(g.current_user.id, device_id)
    return success_response(status=204)


@devices_bp.post("/<uuid:device_id>/heartbeat")
@require_auth
def heartbeat(device_id: uuid.UUID):
    device = service.heartbeat_device(g.current_user.id, device_id)
    return success_response({"device": device.model_dump()})
