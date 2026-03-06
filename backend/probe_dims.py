import joblib, os
BASE = os.path.dirname(os.path.abspath(__file__))
sc  = joblib.load(os.path.join(BASE, "models/scaler.pkl"))
names = sc.feature_names_in_
print(f"Total scaler features: {len(names)}")
print("\nAll feature names:")
for i, n in enumerate(names):
    print(f"  [{i:3d}] {n}")
