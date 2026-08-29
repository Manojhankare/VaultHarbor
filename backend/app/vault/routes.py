"""Vault routes."""

from __future__ import annotations

from flask import Blueprint, g, make_response, request

from app.extensions import limiter
from app.security.auth import require_auth
from app.utils.errors import VaultNotFoundError
from app.utils.responses import success_response
from app.utils.validation import parse_payload
from app.vault import service
from app.vault.schemas import VaultDeleteRequest, VaultPutRequest

vault_bp = Blueprint("vault", __name__, url_prefix="/api/v1/vault")


@vault_bp.get("")
@require_auth
@limiter.limit("120 per minute")
def get_vault():
    try:
        vault = service.get_vault(g.current_user.id)
    except VaultNotFoundError:
        raise
    etag = service.compute_etag(vault)
    if request.headers.get("If-None-Match") == etag:
        response = make_response("", 304)
        response.headers["ETag"] = etag
        return response
    response = success_response({"vault": service.vault_to_response(vault).model_dump()})
    response.headers["ETag"] = etag
    return response


@vault_bp.put("")
@require_auth
@limiter.limit("60 per minute")
def put_vault():
    payload = parse_payload(VaultPutRequest, request.get_json(silent=True))
    vault, created = service.upsert_vault(g.current_user.id, payload)
    return success_response({"vault": vault.model_dump()}, status=201 if created else 200)


@vault_bp.delete("")
@require_auth
@limiter.limit("5 per minute")
def delete_vault():
    payload = parse_payload(VaultDeleteRequest, request.get_json(silent=True))
    service.delete_vault(g.current_user.id, payload)
    return success_response(status=204)
