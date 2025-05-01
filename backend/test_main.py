import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_create_student():
    response = client.post("/students/", json={
        "name": "Test Student",
        "date_of_birth": "2010-01-01",
        "contact": "9876543210",
        "address": "456 Test St",
        "enrollment_date": "2025-01-01",
        "class_id": 1,
        "section_id": 1
    })
    assert response.status_code == 200
    assert response.json()["name"] == "Test Student"

def test_read_students():
    response = client.get("/students/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_class():
    response = client.post("/classes/", json={
        "name": "Grade 3",
        "academic_year": "2025"
    })
    assert response.status_code == 200
    assert response.json()["name"] == "Grade 3"

def test_dashboard():
    response = client.get("/dashboard/")
    assert response.status_code == 200
    assert "total_students" in response.json()