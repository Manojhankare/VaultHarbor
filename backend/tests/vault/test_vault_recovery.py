"""Vault recovery fields and delete tests."""

from __future__ import annotations

from tests.factories import STRONG_PASSWORD, register_payload, vault_payload


def _auth(client, email: str = "recovery@example.com") -> str:
    client.post("/api/v1/auth/register", json=register_payload(email))
    login = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": STRONG_PASSWORD},
    )
    return login.get_json()["access_token"]


def test_recovery_fields_round_trip(client):
    token = _auth(client)
    payload = {
        **vault_payload(),
        "recovery_wrapped_vault_key": "cmVjb3Zlcnktd3JhcA==",
        "recovery_salt": "recovery-salt-value!",
        "recovery_kdf_algorithm": "pbkdf2-sha256",
        "recovery_kdf_iterations": 600000,
    }
    created = client.put(
        "/api/v1/vault",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert created.status_code == 201
    body = created.get_json()["vault"]
    assert body["recovery_wrapped_vault_key"] == payload["recovery_wrapped_vault_key"]
    assert body["recovery_salt"] == payload["recovery_salt"]

    fetched = client.get("/api/v1/vault", headers={"Authorization": f"Bearer {token}"})
    vault = fetched.get_json()["vault"]
    assert vault["recovery_wrapped_vault_key"] == payload["recovery_wrapped_vault_key"]


def test_recovery_fields_preserved_when_omitted(client):
    token = _auth(client)
    payload = {
        **vault_payload(),
        "recovery_wrapped_vault_key": "cmVjb3Zlcnktd3JhcA==",
        "recovery_salt": "recovery-salt-value!",
        "recovery_kdf_algorithm": "pbkdf2-sha256",
        "recovery_kdf_iterations": 600000,
    }
    client.put("/api/v1/vault", json=payload, headers={"Authorization": f"Bearer {token}"})
    updated = client.put(
        "/api/v1/vault",
        json=vault_payload(base_revision=1, encrypted="updated-only"),
        headers={"Authorization": f"Bearer {token}"},
    )
    assert updated.status_code == 200
    vault = updated.get_json()["vault"]
    assert vault["recovery_wrapped_vault_key"] == payload["recovery_wrapped_vault_key"]
    assert vault["recovery_salt"] == payload["recovery_salt"]


def test_delete_vault_requires_password(client):
    token = _auth(client)
    client.put("/api/v1/vault", json=vault_payload(), headers={"Authorization": f"Bearer {token}"})

    bad = client.delete(
        "/api/v1/vault",
        json={"password": "WrongPass1!", "confirm": "DELETE"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert bad.status_code == 401

    ok = client.delete(
        "/api/v1/vault",
        json={"password": STRONG_PASSWORD, "confirm": "DELETE"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert ok.status_code == 204

    missing = client.get("/api/v1/vault", headers={"Authorization": f"Bearer {token}"})
    assert missing.status_code == 404

    again = client.delete(
        "/api/v1/vault",
        json={"password": STRONG_PASSWORD, "confirm": "DELETE"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert again.status_code == 204
