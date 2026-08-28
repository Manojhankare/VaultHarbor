"""Rate limiting configuration."""

from __future__ import annotations

from flask import Flask, request

from app.extensions import limiter
from app.utils.errors import RateLimitError


def register_rate_limit_handlers(app: Flask) -> None:
    @app.errorhandler(429)
    def handle_rate_limit(exc):
        if hasattr(exc, "description"):
            message = str(exc.description)
        else:
            message = "Too many requests."
        raise RateLimitError(message)


def exempt_options_from_limiter(app: Flask) -> None:
    @app.before_request
    def _skip_options():
        if request.method == "OPTIONS":
            limiter.exempt(lambda: None)()
