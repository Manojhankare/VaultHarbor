"""Device management tests."""

from __future__ import annotations

from tests.factories import device_payload, register_payload, STRONG_PASSWORD


def _auth(client):
    client.post("/api/v1/auth/register", json=register_payload("devices@example.com"))
    login = client.post(
        "/api/v1/auth/login",
        json={"email": "devices@example.com", "password": STRONG_PASSWORD},
    )
    return login.get_json()["access_token"]


def test_register_device(client):
    token = _auth(client)
    response = client.post(
        "/api/v1/devices",
        json=device_payload(),
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    assert response.get_json()["device"]["device_name"] == "My Chrome"


def test_list_devices(client):
    token = _auth(client)
    client.post(
        "/api/v1/devices",
        json=device_payload(),
        headers={"Authorization": f"Bearer {token}"},
    )
    response = client.get("/api/v1/devices", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert len(response.get_json()["devices"]) == 1


def test_delete_own_device(client):
    token = _auth(client)
    created = client.post(
        "/api/v1/devices",
        json=device_payload(),
        headers={"Authorization": f"Bearer {token}"},
    )
    device_id = created.get_json()["device"]["id"]
    response = client.delete(
        f"/api/v1/devices/{device_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 204


def test_cannot_delete_other_users_device(client):
    token_a = _auth(client)
    created = client.post(
        "/api/v1/devices",
        json=device_payload("device-a-12345678"),
        headers={"Authorization": f"Bearer {token_a}"},
    )
    device_id = created.get_json()["device"]["id"]

    client.post("/api/v1/auth/register", json=register_payload("other@example.com"))
    login_b = client.post(
        "/api/v1/auth/login",
        json={"email": "other@example.com", "password": STRONG_PASSWORD},
    )
    token_b = login_b.get_json()["access_token"]

    response = client.delete(
        f"/api/v1/devices/{device_id}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert response.status_code == 404
