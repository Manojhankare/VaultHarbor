"""OpenAPI specification builder."""

from __future__ import annotations

from apispec import APISpec


from app.meta import AUTHOR_NAME, AUTHOR_SITE


def build_openapi_spec() -> dict:
    spec = APISpec(
        title="VaultSync API",
        version="1.0.0",
        openapi_version="3.1.0",
        info={
            "description": (
                "Zero-knowledge password manager backend. "
                "The server stores encrypted vault blobs only. "
                f"Made by {AUTHOR_NAME} — {AUTHOR_SITE}"
            ),
            "contact": {
                "name": AUTHOR_NAME,
                "url": AUTHOR_SITE,
            },
        },
        servers=[{"url": "/"}],
    )

    spec.path(
        path="/api/v1/auth/register",
        operations={
            "post": {
                "summary": "Register a new account",
                "tags": ["auth"],
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "required": ["email", "password"],
                                "properties": {
                                    "email": {"type": "string", "format": "email"},
                                    "password": {"type": "string", "minLength": 12},
                                },
                            }
                        }
                    },
                },
                "responses": {
                    "201": {"description": "Created"},
                    "409": {"description": "Registration conflict"},
                    "422": {"description": "Validation error"},
                },
            }
        },
    )

    spec.path(
        path="/api/v1/auth/login",
        operations={
            "post": {
                "summary": "Login",
                "tags": ["auth"],
                "responses": {"200": {"description": "Tokens issued"}},
            }
        },
    )

    spec.path(
        path="/api/v1/auth/forgot-password",
        operations={
            "post": {
                "summary": "Request password reset code",
                "tags": ["auth"],
                "responses": {"202": {"description": "Accepted"}},
            }
        },
    )

    spec.path(
        path="/api/v1/auth/reset-password",
        operations={
            "post": {
                "summary": "Reset account password with email code",
                "tags": ["auth"],
                "responses": {"204": {"description": "Password reset"}},
            }
        },
    )

    spec.path(
        path="/api/v1/vault",
        operations={
            "get": {
                "summary": "Get encrypted vault",
                "tags": ["vault"],
                "security": [{"bearerAuth": []}],
                "responses": {
                    "200": {"description": "Vault returned"},
                    "304": {"description": "Not modified"},
                    "404": {"description": "Vault not found"},
                },
            },
            "put": {
                "summary": "Create or update encrypted vault",
                "tags": ["vault"],
                "security": [{"bearerAuth": []}],
                "responses": {
                    "200": {"description": "Updated"},
                    "201": {"description": "Created"},
                    "409": {"description": "Revision conflict"},
                },
            },
            "delete": {
                "summary": "Delete vault (destructive reset)",
                "tags": ["vault"],
                "security": [{"bearerAuth": []}],
                "responses": {"204": {"description": "Vault deleted"}},
            },
        },
    )

    spec.path(
        path="/api/v1/sync",
        operations={
            "get": {
                "summary": "Get sync metadata",
                "tags": ["sync"],
                "security": [{"bearerAuth": []}],
                "parameters": [
                    {"name": "since_revision", "in": "query", "schema": {"type": "integer"}},
                    {"name": "limit", "in": "query", "schema": {"type": "integer"}},
                ],
                "responses": {"200": {"description": "Sync state"}},
            }
        },
    )

    spec.components.security_scheme(
        "bearerAuth",
        {"type": "http", "scheme": "bearer", "bearerFormat": "JWT"},
    )
    return spec.to_dict()
