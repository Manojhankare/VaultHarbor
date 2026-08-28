"""Flask application factory for VaultSync.

Author: Manoj Hankare — https://manojhankare.in
"""

from __future__ import annotations

import re
import time

from flask import Flask, g, request
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.exceptions import HTTPException
from werkzeug.middleware.proxy_fix import ProxyFix

from app.auth import auth_bp
from app.config import get_config
from app.devices import devices_bp
from app.docs import docs_bp
from app.extensions import cors, db, limiter, migrate
from app.health import health_bp
from app.security.auth import AccessTokenExpiredError, AccessTokenInvalidError
from app.security.headers import register_security_headers
from app.security.rate_limit import register_rate_limit_handlers
from app.sync import sync_bp
from app.utils.errors import AppError
from app.utils.logging import configure_logging, ensure_request_id
from app.utils.responses import error_response
from app.vault import vault_bp


def register_error_handlers(app: Flask) -> None:
    @app.errorhandler(AppError)
    def handle_app_error(exc: AppError):
        request_id = ensure_request_id()
        response = error_response(
            code=exc.code,
            message=exc.message,
            status=exc.status_code,
            request_id=request_id,
            details=exc.details,
        )
        if isinstance(exc, (AccessTokenExpiredError, AccessTokenInvalidError)):
            response.headers["WWW-Authenticate"] = 'Bearer error="invalid_token"'
        if exc.status_code == 429 and exc.details and "retry_after_seconds" in exc.details:
            response.headers["Retry-After"] = str(exc.details["retry_after_seconds"])
        return response

    @app.errorhandler(HTTPException)
    def handle_http_exception(exc: HTTPException):
        request_id = ensure_request_id()
        code = exc.name.upper().replace(" ", "_") if exc.name else "HTTP_ERROR"
        return error_response(
            code=code,
            message=exc.description or "HTTP error.",
            status=exc.code or 500,
            request_id=request_id,
        )

    @app.errorhandler(SQLAlchemyError)
    def handle_db_error(exc: SQLAlchemyError):
        db.session.rollback()
        app.logger.exception("Database error")
        request_id = ensure_request_id()
        return error_response(
            code="INTERNAL_ERROR",
            message="An internal error occurred.",
            status=500,
            request_id=request_id,
        )

    @app.errorhandler(Exception)
    def handle_unexpected(exc: Exception):
        app.logger.exception("Unhandled exception")
        request_id = ensure_request_id()
        return error_response(
            code="INTERNAL_ERROR",
            message="An internal error occurred.",
            status=500,
            request_id=request_id,
        )


def register_request_hooks(app: Flask) -> None:
    @app.before_request
    def _before_request():
        g.request_start = time.perf_counter()
        ensure_request_id()

    @app.after_request
    def _after_request(response):
        g.response_status = response.status_code
        if hasattr(g, "request_start"):
            g.latency_ms = round((time.perf_counter() - g.request_start) * 1000, 2)
        response.headers["X-Request-ID"] = ensure_request_id()
        return response


def _load_dotenv() -> None:
    try:
        from dotenv import load_dotenv

        load_dotenv()
    except ImportError:
        pass


def create_app(config_name: str | None = None) -> Flask:
    _load_dotenv()

    from app.config import DevelopmentConfig, config_by_name

    if config_name:
        config_class = config_by_name.get(config_name, DevelopmentConfig)
    else:
        config_class = get_config()

    config_class.configure_database()

    app = Flask(__name__)
    app.config.from_object(config_class)
    config_class.init_app(app)

    if app.config.get("TRUSTED_PROXY_COUNT", 0) > 0:
        app.wsgi_app = ProxyFix(
            app.wsgi_app,
            x_for=app.config["TRUSTED_PROXY_COUNT"],
            x_proto=1,
            x_host=1,
        )

    configure_logging(app)
    db.init_app(app)
    migrate.init_app(app, db)
    limiter.init_app(app)
    if app.config.get("RATELIMIT_DEFAULT"):
        limiter.default_limits = [app.config["RATELIMIT_DEFAULT"]]

    cors_origins: list[str | re.Pattern[str]] = list(
        app.config.get("CORS_ALLOWED_ORIGINS") or []
    )
    for pattern in app.config.get("CORS_ALLOWED_ORIGIN_REGEXES") or []:
        cors_origins.append(re.compile(pattern))

    cors.init_app(
        app,
        resources={
            r"/api/*": {
                "origins": cors_origins,
                "supports_credentials": False,
                "allow_headers": ["Authorization", "Content-Type", "If-None-Match"],
                "expose_headers": ["ETag", "X-Request-ID"],
                "max_age": 86400,
            }
        },
    )

    register_error_handlers(app)
    register_request_hooks(app)
    register_security_headers(app)
    register_rate_limit_handlers(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(devices_bp)
    app.register_blueprint(vault_bp)
    app.register_blueprint(sync_bp)
    app.register_blueprint(health_bp)
    app.register_blueprint(docs_bp)

    @app.cli.command("purge-expired-tokens")
    def purge_expired_tokens_cmd():
        from app.auth.service import purge_expired_tokens

        count = purge_expired_tokens()
        print(f"Purged {count} expired refresh tokens.")

    return app
