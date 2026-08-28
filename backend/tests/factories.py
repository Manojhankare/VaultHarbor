"""Test data factories."""

from __future__ import annotations

STRONG_PASSWORD = "SecurePass1!"


def register_payload(email: str = "user@example.com") -> dict:
    return {"email": email, "password": STRONG_PASSWORD}


def login_payload(email: str = "user@example.com") -> dict:
    return {"email": email, "password": STRONG_PASSWORD}


def device_payload(identifier: str = "device-identifier-12345678") -> dict:
    return {
        "device_name": "My Chrome",
        "device_type": "browser",
        "device_identifier": identifier,
    }


def vault_payload(
    *,
    encrypted: str = "ZW5jcnlwdGVkLXZhdWx0LWRhdGE=",
    base_revision: int = 0,
    client_mutation_id: str | None = None,
) -> dict:
    payload = {
        "encrypted_vault": encrypted,
        "vault_version": 1,
        "base_revision": base_revision,
        "wrapped_vault_key": "d3JhcHBlZC1rZXk=",
    }
    if client_mutation_id:
        payload["client_mutation_id"] = client_mutation_id
    return payload
