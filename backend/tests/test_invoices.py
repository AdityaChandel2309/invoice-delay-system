"""Tests for the Invoice CRUD endpoints."""

import uuid

import pytest
from fastapi.testclient import TestClient


def _create_customer(client: TestClient) -> str:
    """Helper — create a customer and return its ID."""
    resp = client.post("/api/v1/customers", json={"name": "Test Corp", "industry": "Tech"})
    return resp.json()["id"]


def _create_payment_term(client: TestClient, db_session) -> str:
    """Helper — insert a payment term directly via ORM and return its ID."""
    from app.models.payment_term import PaymentTerm
    pt = PaymentTerm(name=f"Net 30 {uuid.uuid4().hex[:6]}", net_days=30)
    db_session.add(pt)
    db_session.commit()
    db_session.refresh(pt)
    return str(pt.id)


def _invoice_data(customer_id: str, payment_term_id: str, **overrides) -> dict:
    base = {
        "invoice_number": "INV-TEST-001",
        "customer_id": customer_id,
        "payment_term_id": payment_term_id,
        "issue_date": "2026-01-15",
        "due_date": "2026-02-14",
        "amount": 50000.00,
        "currency": "USD",
        "status": "issued",
        "category": "Consulting",
        "is_recurring": False,
    }
    base.update(overrides)
    return base


class TestCreateInvoice:
    def test_create_success(self, client: TestClient, db_session):
        cid = _create_customer(client)
        ptid = _create_payment_term(client, db_session)
        data = _invoice_data(cid, ptid)
        resp = client.post("/api/v1/invoices", json=data)
        assert resp.status_code == 201
        body = resp.json()
        assert body["invoice_number"] == "INV-TEST-001"
        assert float(body["amount"]) == 50000.0

    def test_due_before_issue(self, client: TestClient, db_session):
        cid = _create_customer(client)
        ptid = _create_payment_term(client, db_session)
        data = _invoice_data(cid, ptid, due_date="2025-12-01")
        resp = client.post("/api/v1/invoices", json=data)
        # Either 422 (Pydantic validation) or 500 (DB check constraint)
        assert resp.status_code in (422, 500)


class TestListInvoices:
    def test_empty_list(self, client: TestClient):
        resp = client.get("/api/v1/invoices")
        assert resp.status_code == 200
        assert resp.json()["total"] == 0

    def test_list_with_data(self, client: TestClient, db_session):
        cid = _create_customer(client)
        ptid = _create_payment_term(client, db_session)
        for i in range(3):
            data = _invoice_data(cid, ptid, invoice_number=f"INV-{i:03d}")
            client.post("/api/v1/invoices", json=data)
        resp = client.get("/api/v1/invoices")
        assert resp.json()["total"] == 3

    def test_filter_by_status(self, client: TestClient, db_session):
        cid = _create_customer(client)
        ptid = _create_payment_term(client, db_session)
        client.post("/api/v1/invoices", json=_invoice_data(cid, ptid))
        client.post("/api/v1/invoices", json=_invoice_data(
            cid, ptid,
            invoice_number="INV-002", status="paid",
            actual_payment_date="2026-02-10",
        ))
        resp = client.get("/api/v1/invoices?status=paid")
        assert resp.json()["total"] == 1


class TestGetInvoice:
    def test_get_existing(self, client: TestClient, db_session):
        cid = _create_customer(client)
        ptid = _create_payment_term(client, db_session)
        create = client.post("/api/v1/invoices", json=_invoice_data(cid, ptid))
        iid = create.json()["id"]
        resp = client.get(f"/api/v1/invoices/{iid}")
        assert resp.status_code == 200

    def test_get_not_found(self, client: TestClient):
        resp = client.get("/api/v1/invoices/00000000-0000-0000-0000-000000000099")
        assert resp.status_code == 404


class TestUpdateInvoice:
    def test_update_status(self, client: TestClient, db_session):
        cid = _create_customer(client)
        ptid = _create_payment_term(client, db_session)
        create = client.post("/api/v1/invoices", json=_invoice_data(cid, ptid))
        iid = create.json()["id"]
        resp = client.put(f"/api/v1/invoices/{iid}", json={
            "status": "paid",
            "actual_payment_date": "2026-02-10",
        })
        assert resp.status_code == 200
        assert resp.json()["status"] == "paid"


class TestDeleteInvoice:
    def test_delete_success(self, client: TestClient, db_session):
        cid = _create_customer(client)
        ptid = _create_payment_term(client, db_session)
        create = client.post("/api/v1/invoices", json=_invoice_data(cid, ptid))
        iid = create.json()["id"]
        resp = client.delete(f"/api/v1/invoices/{iid}")
        assert resp.status_code == 204
