from fastapi import FastAPI, UploadFile, File, HTTPException
import numpy as np
import joblib
import os, tempfile, shutil, subprocess
from fastapi.middleware.cors import CORSMiddleware

from schemas import StudentInput, PredictionResponse, CommunicationEvalResponse
from recommender import recommend_courses_by_score
from predict_pipeline import run_full_evaluation
from featureExtraction import extract_all_features

app = FastAPI(title="Skill Development Recommendation API")

# ─── CORS ───
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ─── Problem Solving Models ───
reg_model = joblib.load(os.path.join(BASE_DIR, "models/problem_solving_regression_model.pkl"))
cls_model = joblib.load(os.path.join(BASE_DIR, "models/problem_solving_classification_model.pkl"))
encoder   = joblib.load(os.path.join(BASE_DIR, "models/label_encoder.pkl"))


# ─────────────────────────────────────────────────────
# Problem Solving Endpoint (existing)
# ─────────────────────────────────────────────────────
@app.post("/predict-and-recommend", response_model=PredictionResponse)
def predict_and_recommend(data: StudentInput):
    X = np.array(data.answers).reshape(1, -1)

    final_score = float(reg_model.predict(X)[0])
    cls_pred    = cls_model.predict(X)
    skill_level = encoder.inverse_transform(cls_pred)[0]
    courses     = recommend_courses_by_score(final_score)

    return {
        "name": data.name,
        "age": data.age,
        "final_score": round(final_score, 2),
        "skill_level": skill_level,
        "recommended_courses": courses
    }


# ─────────────────────────────────────────────────────
# Audio Conversion Helper
# ─────────────────────────────────────────────────────
def convert_to_wav(input_path: str, output_path: str) -> None:
    """
    Convert any audio format (WebM/Opus, OGG, MP4, etc.) to 16kHz mono WAV
    using ffmpeg. This is required because the browser's MediaRecorder sends
    WebM/Opus audio which parselmouth (Praat) and librosa cannot read directly.
    """
    cmd = [
        "ffmpeg",
        "-y",             # overwrite output file without asking
        "-i", input_path, # input: any browser audio format
        "-ac", "1",       # mono channel
        "-ar", "16000",   # 16 kHz sample rate (matches training data)
        "-sample_fmt", "s16",  # 16-bit PCM
        "-f", "wav",      # output format: WAV
        output_path
    ]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode != 0:
        err = result.stderr.decode("utf-8", errors="replace")
        raise RuntimeError(f"ffmpeg conversion failed: {err[-500:]}")


# ─────────────────────────────────────────────────────
# Communication Evaluation Endpoint
# ─────────────────────────────────────────────────────
@app.post("/evaluate-communication", response_model=CommunicationEvalResponse)
async def evaluate_communication(
    files: list[UploadFile] = File(...)
):
    """
    Accepts up to 10 audio files (any browser format — WebM, OGG, MP4, WAV).
    Each file is converted to 16kHz mono WAV via ffmpeg, features are
    extracted, averaged across all answers, and the ML pipeline runs to
    return communication skill scores + course recommendations.
    """
    if len(files) == 0:
        raise HTTPException(status_code=400, detail="No audio files uploaded.")
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 audio files allowed.")

    feature_vectors = []
    tmp_dir = tempfile.mkdtemp()

    try:
        for i, upload in enumerate(files):
            # Determine suffix from uploaded filename (webm, ogg, wav, etc.)
            original_suffix = (
                os.path.splitext(upload.filename)[1] if upload.filename else ".webm"
            )
            raw_path = os.path.join(tmp_dir, f"raw_{i}{original_suffix}")
            wav_path = os.path.join(tmp_dir, f"answer_{i}.wav")

            # Step 1: Save the raw uploaded file
            with open(raw_path, "wb") as f:
                shutil.copyfileobj(upload.file, f)

            print(f"\n[{i+1}/{len(files)}] Received: {upload.filename}")

            # Step 2: Convert to 16kHz mono WAV (ffmpeg handles any input format)
            try:
                convert_to_wav(raw_path, wav_path)
                print(f"  Converted to WAV: {wav_path}")
            except RuntimeError as e:
                raise HTTPException(
                    status_code=422,
                    detail=f"Could not convert audio file {i+1}: {str(e)}"
                )

            # Step 3: Extract features from the WAV
            features = extract_all_features(wav_path)
            feature_vectors.append(features)

    finally:
        # Always clean up temp files
        shutil.rmtree(tmp_dir, ignore_errors=True)

    # Step 4: Average vectors → predict → score → recommend
    result = run_full_evaluation(feature_vectors)
    print(f"\n✅ Evaluation complete: overall_score={result['overall_score']}, level={result['level']}")
    return result
