"""Security headers middleware."""

from __future__ import annotations

from flask import Flask, request


def register_security_headers(app: Flask) -> None:
    @app.after_request
    def apply_security_headers(response):
        if request.path in ("/", "/faq", "/privacy", "/terms", "/manifest.webmanifest") or request.path.startswith(
            "/pages-static/"
        ):
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https://raw.githubusercontent.com; "
                "frame-ancestors 'none'; base-uri 'none'"
            )
        elif request.path.startswith("/api/docs"):
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
                "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
                "img-src 'self' data:; "
                "frame-ancestors 'none'; base-uri 'none'"
            )
        else:
            response.headers["Content-Security-Policy"] = (
                "default-src 'none'; frame-ancestors 'none'; base-uri 'none'"
            )
            if request.path.startswith("/api/v1/auth") or request.path.startswith("/api/v1/vault"):
                response.headers["Cache-Control"] = "no-store"

        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["X-Frame-Options"] = "DENY"

        if request.is_secure or app.config.get("FORCE_HTTPS"):
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        return response
