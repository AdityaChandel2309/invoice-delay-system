"""Tests for the Customer CRUD endpoints."""

import pytest
from fastapi.testclient import TestClient


CUSTOMER_DATA = {
    "name": "Acme Corp",
    "industry": "Technology",
    "region": "North America",
    "size_category": "Large",
    "credit_limit": 500000,
    "avg_payment_days": 32.5,
    "late_payment_ratio": 0.18,
}


class TestCreateCustomer:
    def test_create_success(self, client: TestClient):
        resp = client.post("/api/v1/customers", json=CUSTOMER_DATA)
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "Acme Corp"
        assert data["industry"] == "Technology"
        assert data["id"] is not None

    def test_create_minimal(self, client: TestClient):
        resp = client.post("/api/v1/customers", json={"name": "MinCo"})
        assert resp.status_code == 201
        assert resp.json()["name"] == "MinCo"


class TestListCustomers:
    def test_empty_list(self, client: TestClient):
        resp = client.get("/api/v1/customers")
        assert resp.status_code == 200
        data = resp.json()
        assert data["items"] == []
        assert data["total"] == 0

    def test_list_with_data(self, client: TestClient):
        client.post("/api/v1/customers", json=CUSTOMER_DATA)
        client.post("/api/v1/customers", json={"name": "Beta Inc"})
        resp = client.get("/api/v1/customers")
        assert resp.status_code == 200
        assert resp.json()["total"] == 2

    def test_pagination(self, client: TestClient):
        for i in range(5):
            client.post("/api/v1/customers", json={"name": f"Co {i}"})
        resp = client.get("/api/v1/customers?per_page=2&page=1")
        data = resp.json()
        assert len(data["items"]) == 2
        assert data["total"] == 5

    def test_filter_by_industry(self, client: TestClient):
        client.post("/api/v1/customers", json=CUSTOMER_DATA)
        client.post("/api/v1/customers", json={"name": "HealthCo", "industry": "Healthcare"})
        resp = client.get("/api/v1/customers?industry=Healthcare")
        assert resp.json()["total"] == 1


class TestGetCustomer:
    def test_get_existing(self, client: TestClient):
        create = client.post("/api/v1/customers", json=CUSTOMER_DATA)
        cid = create.json()["id"]
        resp = client.get(f"/api/v1/customers/{cid}")
        assert resp.status_code == 200
        assert resp.json()["name"] == "Acme Corp"

    def test_get_not_found(self, client: TestClient):
        resp = client.get("/api/v1/customers/00000000-0000-0000-0000-000000000099")
        assert resp.status_code == 404


class TestUpdateCustomer:
    def test_update_fields(self, client: TestClient):
        create = client.post("/api/v1/customers", json=CUSTOMER_DATA)
        cid = create.json()["id"]
        resp = client.put(f"/api/v1/customers/{cid}", json={"name": "Acme Updated"})
        assert resp.status_code == 200
        assert resp.json()["name"] == "Acme Updated"

    def test_update_not_found(self, client: TestClient):
        resp = client.put(
            "/api/v1/customers/00000000-0000-0000-0000-000000000099",
            json={"name": "Ghost"},
        )
        assert resp.status_code == 404


class TestDeleteCustomer:
    def test_delete_success(self, client: TestClient):
        create = client.post("/api/v1/customers", json=CUSTOMER_DATA)
        cid = create.json()["id"]
        resp = client.delete(f"/api/v1/customers/{cid}")
        assert resp.status_code == 204
        # Confirm gone
        resp2 = client.get(f"/api/v1/customers/{cid}")
        assert resp2.status_code == 404

    def test_delete_not_found(self, client: TestClient):
        resp = client.delete("/api/v1/customers/00000000-0000-0000-0000-000000000099")
        assert resp.status_code == 404
