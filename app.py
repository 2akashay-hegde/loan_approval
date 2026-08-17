from flask import Flask, request, jsonify, render_template
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
import os

app = Flask(__name__)

FEATURE_NAMES = [
    'no_of_dependents',
    'education',
    'self_employed',
    'income_annum',
    'loan_amount',
    'loan_term',
    'cibil_score',
    'residential_assets_value',
    'commercial_assets_value',
    'luxury_assets_value',
    'bank_asset_value'
]

# Load Trained Model
model = None
for model_path in [Path("loan_approval_pipeline.pkl"), Path("loan_approval_pipeline.pk1")]:
    if model_path.exists():
        try:
            model = joblib.load(model_path)
            print(f"Successfully loaded model from {model_path}")
            break
        except Exception as e:
            print(f"Error loading model from {model_path}: {e}")

if model is None:
    raise FileNotFoundError("Could not find a valid trained model file ('loan_approval_pipeline.pkl' or 'loan_approval_pipeline.pk1'). Run train.py first.")

def parse_input_features(data):
    """
    Parses and standardizes features from JSON or form payload into a DataFrame with the 11 expected features.
    """
    def to_float(val, default=0.0):
        try:
            return float(val)
        except (ValueError, TypeError):
            return default

    def to_int(val, default=0):
        try:
            return int(float(val))
        except (ValueError, TypeError):
            return default

    # Parse education: Graduate -> 1, Not Graduate -> 0
    edu_raw = str(data.get('education', '0')).strip().lower()
    if 'not' in edu_raw or edu_raw in ['0', 'false', 'no']:
        education = 0
    elif 'grad' in edu_raw or edu_raw in ['1', 'true', 'yes']:
        education = 1
    else:
        education = to_int(edu_raw, default=1)

    # Parse self_employed: Yes -> 1, No -> 0
    emp_raw = str(data.get('self_employed', '0')).strip().lower()
    if emp_raw in ['1', 'true', 'yes', 'y']:
        self_employed = 1
    else:
        self_employed = 0

    row = {
        'no_of_dependents': to_int(data.get('no_of_dependents', 0)),
        'education': education,
        'self_employed': self_employed,
        'income_annum': to_float(data.get('income_annum', 0.0)),
        'loan_amount': to_float(data.get('loan_amount', 0.0)),
        'loan_term': to_int(data.get('loan_term', 0)),
        'cibil_score': to_float(data.get('cibil_score', 0.0)),
        'residential_assets_value': to_float(data.get('residential_assets_value', 0.0)),
        'commercial_assets_value': to_float(data.get('commercial_assets_value', 0.0)),
        'luxury_assets_value': to_float(data.get('luxury_assets_value', 0.0)),
        'bank_asset_value': to_float(data.get('bank_asset_value', 0.0))
    }

    return pd.DataFrame([row], columns=FEATURE_NAMES)

# Home Route - Interactive UI
@app.route('/')
def home():
    try:
        return render_template('index.html')
    except Exception:
        return """
        <h2>Loan Approval Prediction API</h2>
        <p>API is running. POST requests to <code>/predict</code>.</p>
        """

# Health Check Route
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "features_count": len(FEATURE_NAMES)
    }), 200

# Prediction Route
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json(silent=True)
        if not data:
            data = request.form.to_dict()

        if not data:
            return jsonify({"error": "No input data provided. Send JSON payload or form data."}), 400

        features_df = parse_input_features(data)

        prediction = model.predict(features_df)
        probability = model.predict_proba(features_df)

        # 1 = Approved, 0 = Rejected
        is_approved = int(prediction[0]) == 1
        result = "Loan Approved" if is_approved else "Loan Not Approved"

        confidence = float(np.max(probability) * 100)

        # Classes probability (index 0: Rejected, index 1: Approved)
        prob_rejected = float(probability[0][0]) * 100 if probability.shape[1] > 1 else 0.0
        prob_approved = float(probability[0][1]) * 100 if probability.shape[1] > 1 else 100.0

        return jsonify({
            "prediction": result,
            "confidence": f"{confidence:.2f}%",
            "is_approved": is_approved,
            "probabilities": {
                "approved": f"{prob_approved:.2f}%",
                "rejected": f"{prob_rejected:.2f}%"
            }
        })
    except Exception as e:
        return jsonify({
            "error": str(e),
            "prediction": "Error",
            "confidence": "0.00%"
        }), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)