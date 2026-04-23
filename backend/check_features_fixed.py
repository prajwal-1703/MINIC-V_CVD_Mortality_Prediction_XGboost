import joblib
import sys

def main():
    try:
        scaler = joblib.load('models/scaler.pkl')
        print("--- Scaler Features ---")
        if hasattr(scaler, 'feature_names_in_'):
            print(list(scaler.feature_names_in_))
        else:
            print("No feature_names_in_ found on scaler.")
    except Exception as e:
        print("Scaler error:", e)

    try:
        model = joblib.load('models/mortality_model.pkl')
        print("--- Model Features ---")
        if hasattr(model, 'feature_names_in_'):
            print(list(model.feature_names_in_))
        elif hasattr(model, 'get_booster'):
            print(model.get_booster().feature_names)
        else:
            print("Could not find feature names on model natively. Type:", type(model))
            # Fallback for some wrappers
            if hasattr(model, 'estimators_'):
                print("It's an ensemble. Maybe no generic feature names.")
    except Exception as e:
        print("Model error:", e)

if __name__ == '__main__':
    main()
