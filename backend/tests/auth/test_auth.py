"""Authentication tests."""

from __future__ import annotations

import jwt
from flask import current_app

from tests.factories import STRONG_PASSWORD, login_payload, register_payload


def test_register_success(client):
    response = client.post("/api/v1/auth/register", json=register_payload())
    assert response.status_code == 201
    body = response.get_json()
    assert body["user"]["email"] == "user@example.com"
    assert "password_hash" not in body["user"]


def test_register_duplicate_email(client):
    client.post("/api/v1/auth/register", json=register_payload())
    response = client.post("/api/v1/auth/register", json=register_payload())
    assert response.status_code == 409
    assert response.get_json()["error"]["code"] == "REGISTRATION_CONFLICT"


def test_register_invalid_email(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "not-an-email", "password": STRONG_PASSWORD},
    )
    assert response.status_code == 422


def test_register_weak_password(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "weak@example.com", "password": "short"},
    )
    assert response.status_code == 422


def test_login_success(client):
    client.post("/api/v1/auth/register", json=register_payload())
    response = client.post("/api/v1/auth/login", json=login_payload())
    assert response.status_code == 200
    body = response.get_json()
    assert "access_token" in body
    assert "refresh_token" in body


def test_login_invalid_credentials(client):
    client.post("/api/v1/auth/register", json=register_payload())
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "user@example.com", "password": "WrongPass1!"},
    )
    assert response.status_code == 401
    assert response.get_json()["error"]["code"] == "INVALID_CREDENTIALS"


def test_expired_access_token(client, app):
    client.post("/api/v1/auth/register", json=register_payload())
    login = client.post("/api/v1/auth/login", json=login_payload())
    refresh = login.get_json()["refresh_token"]
    with app.app_context():
        token = jwt.encode(
            {
                "sub": "00000000-0000-0000-0000-000000000001",
                "iat": 1,
                "exp": 2,
                "jti": "test",
                "typ": "access",
                "sid": "00000000-0000-0000-0000-000000000002",
            },
            current_app.config["JWT_SECRET_KEY"],
            algorithm="HS256",
        )
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401
    assert response.get_json()["error"]["code"] == "ACCESS_TOKEN_EXPIRED"


def test_refresh_token_rotation(client):
    client.post("/api/v1/auth/register", json=register_payload())
    login = client.post("/api/v1/auth/login", json=login_payload())
    old_refresh = login.get_json()["refresh_token"]
    refreshed = client.post("/api/v1/auth/refresh", json={"refresh_token": old_refresh})
    assert refreshed.status_code == 200
    new_refresh = refreshed.get_json()["refresh_token"]
    assert new_refresh != old_refresh


def test_logout_revokes_refresh(client):
    client.post("/api/v1/auth/register", json=register_payload())
    login = client.post("/api/v1/auth/login", json=login_payload())
    access = login.get_json()["access_token"]
    refresh = login.get_json()["refresh_token"]
    response = client.post(
        "/api/v1/auth/logout",
        json={"refresh_token": refresh},
        headers={"Authorization": f"Bearer {access}"},
    )
    assert response.status_code == 204
    retry = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh})
    assert retry.status_code == 401
