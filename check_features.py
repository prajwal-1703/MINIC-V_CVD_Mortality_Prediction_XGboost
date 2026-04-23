import joblib

try:
    model = joblib.load('models/mortality_model.pkl')
    print("Model loaded successfully.")
    if hasattr(model, 'feature_names_in_'):
        print("Features:", model.feature_names_in_)
    elif hasattr(model, 'get_booster'):
        print("Features:", model.get_booster().feature_names)
    else:
        print("Could not find feature names directly on model.")
except Exception as e:
    print("Error loading model:", e)

try:
    scaler = joblib.load('models/scaler.pkl')
    print("Scaler loaded successfully.")
    if hasattr(scaler, 'feature_names_in_'):
        print("Scaler features:", scaler.feature_names_in_)
except Exception as e:
    print("Error loading scaler:", e)

try:
    threshold = joblib.load('models/threshold.pkl')
    print("Threshold:", threshold)
except Exception as e:
    print("Error loading threshold:", e)
