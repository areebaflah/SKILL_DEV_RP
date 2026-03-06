import os
import joblib
import numpy as np

# ─────────────────────────────────────────
# Load Models Once (at import time)
# ─────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

print("Loading communication skill models...")
comm_model = joblib.load(os.path.join(BASE_DIR, "models/communication_skill_model.pkl"))
scaler     = joblib.load(os.path.join(BASE_DIR, "models/scaler.pkl"))
pca        = joblib.load(os.path.join(BASE_DIR, "models/pca.pkl"))
print("Communication models loaded.")

# ─────────────────────────────────────────
# Skill Level Bands
# ─────────────────────────────────────────
SKILL_LEVELS = [
    (4.5, "Excellent"),
    (3.5, "Advanced"),
    (2.5, "Intermediate"),
    (1.5, "Beginner"),
    (0.0, "Needs Improvement"),
]

# ─────────────────────────────────────────
# Course Catalog
# ─────────────────────────────────────────
COMM_COURSE_CATALOG = {
    "Fluency Mastery Course": {
        "label": "Fluency Mastery Course",
        "platform": "Coursera",
        "url": "https://www.coursera.org/learn/fluency",
        "reason": "To improve your speaking fluency and reduce hesitations",
    },
    "Public Speaking Confidence Training": {
        "label": "Public Speaking Confidence Training",
        "platform": "Udemy",
        "url": "https://www.udemy.com/course/public-speaking-confidence",
        "reason": "To build confidence when speaking to audiences",
    },
    "Advanced Vocabulary Builder Program": {
        "label": "Advanced Vocabulary Builder Program",
        "platform": "YouTube",
        "url": "https://www.youtube.com/results?search_query=advanced+vocabulary+builder",
        "reason": "To expand your vocabulary and word variety",
    },
    "Structured Communication Course": {
        "label": "Structured Communication Course",
        "platform": "edX",
        "url": "https://www.edx.org/learn/communication",
        "reason": "To organise your ideas and communicate in a clearer structure",
    },
    "Clear Speaking & Articulation Program": {
        "label": "Clear Speaking & Articulation Program",
        "platform": "YouTube",
        "url": "https://www.youtube.com/results?search_query=speaking+clarity+articulation",
        "reason": "To improve your pronunciation and overall clarity",
    },
    "Complete Communication Bootcamp": {
        "label": "Complete Communication Bootcamp",
        "platform": "Udemy",
        "url": "https://www.udemy.com/course/communication-skills-bootcamp",
        "reason": "A comprehensive program covering all communication dimensions",
    },
}


# ─────────────────────────────────────────
# Feature Vector Remapping
# ─────────────────────────────────────────
def remap_to_scaler_format(raw_vector: np.ndarray) -> np.ndarray:
    """
    featureExtraction.py produces a 434-dim vector with:
        [0:11]   = 11 acoustic base features
        [11:24]  = mfcc_mean[0..12]  (13 values, all means first)
        [24:37]  = mfcc_std[0..12]   (13 values, all stds after)
        [37:50]  = 13 NLP features
        [50:434] = 384 BERT embeddings (emb_1..emb_384)

    The scaler was fitted on a 433-dim DataFrame with:
        [0:11]   = 11 acoustic base features  (same order)
        [11:37]  = MFCCs interleaved: mfcc1_mean, mfcc1_std, ..., mfcc13_mean, mfcc13_std
        [37:50]  = 13 NLP features  (same order)
        [50:433] = 383 BERT embeddings — emb_224 (index 223, 0-based) was absent in training data

    This function remaps raw_vector (434) → scaler_vector (433).
    """
    acoustic_base = raw_vector[0:11]      # shape (11,)

    mfcc_means = raw_vector[11:24]        # shape (13,)
    mfcc_stds  = raw_vector[24:37]        # shape (13,)
    # Interleave: [mean0, std0, mean1, std1, ...]
    mfcc_interleaved = np.empty(26, dtype=np.float64)
    mfcc_interleaved[0::2] = mfcc_means
    mfcc_interleaved[1::2] = mfcc_stds

    nlp_features = raw_vector[37:50]      # shape (13,)

    bert_full = raw_vector[50:434]        # shape (384,)
    # Drop index 223 (emb_224 in 1-based naming) — absent during training
    bert_trimmed = np.delete(bert_full, 223)  # shape (383,)

    return np.concatenate([acoustic_base, mfcc_interleaved, nlp_features, bert_trimmed])


# ─────────────────────────────────────────
# 1. Predict Scores
# ─────────────────────────────────────────
def predict_scores(feature_vector: np.ndarray) -> dict:
    """
    Takes a raw feature vector (434 dims from featureExtraction.py),
    remaps to 433-dim scaler format, applies scaler + PCA,
    runs the model, and returns a dict of 5 sub-scores.
    """
    mapped = remap_to_scaler_format(feature_vector)
    import pandas as pd
    # Wrap in DataFrame with the scaler's expected column names
    df = pd.DataFrame([mapped], columns=scaler.feature_names_in_)
    fv = scaler.transform(df)
    # NOTE: pca.pkl exists but the XGBoost model was trained on the full
    # 433-dim scaler output (not on PCA components) — skip PCA here.

    prediction = comm_model.predict(fv)[0]

    # Clamp scores to [1, 5] range
    scores = {
        "clarity":    round(float(np.clip(prediction[0], 1, 5)), 2),
        "vocabulary": round(float(np.clip(prediction[1], 1, 5)), 2),
        "fluency":    round(float(np.clip(prediction[2], 1, 5)), 2),
        "structure":  round(float(np.clip(prediction[3], 1, 5)), 2),
        "confidence": round(float(np.clip(prediction[4], 1, 5)), 2),
    }
    return scores


# ─────────────────────────────────────────
# 2. Calculate Overall Score
# ─────────────────────────────────────────
def calculate_overall_score(scores: dict) -> float:
    """
    Weighted average of 5 sub-scores.
    Clarity + Fluency slightly weighted more for overall readability.
    """
    weights = {
        "clarity":    0.25,
        "vocabulary": 0.15,
        "fluency":    0.25,
        "structure":  0.20,
        "confidence": 0.15,
    }
    overall = sum(scores[k] * weights[k] for k in scores)
    return round(overall, 2)


# ─────────────────────────────────────────
# 3. Get Skill Level
# ─────────────────────────────────────────
def get_skill_level(overall: float) -> str:
    for threshold, label in SKILL_LEVELS:
        if overall >= threshold:
            return label
    return "Needs Improvement"


# ─────────────────────────────────────────
# 4. Recommend Courses
# ─────────────────────────────────────────
def recommend_courses(scores: dict, overall: float) -> list:
    """
    Rule-based recommender. Returns a list of course dicts.
    """
    reco_keys = []

    if scores["fluency"] < 3:
        reco_keys.append("Fluency Mastery Course")
    if scores["confidence"] < 3:
        reco_keys.append("Public Speaking Confidence Training")
    if scores["vocabulary"] < 3:
        reco_keys.append("Advanced Vocabulary Builder Program")
    if scores["structure"] < 3:
        reco_keys.append("Structured Communication Course")
    if scores["clarity"] < 3:
        reco_keys.append("Clear Speaking & Articulation Program")
    if overall < 2.5:
        reco_keys.append("Complete Communication Bootcamp")

    # If user is excellent — recommend only the advanced course
    if not reco_keys:
        reco_keys.append("Complete Communication Bootcamp")

    return [COMM_COURSE_CATALOG[k] for k in reco_keys]


# ─────────────────────────────────────────
# 5. Full Evaluation (averages N feature vectors)
# ─────────────────────────────────────────
def run_full_evaluation(feature_vectors: list) -> dict:
    """
    Accepts a list of 1D numpy arrays (one per answer).
    Averages them, runs prediction and scoring, returns full result dict.
    """
    final_vector = np.mean(feature_vectors, axis=0)

    scores  = predict_scores(final_vector)
    overall = calculate_overall_score(scores)
    level   = get_skill_level(overall)
    courses = recommend_courses(scores, overall)

    return {
        **scores,
        "overall_score":        overall,
        "level":                level,
        "recommended_courses":  courses,
    }
