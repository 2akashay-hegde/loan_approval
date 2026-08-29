# 🏦 LoanPulse AI - Loan Approval & Risk Assessment Pipeline

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0%2B-black.svg?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.4%2B-orange.svg?logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?logo=docker&logoColor=white)](https://www.docker.com/)
[![Tests](https://img.shields.io/badge/Tests-PyTest%20Passing-brightgreen.svg?logo=pytest&logoColor=white)](https://docs.pytest.org/)

An end-to-end Machine Learning pipeline and intelligent web underwriting application for real-time **Loan Approval Prediction & Risk Assessment**. Built with Python, Scikit-Learn, and Flask.

---

## 📑 Table of Contents
1. [Overview & Features](#-overview--features)
2. [Project Structure](#-project-structure)
3. [System Requirements](#-system-requirements)
4. [Installation & Setup](#-installation--setup)
5. [Usage Guide](#-usage-guide)
   - [1. Running the Web Application](#1-running-the-web-application)
   - [2. Interactive UI Features](#2-interactive-ui-features)
   - [3. Retraining the ML Model](#3-retraining-the-ml-model)
6. [API Reference](#-api-reference)
7. [Running Tests](#-running-tests)
8. [Docker Deployment](#-docker-deployment)
9. [License](#-license)

---

## 🌟 Overview & Features

- **Machine Learning Underwriting**: Trained on comprehensive financial and asset data with a `RandomForestClassifier` pipeline achieved via `StandardScaler` normalization.
- **SVG Speedometer Risk Gauge**: Interactive semi-circular gauge displaying live approval confidence with dynamic needle rotation and color gradient tracks.
- **EMI & Risk-Based Pricing Engine**: Computes monthly EMI, risk-adjusted interest rates (APR), total interest, and total repayment amounts based on borrower credit score.
- **Real-Time Live Debounced Evaluation**: Dragging range sliders or modifying numeric inputs updates predictions and EMI figures live (350ms debounce).
- **One-Click PDF Credit Appraisal Exporter**: Download official Credit Appraisal & Risk Summary PDF reports using `html2pdf.js`.
- **Quick Risk Scenarios**: Pre-configured scenario presets (*Prime Borrower*, *Moderate Risk*, *High Risk*) for instant testing.
- **Risk Breakdown & Confidence Scoring**: Outputs prediction confidence percentage along with Debt-to-Income (DTI) and Asset Coverage metrics.
- **Automated Unit Testing**: Complete test coverage via `pytest` for routes, edge cases, and prediction accuracy.
- **Containerized & CI/CD Ready**: Dockerfile and GitHub Actions workflow configured for seamless deployment.

---

## 📁 Project Structure

```text
loan_approval/
├── data/
│   └── loan_approval_dataset.csv     # Historical loan training dataset
├── static/
│   ├── style.css                     # Glassmorphism dark-theme styling
│   └── script.js                     # Dynamic UI interactions & API handling
├── templates/
│   └── index.html                    # Interactive web portal
├── tests/
│   └── test_app.py                   # Automated test suite
├── app.py                            # Flask server and API endpoints
├── train.py                          # ML training and evaluation pipeline
├── loan_approval_pipeline.pkl        # Serialized trained model pipeline
├── Dockerfile                        # Containerization setup
├── pytest.ini                        # PyTest configuration
├── requirements.txt                  # Python dependencies
└── README.md                         # Project documentation
```

---

## ⚙️ System Requirements

### Prerequisites
- **Python**: Version `3.10` or higher (tested up to `3.14`)
- **Pip**: Latest Python package manager
- **Operating System**: Windows, macOS, or Linux
- **Docker** *(Optional)*: For containerized execution

### Core Dependencies (`requirements.txt`)
- `flask >= 3.0.0` - Web server framework
- `numpy >= 1.24.0` - Numerical array operations
- `pandas >= 2.0.0` - Data manipulation and processing
- `scikit-learn >= 1.4.0` - ML preprocessing and model pipeline
- `joblib >= 1.3.0` - Pipeline serialization
- `pytest >= 8.0.0` - Automated testing framework
- `gunicorn >= 21.0.0` - Production WSGI HTTP server

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/2akashay-hegde/loan_approval.git
cd loan_approval
```

### 2. Create and Activate a Virtual Environment *(Recommended)*

**Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

---

## 🖥️ Usage Guide

### 1. Running the Web Application
Start the Flask development server:
```bash
python app.py
```
Open your browser and navigate to:
```text
http://127.0.0.1:5000
```

### 2. Interactive UI Features
1. **Quick Scenario Presets**: Click on `Prime Borrower`, `Moderate Risk`, or `High Risk` to auto-fill applicant profiles.
2. **Dynamic Sliders & Calculations**: Adjust the CIBIL score slider and asset values to see instant real-time collateral ratios.
3. **Run AI Assessment**: Click **Run AI Loan Assessment** to evaluate loan approval with confidence metrics.

### 3. Retraining the ML Model
If you add new data to `data/loan_approval_dataset.csv`, retrain the pipeline using:
```bash
python train.py
```
This will:
- Preprocess and encode features
- Train a `StandardScaler` + `RandomForestClassifier` pipeline
- Evaluate accuracy and ROC-AUC metrics
- Save the updated model artifact to `loan_approval_pipeline.pkl`

---

## 📡 API Reference

### Health Check Endpoint
- **URL**: `/health`
- **Method**: `GET`
- **Response**:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "features_count": 11
}
```

### Prediction Endpoint
- **URL**: `/predict`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
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
```
- **Response (200 OK)**:
```json
{
  "prediction": "Loan Approved",
  "confidence": "98.50%",
  "is_approved": true,
  "probabilities": {
    "approved": "98.50%",
    "rejected": "1.50%"
  }
}
```

---

## 🧪 Running Tests

Execute the automated test suite with `pytest`:
```bash
pytest
```
Or run with verbose output:
```bash
pytest -v
```

---

## 🐳 Docker Deployment

### 1. Build the Docker Image
```bash
docker build -t loan-approval-app .
```

### 2. Run the Container
```bash
docker run -p 5000:5000 loan-approval-app
```
Access the application at `http://localhost:5000`.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
