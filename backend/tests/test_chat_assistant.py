"""
Tests for CreditLens AI Finance Assistant Chatbot
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.chat.assistant import generate_rule_based_response

client = TestClient(app)

def test_chat_rule_based_ulas_query():
    ulas_mock = {
        "ulas": 78.4,
        "band": "B",
        "decision_recommendation": "APPROVE_STANDARD"
    }
    res = generate_rule_based_response("What does my ULAS score mean?", user_context={"name": "Rajesh"}, ulas_data=ulas_mock)
    assert res["is_grounded"] is True
    assert "78.4" in res["response"]
    assert "Band" in res["response"] and "**B**" in res["response"]

def test_chat_rule_based_cashflow_query():
    xray_mock = {
        "net_cash_flow_avg": 32500.0,
        "monthly_inflows_avg": 95000.0,
        "monthly_outflows_avg": 62500.0
    }
    res = generate_rule_based_response("What is my net cash flow?", user_context={"name": "Rajesh"}, xray_report=xray_mock)
    assert res["is_grounded"] is True
    assert "₹32,500.00" in res["response"]

def test_chat_rule_based_dispute_query():
    res = generate_rule_based_response("How do I dispute a bureau delinquency?", user_context={"name": "Rajesh"})
    assert res["is_grounded"] is True
    assert "Bureau Reconciliation" in res["response"]
    assert "Dispute Letter Draft" in res["response"]

def test_api_chat_endpoints():
    # 1. Suggestions endpoint
    res_sugg = client.get("/api/chat/suggestions")
    assert res_sugg.status_code == 200
    assert len(res_sugg.json()["suggestions"]) >= 3

    # 2. Message endpoint
    res_msg = client.post("/api/chat/message", json={
        "message": "Can you explain net cash flow?"
    })
    assert res_msg.status_code == 200
    data = res_msg.json()
    assert "response" in data
    assert data["is_grounded"] is True

    # 3. History endpoint
    res_hist = client.get("/api/chat/history")
    assert res_hist.status_code == 200
    assert "history" in res_hist.json()
    assert len(res_hist.json()["history"]) >= 2
