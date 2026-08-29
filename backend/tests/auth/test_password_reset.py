"""Password reset endpoint tests."""

from __future__ import annotations

import re
from unittest.mock import patch

import pytest
from sqlalchemy import select

from app.extensions import db
from app.models.password_reset_token import PasswordResetToken
from app.models.user import User
from tests.factories import login_payload, register_payload

pytestmark = pytest.mark.usefixtures("clean_tables")


def _register(client, email: str = "user@example.com") -> None:
    client.post("/api/v1/auth/register", json=register_payload(email))


def _request_code(client) -> str:
    code_holder: list[str] = []

    def fake_send(message):
        match = re.search(r"code is: ([A-Z0-9]{8})", message.text_body)
        assert match
        code_holder.append(match.group(1))

    with patch("app.auth.service.get_email_sender") as mock_factory:
        mock_factory.return_value.send.side_effect = fake_send
        response = client.post(
            "/api/v1/auth/forgot-password",
            json={"email": "user@example.com"},
        )
        assert response.status_code == 202
    assert len(code_holder) == 1
    return code_holder[0]


def test_forgot_password_always_202(client):
    response = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "unknown@example.com"},
    )
    assert response.status_code == 202


def test_reset_password_happy_path(client):
    _register(client)
    code = _request_code(client)

    reset = client.post(
        "/api/v1/auth/reset-password",
        json={
            "email": "user@example.com",
            "code": code,
            "new_password": "NewSecurePass2!",
        },
    )
    assert reset.status_code == 204

    login_old = client.post("/api/v1/auth/login", json=login_payload())
    assert login_old.status_code == 401

    login_new = client.post(
        "/api/v1/auth/login",
        json={"email": "user@example.com", "password": "NewSecurePass2!"},
    )
    assert login_new.status_code == 200


def test_reset_preserves_kdf(client):
    _register(client)
    me_before = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {_login_token(client)}"},
    )
    kdf_before = me_before.get_json()["user"]["kdf"]
    code = _request_code(client)

    client.post(
        "/api/v1/auth/reset-password",
        json={
            "email": "user@example.com",
            "code": code,
            "new_password": "NewSecurePass2!",
        },
    )

    login = client.post(
        "/api/v1/auth/login",
        json={"email": "user@example.com", "password": "NewSecurePass2!"},
    )
    token = login.get_json()["access_token"]
    me_after = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_after.get_json()["user"]["kdf"] == kdf_before


def _login_token(client) -> str:
    login = client.post("/api/v1/auth/login", json=login_payload())
    return login.get_json()["access_token"]


def test_reset_revokes_refresh_tokens(client):
    _register(client)
    login = client.post("/api/v1/auth/login", json=login_payload())
    old_refresh = login.get_json()["refresh_token"]
    code = _request_code(client)

    client.post(
        "/api/v1/auth/reset-password",
        json={
            "email": "user@example.com",
            "code": code,
            "new_password": "NewSecurePass2!",
        },
    )

    refreshed = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": old_refresh},
    )
    assert refreshed.status_code == 401


def test_reset_wrong_code_increments_attempts(client, app):
    _register(client)
    _request_code(client)

    bad = client.post(
        "/api/v1/auth/reset-password",
        json={
            "email": "user@example.com",
            "code": "WRONGCOD",
            "new_password": "NewSecurePass2!",
        },
    )
    assert bad.status_code == 400

    with app.app_context():
        user = db.session.scalar(select(User).where(User.email == "user@example.com"))
        token = db.session.scalar(
            select(PasswordResetToken).where(PasswordResetToken.user_id == user.id)
        )
        assert token.attempts == 1
