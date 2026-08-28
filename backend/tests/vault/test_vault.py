"""Vault storage tests."""

from __future__ import annotations

import uuid

from tests.factories import register_payload, STRONG_PASSWORD, vault_payload


def _auth(client, email: str = "vault@example.com") -> str:
    client.post("/api/v1/auth/register", json=register_payload(email))
    login = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": STRONG_PASSWORD},
    )
    return login.get_json()["access_token"]


def test_create_and_get_vault(client):
    token = _auth(client)
    created = client.put(
        "/api/v1/vault",
        json=vault_payload(),
        headers={"Authorization": f"Bearer {token}"},
    )
    assert created.status_code == 201
    assert created.get_json()["vault"]["revision"] == 1

    fetched = client.get("/api/v1/vault", headers={"Authorization": f"Bearer {token}"})
    assert fetched.status_code == 200
    assert fetched.get_json()["vault"]["encrypted_vault"] == vault_payload()["encrypted_vault"]


def test_revision_increment(client):
    token = _auth(client)
    client.put("/api/v1/vault", json=vault_payload(), headers={"Authorization": f"Bearer {token}"})
    updated = client.put(
        "/api/v1/vault",
        json=vault_payload(base_revision=1, encrypted="updated-vault"),
        headers={"Authorization": f"Bearer {token}"},
    )
    assert updated.status_code == 200
    assert updated.get_json()["vault"]["revision"] == 2


def test_stale_revision_conflict(client):
    token = _auth(client)
    client.put("/api/v1/vault", json=vault_payload(), headers={"Authorization": f"Bearer {token}"})
    client.put(
        "/api/v1/vault",
        json=vault_payload(base_revision=1, encrypted="first-update"),
        headers={"Authorization": f"Bearer {token}"},
    )
    conflict = client.put(
        "/api/v1/vault",
        json=vault_payload(base_revision=1, encrypted="stale-update"),
        headers={"Authorization": f"Bearer {token}"},
    )
    assert conflict.status_code == 409
    assert conflict.get_json()["error"]["code"] == "VAULT_REVISION_CONFLICT"
    assert conflict.get_json()["error"]["details"]["current_revision"] == 2


def test_unauthorized_vault_access(client):
    response = client.get("/api/v1/vault")
    assert response.status_code == 401


def test_user_isolation(client):
    token_a = _auth(client, "vault-a@example.com")
    client.put("/api/v1/vault", json=vault_payload(), headers={"Authorization": f"Bearer {token_a}"})

    token_b = _auth(client, "vault-b@example.com")
    response = client.get("/api/v1/vault", headers={"Authorization": f"Bearer {token_b}"})
    assert response.status_code == 404


def test_oversized_payload(client):
    token = _auth(client)
    huge = "A" * (2 * 1024 * 1024 + 1)
    response = client.put(
        "/api/v1/vault",
        json=vault_payload(encrypted=huge),
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 413


def test_idempotent_put_replay(client):
    token = _auth(client)
    mutation_id = str(uuid.uuid4())
    payload = vault_payload(client_mutation_id=mutation_id)
    first = client.put(
        "/api/v1/vault",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert first.status_code == 201
    replay = client.put(
        "/api/v1/vault",
        json={**payload, "base_revision": 99},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert replay.status_code == 200
    assert replay.get_json()["vault"]["revision"] == 1


def test_etag_not_modified(client):
    token = _auth(client)
    client.put("/api/v1/vault", json=vault_payload(), headers={"Authorization": f"Bearer {token}"})
    first = client.get("/api/v1/vault", headers={"Authorization": f"Bearer {token}"})
    etag = first.headers["ETag"]
    second = client.get(
        "/api/v1/vault",
        headers={"Authorization": f"Bearer {token}", "If-None-Match": etag},
    )
    assert second.status_code == 304
