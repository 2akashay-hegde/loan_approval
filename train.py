"""
Loan Approval Model Training Pipeline
"""

import os
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score
import joblib

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

def load_and_preprocess_data(csv_path="data/loan_approval_dataset.csv"):
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset not found at: {csv_path}")
    
    df = pd.read_csv(csv_path)
    df.columns = df.columns.str.strip()
    
    # Encode categorical features
    df['education'] = df['education'].astype(str).str.strip().map({'Graduate': 1, 'Not Graduate': 0, '1': 1, '0': 0})
    df['self_employed'] = df['self_employed'].astype(str).str.strip().map({'Yes': 1, 'No': 0, '1': 1, '0': 0})
    df['loan_status'] = df['loan_status'].astype(str).str.strip().map({'Approved': 1, 'Rejected': 0, '1': 1, '0': 0})
    
    # Feature columns and Target
    X = df[FEATURE_NAMES]
    y = df['loan_status']
    
    return X, y

def train_model(X, y):
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('classifier', RandomForestClassifier(n_estimators=150, max_depth=12, random_state=42))
    ])
    
    pipeline.fit(X_train, y_train)
    
    # Predictions
    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1]
    
    acc = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_proba)
    
    print(f"=== Model Performance ===")
    print(f"Accuracy: {acc * 100:.2f}%")
    print(f"ROC-AUC Score: {auc:.4f}")
    print("\nClassification Report:\n", classification_report(y_test, y_pred, target_names=['Rejected', 'Approved']))
    
    return pipeline

def save_model(pipeline, pkl_paths=("loan_approval_pipeline.pkl", "loan_approval_pipeline.pk1")):
    for path in pkl_paths:
        joblib.dump(pipeline, path)
        print(f"Saved model pipeline to {path}")

if __name__ == "__main__":
    print("Loading data...")
    X, y = load_and_preprocess_data()
    print(f"Dataset loaded with {len(X)} samples and {len(FEATURE_NAMES)} features.")
    
    print("Training pipeline...")
    pipeline = train_model(X, y)
    
    print("Saving model artifacts...")
    save_model(pipeline)
    print("Training complete successfully!")
