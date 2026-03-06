import os
import json
import re
import numpy as np
import pandas as pd
import librosa
import parselmouth
import spacy
import textstat
import whisper
from collections import Counter
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS
from sentence_transformers import SentenceTransformer

# ─────────────────────────────────────────
# Load Models Once (avoid reloading on each call)
# ─────────────────────────────────────────
print("Loading models...")
whisper_model   = whisper.load_model("medium")
sbert_model     = SentenceTransformer('all-MiniLM-L6-v2')
nlp_model       = spacy.load("en_core_web_sm")
print("Models loaded.")

# Word lists
filler_words = {"um", "uh", "like", "you know", "actually", "basically"}
weak_words   = {"maybe", "i think", "perhaps", "sort of", "kind of"}
strong_words = {"definitely", "clearly", "confidently", "certainly", "strongly"}
connectors   = {"however", "therefore", "moreover", "firstly", "secondly",
                "in conclusion", "for example", "on the other hand"}


# ─────────────────────────────────────────
# 1. Transcribe Audio
# ─────────────────────────────────────────
def transcribe_audio(audio_path: str) -> dict:
    """
    Transcribes audio using Whisper with word timestamps.
    Returns dict with clean_text and word_timestamps.
    """
    result = whisper_model.transcribe(audio_path, word_timestamps=True)

    segments  = result["segments"]
    full_text = result["text"]
    clean_text = full_text.strip().lower()

    word_data = []
    for seg in segments:
        for word in seg["words"]:
            word_data.append({
                "word":  word["word"].strip(),
                "start": round(word["start"], 3),
                "end":   round(word["end"], 3)
            })

    return {
        "clean_text":      clean_text,
        "word_timestamps": word_data
    }


# ─────────────────────────────────────────
# 2. Extract Acoustic Features
# ─────────────────────────────────────────
def extract_audio_features(audio_path: str, transcript: dict) -> np.ndarray:
    """
    Extracts acoustic + fluency features from audio file.
    Returns a 1D numpy array.
    """
    y, sr    = librosa.load(audio_path, sr=16000)
    duration = librosa.get_duration(y=y, sr=sr)

    # Energy
    rms     = librosa.feature.rms(y=y)[0]
    rms_mean = np.mean(rms)
    rms_std  = np.std(rms)

    # Pitch (Praat)
    snd          = parselmouth.Sound(audio_path)
    pitch        = snd.to_pitch()
    pitch_values = pitch.selected_array['frequency']
    pitch_values = pitch_values[pitch_values > 0]
    pitch_mean   = np.mean(pitch_values) if len(pitch_values) > 0 else 0
    pitch_std    = np.std(pitch_values)  if len(pitch_values) > 0 else 0

    # Spectral
    mfcc              = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfcc_mean         = np.mean(mfcc, axis=1)
    mfcc_std          = np.std(mfcc,  axis=1)
    zcr               = np.mean(librosa.feature.zero_crossing_rate(y))
    spectral_centroid = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))
    spectral_bandwidth= np.mean(librosa.feature.spectral_bandwidth(y=y, sr=sr))

    # Fluency (from word timestamps)
    words      = transcript.get("word_timestamps", [])
    total_words = len(words)
    wpm        = (total_words / duration) * 60 if duration > 0 else 0

    pauses = []
    for i in range(1, len(words)):
        pause = words[i]["start"] - words[i-1]["end"]
        if pause > 0:
            pauses.append(pause)

    avg_pause  = np.mean(pauses)       if pauses else 0
    pause_freq = len(pauses) / duration if duration > 0 else 0

    base_features = np.array([
        duration, rms_mean, rms_std,
        pitch_mean, pitch_std,
        zcr, spectral_centroid, spectral_bandwidth,
        wpm, avg_pause, pause_freq
    ])

    # Flatten MFCCs: 13 means + 13 stds = 26 values
    mfcc_features = np.concatenate([mfcc_mean, mfcc_std])

    return np.concatenate([base_features, mfcc_features])  # shape: (37,)


# ─────────────────────────────────────────
# 3. Extract NLP Features
# ─────────────────────────────────────────
def extract_nlp_features(text: str) -> np.ndarray:
    """
    Extracts NLP features from transcript text.
    Returns a 1D numpy array.
    """
    doc   = nlp_model(text)
    words = [token.text.lower() for token in doc if token.is_alpha]
    total_words  = len(words)
    unique_words = len(set(words))

    ttr             = unique_words / total_words if total_words > 0 else 0
    avg_word_len    = np.mean([len(w) for w in words]) if words else 0
    lexical_density = len([w for w in words if w not in ENGLISH_STOP_WORDS]) / total_words if total_words > 0 else 0

    filler_count = sum(1 for w in words if w in filler_words)
    filler_ratio = filler_count / total_words if total_words > 0 else 0
    readability  = textstat.flesch_reading_ease(text)

    sentences        = list(doc.sents)
    sentence_lengths = [len([t for t in sent if t.is_alpha]) for sent in sentences]
    sentence_length_std = np.std(sentence_lengths) if sentence_lengths else 0

    connector_count = sum(1 for w in words if w in connectors)
    connector_ratio = connector_count / total_words if total_words > 0 else 0
    sentence_count  = len(sentences)

    weak_count   = sum(text.lower().count(w) for w in weak_words)
    strong_count = sum(text.lower().count(w) for w in strong_words)
    weak_ratio   = weak_count   / total_words if total_words > 0 else 0
    strong_ratio = strong_count / total_words if total_words > 0 else 0
    first_person_ratio = words.count("i") / total_words if total_words > 0 else 0

    return np.array([
        total_words, unique_words, ttr, avg_word_len, lexical_density,
        filler_ratio, readability, sentence_length_std,
        connector_ratio, sentence_count,
        weak_ratio, strong_ratio, first_person_ratio
    ])  # shape: (13,)


# ─────────────────────────────────────────
# 4. Get BERT Embedding
# ─────────────────────────────────────────
def get_bert_embedding(text: str) -> np.ndarray:
    """
    Returns SBERT embedding for the given text.
    Returns a 1D numpy array of shape (384,).
    """
    return sbert_model.encode(text)


# ─────────────────────────────────────────
# 5. Unified Inference Function
# ─────────────────────────────────────────
def extract_all_features(audio_path: str) -> np.ndarray:
    """
    Full pipeline: audio → transcript → acoustic + NLP + BERT features.

    Returns a single concatenated feature vector:
        [acoustic(37) | nlp(13) | bert(384)] = 434 dims
    """
    print(f"  Transcribing:      {os.path.basename(audio_path)}")
    transcript = transcribe_audio(audio_path)
    clean_text = transcript["clean_text"]

    print(f"  Acoustic features: extracting...")
    acoustic  = extract_audio_features(audio_path, transcript)

    print(f"  NLP features:      extracting...")
    nlp_feats = extract_nlp_features(clean_text)

    print(f"  BERT embedding:    encoding...")
    embedding = get_bert_embedding(clean_text)

    final_vector = np.concatenate([acoustic, nlp_feats, embedding])
    print(f"  Feature vector shape: {final_vector.shape}")  # (434,)

    return final_vector


# ─────────────────────────────────────────
# Example Usage
# ─────────────────────────────────────────
if __name__ == "__main__":
    audio_file = "data/processed_audio/sample.wav"
    features   = extract_all_features(audio_file)
    print("Final feature vector shape:", features.shape)