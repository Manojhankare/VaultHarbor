"""Structured logging utilities."""

from __future__ import annotations

import json
import logging
import re
import uuid
from datetime import datetime, timezone
from typing import Any

from flask import Flask, g, has_request_context, request

SENSITIVE_PATTERNS = [
    re.compile(r"authorization", re.I),
    re.compile(r"password", re.I),
    re.compile(r"token", re.I),
    re.compile(r"encrypted_vault", re.I),
    re.compile(r"wrapped_vault_key", re.I),
    re.compile(r"master_password", re.I),
    re.compile(r"refresh_token", re.I),
    re.compile(r"access_token", re.I),
]


class RedactionFilter(logging.Filter):
    """Redact sensitive substrings from log messages."""

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            for pattern in SENSITIVE_PATTERNS:
                if pattern.search(record.msg):
                    record.msg = "[REDACTED]"
                    break
        return True


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
        }
        if has_request_context():
            payload["request_id"] = getattr(g, "request_id", None)
            payload["method"] = request.method
            payload["path"] = request.path
            payload["status"] = getattr(g, "response_status", None)
            payload["latency_ms"] = getattr(g, "latency_ms", None)
            if getattr(g, "current_user_id", None):
                payload["user_id"] = str(g.current_user_id)
            if getattr(g, "current_device_id", None):
                payload["device_id"] = str(g.current_device_id)
        if record.exc_info and record.levelno >= logging.ERROR:
            payload["exc_info"] = self.formatException(record.exc_info)
        return json.dumps(payload, default=str)


def configure_logging(app: Flask) -> None:
    level = getattr(logging, app.config.get("LOG_LEVEL", "INFO").upper(), logging.INFO)
    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())
    handler.addFilter(RedactionFilter())

    root = logging.getLogger()
    root.handlers.clear()
    root.addFilter(RedactionFilter())
    root.setLevel(level)
    root.addHandler(handler)

    app.logger.handlers.clear()
    app.logger.propagate = True
    app.logger.setLevel(level)


def ensure_request_id() -> str:
    if not has_request_context():
        return str(uuid.uuid4())
    if not getattr(g, "request_id", None):
        incoming = request.headers.get("X-Request-ID")
        g.request_id = incoming or str(uuid.uuid4())
    return g.request_id
