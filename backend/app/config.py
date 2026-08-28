"""Application configuration."""

from __future__ import annotations

import os
from datetime import timedelta
from typing import Any
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

from sqlalchemy.pool import NullPool, QueuePool


def _normalize_database_url(url: str) -> str:
    """Ensure psycopg3 driver scheme and sslmode=require."""
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://") :]
    if url.startswith("postgresql://") and "+psycopg" not in url.split("://", 1)[0]:
        url = url.replace("postgresql://", "postgresql+psycopg://", 1)

    parsed = urlparse(url)
    query = dict(parse_qsl(parsed.query, keep_blank_values=True))
    if "sslmode" not in query:
        query["sslmode"] = "require"
    return urlunparse(parsed._replace(query=urlencode(query)))


def _split_csv(value: str | None) -> list[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


class Config:
    """Base configuration loaded from environment variables."""

    SECRET_KEY: str = os.environ.get("SECRET_KEY", "dev-insecure-secret-change-me")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS: dict[str, Any] = {}

    JWT_SECRET_KEY: str = os.environ.get("JWT_SECRET_KEY", SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES: int = int(os.environ.get("JWT_ACCESS_TOKEN_EXPIRES", "900"))
    JWT_REFRESH_TOKEN_EXPIRES: int = int(os.environ.get("JWT_REFRESH_TOKEN_EXPIRES", "2592000"))
    REFRESH_ROTATION_GRACE_SECONDS: int = int(
        os.environ.get("REFRESH_ROTATION_GRACE_SECONDS", "60")
    )

    CORS_ALLOWED_ORIGINS: list[str] = _split_csv(os.environ.get("CORS_ALLOWED_ORIGINS"))
    CORS_ALLOWED_ORIGIN_REGEXES: list[str] = _split_csv(
        os.environ.get("CORS_ALLOWED_ORIGIN_REGEXES")
    )

    RATELIMIT_STORAGE_URI: str = os.environ.get("RATELIMIT_STORAGE_URI", "memory://")
    RATELIMIT_DEFAULT: str = os.environ.get("RATELIMIT_DEFAULT", "200 per minute")
    RATELIMIT_ENABLED = True

    TRUSTED_PROXY_COUNT: int = int(os.environ.get("TRUSTED_PROXY_COUNT", "1"))
    FORCE_HTTPS: bool = os.environ.get("FORCE_HTTPS", "false").lower() in ("1", "true", "yes")
    ENABLE_API_DOCS: bool = os.environ.get("ENABLE_API_DOCS", "true").lower() in (
        "1",
        "true",
        "yes",
    )

    MAX_CONTENT_LENGTH: int = int(os.environ.get("MAX_CONTENT_LENGTH", str(4 * 1024 * 1024)))
    MAX_VAULT_BYTES: int = int(os.environ.get("MAX_VAULT_BYTES", str(2 * 1024 * 1024)))

    ACCOUNT_LOCKOUT_THRESHOLD: int = int(os.environ.get("ACCOUNT_LOCKOUT_THRESHOLD", "5"))
    ACCOUNT_LOCKOUT_MINUTES: int = int(os.environ.get("ACCOUNT_LOCKOUT_MINUTES", "15"))

    ARGON2_TIME_COST: int = int(os.environ.get("ARGON2_TIME_COST", "3"))
    ARGON2_MEMORY_COST: int = int(os.environ.get("ARGON2_MEMORY_COST", "65536"))
    ARGON2_PARALLELISM: int = int(os.environ.get("ARGON2_PARALLELISM", "4"))

    LOG_LEVEL: str = os.environ.get("LOG_LEVEL", "INFO")

    DB_POOL_MODE: str = os.environ.get("DB_POOL_MODE", "auto").lower()
    EXPECTED_DATABASE_NAME: str = os.environ.get("EXPECTED_DATABASE_NAME", "vaultsync")

    TEST_SCHEMA: str = os.environ.get("TEST_SCHEMA", "vaultsync_test")

    @staticmethod
    def init_app(app: Any) -> None:
        pass

    @classmethod
    def _build_engine_options(cls, *, use_null_pool: bool) -> dict[str, Any]:
        connect_args: dict[str, Any] = {}
        if use_null_pool:
            connect_args["prepare_threshold"] = None

        options: dict[str, Any] = {"connect_args": connect_args}
        if use_null_pool:
            options["poolclass"] = NullPool
        else:
            options["poolclass"] = QueuePool
            options["pool_size"] = int(os.environ.get("DB_POOL_SIZE", "5"))
            options["max_overflow"] = int(os.environ.get("DB_MAX_OVERFLOW", "10"))
            options["pool_pre_ping"] = True
            options["pool_recycle"] = int(os.environ.get("DB_POOL_RECYCLE", "1800"))
        return options

    @classmethod
    def configure_database(cls) -> None:
        database_url = os.environ.get("DATABASE_URL")
        if not database_url:
            raise RuntimeError("DATABASE_URL environment variable is required")

        database_url = _normalize_database_url(database_url)
        cls.SQLALCHEMY_DATABASE_URI = database_url

        pool_mode = cls.DB_POOL_MODE
        is_pooled_endpoint = ":6543" in database_url or "-pooler" in database_url
        use_null_pool = pool_mode == "null" or (
            pool_mode == "auto" and (is_pooled_endpoint or os.environ.get("VERCEL"))
        )
        cls.SQLALCHEMY_ENGINE_OPTIONS = cls._build_engine_options(use_null_pool=use_null_pool)

    @classmethod
    def migration_database_uri(cls) -> str:
        url = os.environ.get("DIRECT_DATABASE_URL") or os.environ.get("DATABASE_URL")
        if not url:
            raise RuntimeError("DIRECT_DATABASE_URL or DATABASE_URL is required for migrations")
        return _normalize_database_url(url)

    @property
    def access_token_timedelta(self) -> timedelta:
        return timedelta(seconds=self.JWT_ACCESS_TOKEN_EXPIRES)

    @property
    def refresh_token_timedelta(self) -> timedelta:
        return timedelta(seconds=self.JWT_REFRESH_TOKEN_EXPIRES)

    @property
    def lockout_timedelta(self) -> timedelta:
        return timedelta(minutes=self.ACCOUNT_LOCKOUT_MINUTES)


class DevelopmentConfig(Config):
    DEBUG = True


class TestingConfig(Config):
    TESTING = True
    RATELIMIT_ENABLED = False
    ENABLE_API_DOCS = True


class ProductionConfig(Config):
    DEBUG = False


config_by_name = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}


def get_config() -> type[Config]:
    env = os.environ.get("FLASK_ENV", "development").lower()
    return config_by_name.get(env, DevelopmentConfig)
