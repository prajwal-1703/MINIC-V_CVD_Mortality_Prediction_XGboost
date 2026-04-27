from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List
import pandas as pd
import joblib
import os
import numpy as np

app = FastAPI(title="Mortality Risk Prediction API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models
model = None
scaler = None
threshold = 0.5
feature_names = []
label_encoders = {}
defaults = {
    "los": 3.4,
    "first_careunit": "Medical Intensive Care Unit (MICU)",
    "last_careunit": "Medical Intensive Care Unit (MICU)",
    "num_chart_items": 121.0,
    "overall_avg_chart": 39.9,
    "min_chart_value": -2.0,
    "max_chart_value": 750.0,
    "total_input": 9637.0,
    "avg_input_rate": 60.1,
    "num_input_types": 13.0,
    "total_output": 4246.0,
    "num_output_types": 2.0,
    "total_ingredient": 14111.0,
    "avg_ingredient_rate": 102.6,
    "num_ingredient_types": 5.0,
    "total_procedures": 7.0,
    "num_procedure_types": 6.0,
    "total_datetime_events": 41.0,
    "num_datetime_types": 6.0,
    "gender": "M",
    "anchor_age": 65.0,
    "admission_type": "EW EMER.",
    "insurance": "Medicare",
    "race": "WHITE",
    "admission_location": "EMERGENCY ROOM",
    "myocardial_infarction": 0.0,
    "heart_failure": 0.0,
    "cardiac_arrest": 0.0,
    "cardiomyopathy": 0.0,
    "chronic_ischemic_hd": 0.0
}

# Categorize features for frontend
IMPORTANT_FEATURES = [
    'anchor_age', 'gender', 'los', 'admission_type', 'admission_location', 
    'myocardial_infarction', 'heart_failure', 'cardiac_arrest', 
    'cardiomyopathy', 'chronic_ischemic_hd', 'first_careunit'
]

@app.on_event("startup")
def load_models():
    global model, scaler, threshold, feature_names, label_encoders
    base_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(base_dir, 'models')
    
    try:
        model = joblib.load(os.path.join(models_dir, 'mortality_model.pkl'))
        scaler = joblib.load(os.path.join(models_dir, 'scaler.pkl'))
        threshold = joblib.load(os.path.join(models_dir, 'threshold.pkl'))
        
        # Load LabelEncoders
        for f in os.listdir(models_dir):
            if f.startswith('le_') and f.endswith('.pkl'):
                feat_name = f.replace('le_', '').replace('.pkl', '')
                # Handle mapping of age vs anchor_age if needed (scaler has anchor_age)
                if feat_name == 'age': 
                    feat_name = 'anchor_age'
                label_encoders[feat_name] = joblib.load(os.path.join(models_dir, f))
        
        # Extract feature names
        if hasattr(scaler, 'feature_names_in_'):
            feature_names = list(scaler.feature_names_in_)
        elif hasattr(model, 'feature_names_in_'):
            feature_names = list(model.feature_names_in_)
            
        print(f"Loaded models successfully. Features: {len(feature_names)}")
    except Exception as e:
        print(f"CRITICAL ERROR loading models: {e}")
        # Fallback list from scaler observation
        feature_names = list(defaults.keys())

@app.get("/")
def read_root():
    return {"message": "Mortality Risk Prediction API is running"}

@app.get("/features")
def get_features():
    """Return detailed feature info for frontend."""
    feature_meta = []
    for f in feature_names:
        is_important = f in IMPORTANT_FEATURES
        info = {
            "name": f,
            "important": is_important,
            "default": defaults.get(f, 0.0)
        }
        
        if f in label_encoders:
            info["type"] = "categorical"
            info["options"] = list(label_encoders[f].classes_)
        elif f in ['myocardial_infarction', 'heart_failure', 'cardiac_arrest', 'cardiomyopathy', 'chronic_ischemic_hd']:
             info["type"] = "boolean"
             info["options"] = ["No", "Yes"]
        else:
            info["type"] = "numeric"
            
        feature_meta.append(info)
        
    return {"features": feature_meta}

@app.post("/predict")
def predict_risk(data: Dict[str, Any]):
    global model, scaler, threshold, feature_names
    
    if not model or not scaler:
        raise HTTPException(status_code=500, detail="Models are not loaded.")
        
    try:
        # 1. Fill missing with defaults
        full_data = defaults.copy()
        for k, v in data.items():
            if v is not None and v != "":
                full_data[k] = v
        
        # 2. Encode categorical strings and booleans
        processed_data = {}
        for f in feature_names:
            val = full_data.get(f)
            
            # Label Encoder handling
            if f in label_encoders:
                if isinstance(val, str):
                    try:
                        # Find the index of the class
                        classes = list(label_encoders[f].classes_)
                        if val in classes:
                            processed_data[f] = float(classes.index(val))
                        else:
                            # Try to find a partial match or default to 0
                            processed_data[f] = 0.0
                    except:
                        processed_data[f] = 0.0
                else:
                    processed_data[f] = float(val)
            
            # Boolean handling for condition flags
            elif f in ['myocardial_infarction', 'heart_failure', 'cardiac_arrest', 'cardiomyopathy', 'chronic_ischemic_hd']:
                if isinstance(val, str):
                    processed_data[f] = 1.0 if val.lower() in ['yes', 'y', '1', 'true'] else 0.0
                else:
                    processed_data[f] = float(val)
            else:
                try:
                    processed_data[f] = float(val)
                except:
                    processed_data[f] = defaults.get(f, 0.0)

        # 3. Create DataFrame with correct order
        input_df = pd.DataFrame([processed_data], columns=feature_names)
            
        # 4. Scale and Predict
        scaled_data = scaler.transform(input_df)
        probability = float(model.predict_proba(scaled_data)[0][1])
        
        is_high_risk = probability > float(threshold)
        prediction_text = "High Risk" if is_high_risk else "Low Risk"
        
        return {
            "prediction": prediction_text,
            "probability": probability,
            "threshold": float(threshold)
        }
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
