"""Database helpers."""

from __future__ import annotations

from sqlalchemy import text
from sqlalchemy.engine import Engine

from app.extensions import db


def assert_database_name(expected: str) -> None:
    result = db.session.execute(text("SELECT current_database()")).scalar_one()
    if result != expected:
        raise RuntimeError(
            f"Connected to database {result!r}, expected {expected!r}. "
            "Check DATABASE_URL / DIRECT_DATABASE_URL."
        )


def create_schema(engine: Engine, schema_name: str) -> None:
    with engine.begin() as conn:
        conn.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{schema_name}"'))


def drop_schema(engine: Engine, schema_name: str) -> None:
    with engine.begin() as conn:
        conn.execute(text(f'DROP SCHEMA IF EXISTS "{schema_name}" CASCADE'))
