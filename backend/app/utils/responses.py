"""JSON response helpers."""

from __future__ import annotations

from typing import Any

from flask import jsonify, make_response


def success_response(data: dict[str, Any] | None = None, *, status: int = 200):
    payload: dict[str, Any] = data or {}
    return make_response(jsonify(payload), status)


def error_response(
    *,
    code: str,
    message: str,
    status: int,
    request_id: str | None = None,
    details: dict[str, Any] | None = None,
):
    body: dict[str, Any] = {
        "error": {
            "code": code,
            "message": message,
        }
    }
    if details:
        body["error"]["details"] = details
    if request_id:
        body["request_id"] = request_id
    return make_response(jsonify(body), status)
