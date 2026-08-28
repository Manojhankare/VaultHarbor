"""Sync routes."""

from __future__ import annotations

from flask import Blueprint, g, request

from app.extensions import limiter
from app.security.auth import require_auth
from app.sync import service
from app.utils.responses import success_response

sync_bp = Blueprint("sync", __name__, url_prefix="/api/v1/sync")


@sync_bp.get("")
@require_auth
@limiter.limit("120 per minute")
def get_sync():
    since_revision = request.args.get("since_revision", type=int)
    limit = request.args.get("limit", default=50, type=int)
    state = service.get_sync_state(g.current_user.id, since_revision=since_revision, limit=limit)
    return success_response(state.model_dump())
