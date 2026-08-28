"""Health check routes."""

from __future__ import annotations

from flask import Blueprint
from sqlalchemy import text

from app.extensions import db
from app.meta import AUTHOR_CREDIT, AUTHOR_NAME, AUTHOR_SITE
from app.utils.logging import ensure_request_id
from app.utils.responses import error_response, success_response

health_bp = Blueprint("health", __name__)


@health_bp.get("/health")
def health():
    return success_response(
        {
            "status": "ok",
            "author": AUTHOR_NAME,
            "website": AUTHOR_SITE,
            "credit": AUTHOR_CREDIT,
        }
    )


@health_bp.get("/health/db")
def health_db():
    try:
        db.session.execute(text("SELECT 1"))
        return success_response({"status": "ok", "database": "connected"})
    except Exception:
        return error_response(
            code="DATABASE_UNAVAILABLE",
            message="Database connection failed.",
            status=503,
            request_id=ensure_request_id(),
        )
