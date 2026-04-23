import pickle
import sys

def sniff_features():
    print("Trying python pickle...")
    # joblib uses custom format sometimes, but it might be somewhat readable
    try:
        with open('models/scaler.pkl', 'rb') as f:
            scaler = pickle.load(f)
            if hasattr(scaler, 'feature_names_in_'):
                print("Features:", list(scaler.feature_names_in_))
            else:
                print("Scaler loaded, but feature_names_in_ not found.")
    except Exception as e:
        print("Scaler Error:", e)

    try:
        with open('models/mortality_model.pkl', 'rb') as f:
            model = pickle.load(f)
            if hasattr(model, 'feature_names_in_'):
                print("Model Features:", list(model.feature_names_in_))
            elif hasattr(model, 'get_booster'):
                print("Model Features (XGB):", model.get_booster().feature_names)
    except Exception as e:
        print("Model Error:", e)

if __name__ == "__main__":
    sniff_features()
