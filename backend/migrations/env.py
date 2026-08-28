from __future__ import annotations

import logging
from logging.config import fileConfig

from alembic import context
from flask import current_app

from app.extensions import db

config = context.config
fileConfig(config.config_file_name)
logger = logging.getLogger("alembic.env")

target_metadata = db.metadata


def get_engine_url() -> str:
    return current_app.config.get("SQLALCHEMY_DATABASE_URI") or current_app.extensions[
        "migrate"
    ].db.engine.url.render_as_string(hide_password=False)


def run_migrations_offline() -> None:
    from app.config import Config

    url = Config.migration_database_uri()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    import os

    from sqlalchemy import create_engine, event

    from app.config import Config

    connectable = create_engine(Config.migration_database_uri())
    test_schema = os.environ.get("TEST_SCHEMA")

    if test_schema:

        @event.listens_for(connectable, "connect")
        def _set_search_path(dbapi_connection, connection_record):  # noqa: ARG001
            cursor = dbapi_connection.cursor()
            cursor.execute(f'CREATE SCHEMA IF NOT EXISTS "{test_schema}"')
            cursor.execute(f'SET search_path TO "{test_schema}", public')
            cursor.close()

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
