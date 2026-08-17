import pytest
import json
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_home_page(client):
    response = client.get('/')
    assert response.status_code == 200
    assert b"LoanPulse" in response.data or b"Loan Approval" in response.data

def test_health_endpoint(client):
    response = client.get('/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'healthy'
    assert data['model_loaded'] is True

def test_predict_approved_case(client):
    payload = {
        "no_of_dependents": 2,
        "education": "Graduate",
        "self_employed": "No",
        "income_annum": 8500000,
        "loan_amount": 22000000,
        "loan_term": 10,
        "cibil_score": 780,
        "residential_assets_value": 12000000,
        "commercial_assets_value": 4500000,
        "luxury_assets_value": 18000000,
        "bank_asset_value": 6500000
    }
    response = client.post('/predict', data=json.dumps(payload), content_type='application/json')
    assert response.status_code == 200
    data = response.get_json()
    assert "prediction" in data
    assert data["prediction"] == "Loan Approved"
    assert "confidence" in data

def test_predict_rejected_case(client):
    payload = {
        "no_of_dependents": 4,
        "education": "Not Graduate",
        "self_employed": "Yes",
        "income_annum": 1500000,
        "loan_amount": 25000000,
        "loan_term": 20,
        "cibil_score": 380,
        "residential_assets_value": 500000,
        "commercial_assets_value": 0,
        "luxury_assets_value": 800000,
        "bank_asset_value": 200000
    }
    response = client.post('/predict', data=json.dumps(payload), content_type='application/json')
    assert response.status_code == 200
    data = response.get_json()
    assert "prediction" in data
    assert data["prediction"] == "Loan Not Approved"
    assert "confidence" in data

def test_predict_empty_payload(client):
    response = client.post('/predict', data=json.dumps({}), content_type='application/json')
    assert response.status_code == 400
    data = response.get_json()
    assert "error" in data
