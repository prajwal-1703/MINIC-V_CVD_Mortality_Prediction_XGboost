from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List
import pandas as pd
import joblib
import os

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

@app.on_event("startup")
def load_models():
    global model, scaler, threshold, feature_names
    base_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(base_dir, 'models')
    
    try:
        model = joblib.load(os.path.join(models_dir, 'mortality_model.pkl'))
        scaler = joblib.load(os.path.join(models_dir, 'scaler.pkl'))
        threshold = joblib.load(os.path.join(models_dir, 'threshold.pkl'))
        
        # Try to extract feature names
        if hasattr(scaler, 'feature_names_in_'):
            feature_names = list(scaler.feature_names_in_)
        elif hasattr(model, 'feature_names_in_'):
            feature_names = list(model.feature_names_in_)
        elif hasattr(model, 'get_booster'):
            feature_names = list(model.get_booster().feature_names)
            
        # Fallback if the extracted list is still empty or extraction failed
        if not feature_names:
            feature_names = ['los', 'first_careunit', 'age', 'gender', 'cancer', 'heart_disease', 'diabetes', 'hypertension', 'stroke', 'atrial_fibrillation', 'valvular_disease', 'cardiomyopathy', 'chronic_ischemic_hd']
            print("Using fallback explicit feature names.")
            
        print(f"Loaded models successfully. Threshold: {threshold}")
        print(f"Features expected: {feature_names}")
    except Exception as e:
        print(f"CRITICAL ERROR loading models: {e}")
        # Even if models fail to load completely right now (e.g. missing library),
        # provide the fallback so form at least renders. The /predict will fail gracefully.
        feature_names = ['los', 'first_careunit', 'age', 'gender', 'cancer', 'heart_disease', 'diabetes', 'hypertension', 'stroke', 'atrial_fibrillation', 'valvular_disease', 'cardiomyopathy', 'chronic_ischemic_hd']


@app.get("/")
def read_root():
    return {"message": "Mortality Risk Prediction API is running"}

@app.get("/features")
def get_features():
    """Return the list of expected features so frontend can build the form dynamically."""
    return {"features": feature_names}

@app.post("/predict")
def predict_risk(data: Dict[str, float]):
    global model, scaler, threshold, feature_names
    
    if not model or not scaler:
        raise HTTPException(status_code=500, detail="Models are not loaded.")
        
    try:
        # If feature names were found, order the input data according to them
        if feature_names:
            missing_features = [f for f in feature_names if f not in data]
            if missing_features:
                raise HTTPException(status_code=400, detail=f"Missing features: {missing_features}")
            input_df = pd.DataFrame([data], columns=feature_names)
        else:
            # Fallback if no feature names could be extracted
            input_df = pd.DataFrame([data])
            
        # Scale the data
        scaled_data = scaler.transform(input_df)
        
        # Predict probability
        # predict_proba returns [[prob_class_0, prob_class_1]]
        probability = float(model.predict_proba(scaled_data)[0][1])
        
        # Apply threshold
        is_high_risk = probability > float(threshold)
        prediction_text = "High Risk" if is_high_risk else "Low Risk"
        
        return {
            "prediction": prediction_text,
            "probability": probability,
            "threshold": float(threshold)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
