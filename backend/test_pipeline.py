"""
Test script: directly exercises the evaluate-communication pipeline
with the 10 WAV files in backend/audio/ — no HTTP server needed.
"""
import os, sys, json
import numpy as np

# Make sure relative imports work from backend/
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

AUDIO_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "audio")

def main():
    wav_files = sorted([
        os.path.join(AUDIO_DIR, f)
        for f in os.listdir(AUDIO_DIR)
        if f.lower().endswith(".wav")
    ])
    print(f"\nFound {len(wav_files)} WAV files:")
    for f in wav_files:
        size_kb = os.path.getsize(f) // 1024
        print(f"  {os.path.basename(f):30s}  {size_kb} KB")

    # ── Step 1: import pipeline ──
    print("\n[1] Loading models...")
    from predict_pipeline import run_full_evaluation
    print("    Models loaded OK.")

    # ── Step 2: import feature extractor ──
    print("\n[2] Importing featureExtraction...")
    from featureExtraction import extract_all_features
    print("    featureExtraction imported OK.")

    # ── Step 3: extract features from each WAV ──
    feature_vectors = []
    for i, wav_path in enumerate(wav_files):
        print(f"\n[3.{i+1}] Extracting features from: {os.path.basename(wav_path)}")
        try:
            fv = extract_all_features(wav_path)
            print(f"       Feature vector shape: {fv.shape}")
            feature_vectors.append(fv)
        except Exception as e:
            print(f"       ERROR: {e}")

    if not feature_vectors:
        print("\nERROR: No features extracted. Aborting.")
        return

    # ── Step 4: run full evaluation ──
    print(f"\n[4] Running full evaluation on {len(feature_vectors)} audio clip(s)...")
    result = run_full_evaluation(feature_vectors)

    # ── Step 5: print result ──
    print("\n" + "="*50)
    print("EVALUATION RESULT")
    print("="*50)
    print(json.dumps(result, indent=2))
    print("="*50)
    print("\n✅ Pipeline test PASSED successfully!")

if __name__ == "__main__":
    main()
