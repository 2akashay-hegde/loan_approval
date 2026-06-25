from flask import Flask, request, jsonify
import joblib
import numpy as np
from pathlib import Path

# Load Model
model = None
for model_path in [Path("loan_approval_pipeline.pkl"), Path("loan_approval_pipeline.pk1")]:
    if model_path.exists():
        model = joblib.load(model_path)
        break

if model is None:
    raise FileNotFoundError("Could not find a trained model file. Expected 'loan_approval_pipeline.pkl' or 'loan_approval_pipeline.pk1'.")

app = Flask(__name__)

# Home Route
@app.route('/')
def home():
    return """
    <h2>Loan Approval Prediction API</h2>
    """

# Prediction Route
@app.route('/predict', methods=['POST'])
def predict():

    data = request.get_json()

    features = np.array([[

        data['no_of_dependents'],
        data['education'],
        data['self_employed'],
        data['income_annum'],
        data['loan_amount'],
        data['loan_term'],
        data['cibil_score'],
        data['residential_assets_value'],
        data['commercial_assets_value'],
        data['luxury_assets_value'],
        data['bank_asset_value']

    ]])

    prediction = model.predict(features)
    probability = model.predict_proba(features)

    result = "Loan Approved"

    if prediction[0] == 0:
        result = "Loan Not Approved"

    confidence = np.max(probability) * 100

    return jsonify({
        "prediction": result,
        "confidence": f"{confidence:.2f}%"
    })

if __name__ == "__main__":
    app.run(debug=True)