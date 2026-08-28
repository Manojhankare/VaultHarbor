"""Synchronization tests."""

from __future__ import annotations

from tests.factories import register_payload, STRONG_PASSWORD, vault_payload


def _auth(client, email: str) -> str:
    client.post("/api/v1/auth/register", json=register_payload(email))
    login = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": STRONG_PASSWORD},
    )
    return login.get_json()["access_token"]


def test_sync_reports_revision(client):
    token = _auth(client, "sync@example.com")
    client.put("/api/v1/vault", json=vault_payload(), headers={"Authorization": f"Bearer {token}"})
    client.put(
        "/api/v1/vault",
        json=vault_payload(base_revision=1, encrypted="rev-2"),
        headers={"Authorization": f"Bearer {token}"},
    )
    sync = client.get("/api/v1/sync", headers={"Authorization": f"Bearer {token}"})
    assert sync.status_code == 200
    body = sync.get_json()
    assert body["current_revision"] == 2
    assert len(body["changes"]) >= 2


def test_sync_since_revision(client):
    token = _auth(client, "sync-since@example.com")
    client.put("/api/v1/vault", json=vault_payload(), headers={"Authorization": f"Bearer {token}"})
    client.put(
        "/api/v1/vault",
        json=vault_payload(base_revision=1, encrypted="rev-2"),
        headers={"Authorization": f"Bearer {token}"},
    )
    sync = client.get(
        "/api/v1/sync?since_revision=1",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert sync.status_code == 200
    changes = sync.get_json()["changes"]
    assert all(change["revision"] > 1 for change in changes)


def test_concurrent_update_only_one_succeeds(client, app):
    token = _auth(client, "race@example.com")
    client.put("/api/v1/vault", json=vault_payload(), headers={"Authorization": f"Bearer {token}"})

    with app.test_client() as client_a, app.test_client() as client_b:
        headers = {"Authorization": f"Bearer {token}"}
        resp_a = client_a.put(
            "/api/v1/vault",
            json=vault_payload(base_revision=1, encrypted="device-a"),
            headers=headers,
        )
        resp_b = client_b.put(
            "/api/v1/vault",
            json=vault_payload(base_revision=1, encrypted="device-b"),
            headers=headers,
        )

    statuses = sorted([resp_a.status_code, resp_b.status_code])
    assert statuses == [200, 409]
