"""Security-related tests."""

from __future__ import annotations

import logging

from tests.factories import login_payload, register_payload, STRONG_PASSWORD


def test_cors_preflight(client):
    response = client.options(
        "/api/v1/auth/login",
        headers={
            "Origin": "chrome-extension://abcdefghijklmnop",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Authorization, Content-Type",
        },
    )
    assert response.status_code in (200, 204)
    assert "Access-Control-Allow-Origin" in response.headers


def test_refresh_grace_window(client, app):
    client.post("/api/v1/auth/register", json=register_payload("grace@example.com"))
    login = client.post(
        "/api/v1/auth/login",
        json={"email": "grace@example.com", "password": STRONG_PASSWORD},
    )
    old_refresh = login.get_json()["refresh_token"]
    refreshed = client.post("/api/v1/auth/refresh", json={"refresh_token": old_refresh})
    assert refreshed.status_code == 200

    grace_retry = client.post("/api/v1/auth/refresh", json={"refresh_token": old_refresh})
    assert grace_retry.status_code == 200


def test_logs_do_not_contain_secrets(client, caplog):
    caplog.set_level(logging.INFO)
    client.post("/api/v1/auth/register", json=register_payload("logs@example.com"))
    client.post(
        "/api/v1/auth/login",
        json={"email": "logs@example.com", "password": STRONG_PASSWORD},
    )
    for record in caplog.records:
        assert STRONG_PASSWORD not in record.getMessage()
        assert "authorization" not in record.getMessage().lower()
