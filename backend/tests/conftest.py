"""Pytest configuration and fixtures."""

from __future__ import annotations

import os
from collections.abc import Generator

import pytest
from dotenv import load_dotenv
from flask import Flask
from flask.testing import FlaskClient
from sqlalchemy import create_engine, event, text

load_dotenv()

from app import create_app
from app.config import _normalize_database_url
from app.extensions import db
from app.utils.db import create_schema, drop_schema


def _resolve_direct_database_url() -> str:
    primary = os.environ.get("DIRECT_DATABASE_URL")
    fallback = os.environ.get("DIRECT_DATABASE_URL_FALLBACK")
    for candidate in (primary, fallback):
        if not candidate:
            continue
        url = _normalize_database_url(candidate)
        engine = create_engine(url, pool_pre_ping=True)
        try:
            with engine.connect() as conn:
                name = conn.execute(text("SELECT current_database()")).scalar_one()
                if name != os.environ.get("EXPECTED_DATABASE_NAME", "vaultharbor"):
                    raise RuntimeError(f"Unexpected database {name}")
            return url
        except Exception:
            continue
    raise RuntimeError("Could not connect using DIRECT_DATABASE_URL or fallback.")


def _run_migrations(database_url: str, schema: str) -> None:
    os.environ["DATABASE_URL"] = database_url
    os.environ["TEST_SCHEMA"] = schema

    from app.utils.db import create_schema

    engine = create_engine(database_url)
    create_schema(engine, schema)
    engine.dispose()

    app = create_app("testing")

    with app.app_context():
        from flask_migrate import upgrade

        upgrade()


@pytest.fixture(scope="session")
def direct_database_url() -> str:
    return _resolve_direct_database_url()


@pytest.fixture(scope="session")
def app(direct_database_url: str) -> Generator[Flask, None, None]:
    os.environ["FLASK_ENV"] = "testing"
    os.environ["DATABASE_URL"] = direct_database_url
    schema = os.environ.get("TEST_SCHEMA", "vaultharbor_test")

    _run_migrations(direct_database_url, schema)

    application = create_app("testing")
    application.config["SQLALCHEMY_DATABASE_URI"] = direct_database_url
    application.config["TEST_SCHEMA"] = schema

    with application.app_context():

        @event.listens_for(db.engine, "connect")
        def _set_search_path(dbapi_connection, connection_record):  # noqa: ARG001
            cursor = dbapi_connection.cursor()
            cursor.execute(f'SET search_path TO "{schema}", public')
            cursor.close()

    yield application

    drop_schema(create_engine(direct_database_url), schema)


@pytest.fixture(autouse=True)
def clean_tables(app: Flask) -> Generator[None, None, None]:
    with app.app_context():
        for table in reversed(db.metadata.sorted_tables):
            db.session.execute(table.delete())
        db.session.commit()
    yield


@pytest.fixture()
def client(app: Flask) -> FlaskClient:
    return app.test_client()


@pytest.fixture()
def auth_headers(client: FlaskClient) -> dict[str, str]:
    password = "SecurePass1!"
    client.post(
        "/api/v1/auth/register",
        json={"email": "user@example.com", "password": password},
    )
    login = client.post(
        "/api/v1/auth/login",
        json={"email": "user@example.com", "password": password},
    )
    token = login.get_json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
