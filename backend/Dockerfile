# ─── Python Base Image ─────────────────────
FROM python:3.10-slim AS base

# ─── Install System Dependencies ───────────
# We need ffmpeg for WebM -> WAV conversion
# We need libsndfile1 for librosa/soundfile
# We need build-essential for compiling C extensions (if any)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsndfile1 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ─── Install Python Dependencies ───────────
COPY requirements.txt .

# Install dependencies (no-cache for smaller image)
RUN pip install --no-cache-dir -r requirements.txt

# Download the spaCy English model required by the pipeline
RUN python -m spacy download en_core_web_sm

# ─── Copy Application Code ─────────────────
COPY . .

# Expose FastAPI default port
EXPOSE 8000

# Run Uvicorn server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
