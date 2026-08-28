"""OpenAPI specification builder."""

from __future__ import annotations

from apispec import APISpec


def build_openapi_spec() -> dict:
    spec = APISpec(
        title="VaultSync API",
        version="1.0.0",
        openapi_version="3.1.0",
        info={
            "description": (
                "Zero-knowledge password manager backend. "
                "The server stores encrypted vault blobs only."
            )
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
