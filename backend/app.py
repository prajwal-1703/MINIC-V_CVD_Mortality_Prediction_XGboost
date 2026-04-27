from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
class SimpleInput(BaseModel):
    los: float
    anchor_age: int
    gender: str
    admission_type: str
    myocardial_infarction: int
    heart_failure: int
    cardiac_arrest: int
    chronic_ischemic_hd: int
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

def fill_defaults(data):
    defaults = {
        "first_careunit": 0,
        "last_careunit": 0,
        "num_chart_items": 0,
        "overall_avg_chart": 0,
        "min_chart_value": 0,
        "max_chart_value": 0,
        "total_input": 0,
        "avg_input_rate": 0,
        "num_input_types": 0,
        "total_output": 0,
        "num_output_types": 0,
        "total_ingredient": 0,
        "avg_ingredient_rate": 0,
        "num_ingredient_types": 0,
        "total_procedures": 0,
        "num_procedure_types": 0,
        "total_datetime_events": 0,
        "num_datetime_types": 0,
        "insurance": 0,
        "race": 0,
        "admission_location": 0,
        "cardiomyopathy": 0
    }
    return {**defaults, **data}

@app.on_event("startup")
def load_models():
    global model, scaler, threshold, feature_names
    global le_gender, le_admission_type

    # Get base directory
    base_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(base_dir, "models")

    try:
        # Load main model files
        model = joblib.load(os.path.join(models_dir, "mortality_model.pkl"))
        scaler = joblib.load(os.path.join(models_dir, "scaler.pkl"))
        threshold = joblib.load(os.path.join(models_dir, "threshold.pkl"))

        # Load encoders
        le_gender = joblib.load(os.path.join(models_dir, "le_gender.pkl"))
        le_admission_type = joblib.load(os.path.join(models_dir, "le_admission_type.pkl"))

        # Extract feature names
        if hasattr(scaler, 'feature_names_in_'):
            feature_names = list(scaler.feature_names_in_)
        elif hasattr(model, 'feature_names_in_'):
            feature_names = list(model.feature_names_in_)
        elif hasattr(model, 'get_booster'):
            feature_names = list(model.get_booster().feature_names)
        else:
            raise Exception("Feature names could not be extracted!")

        print("Models and encoders loaded successfully!")
        print("Gender classes:", le_gender.classes_)
        print("Admission type classes:", le_admission_type.classes_)

    except Exception as e:
        print(f"Error loading models: {e}")


@app.get("/")
def read_root():
    return {"message": "Mortality Risk Prediction API is running"}

@app.post("/predict")
def predict(input: SimpleInput):

    global model, scaler, threshold, feature_names

    if not model or not scaler:
        raise HTTPException(status_code=500, detail="Models are not loaded.")

    try:
        # Convert input to dict
        data = input.dict()

        # Fill missing fields
        data = fill_defaults(data)

        # Encode categorical values
        data["gender"] = le_gender.transform([data["gender"]])[0]
        data["admission_type"] = le_admission_type.transform([data["admission_type"]])[0]

        # Arrange features in correct order
        if feature_names:
            input_df = pd.DataFrame([[data[col] for col in feature_names]], columns=feature_names)
        else:
            input_df = pd.DataFrame([data])

        # Scale
        scaled_data = scaler.transform(input_df)

        # Predict
        probability = float(model.predict_proba(scaled_data)[0][1])
        is_high_risk = probability > float(threshold)

        return {
            "prediction": "High Risk" if is_high_risk else "Low Risk",
            "probability": probability
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
