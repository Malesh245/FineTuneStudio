"""Application configuration — loads from environment variables."""
import os
from pathlib import Path


# === Paths ===
BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
MODEL_OUTPUT_DIR = BASE_DIR / "model_outputs"
MODEL_OUTPUT_DIR.mkdir(exist_ok=True)

# === MongoDB ===
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "finetunestudio")

# === JWT Auth ===
JWT_SECRET = os.getenv("JWT_SECRET", "finetunestudio-super-secret-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = 7

# === API Keys (user-provided, stored per user in DB) ===
# These are just defaults for development
HF_TOKEN = os.getenv("HF_TOKEN", "")
KAGGLE_USERNAME = os.getenv("KAGGLE_USERNAME", "")
KAGGLE_KEY = os.getenv("KAGGLE_KEY", "")

# === Server ===
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
DEBUG = os.getenv("DEBUG", "true").lower() == "true"
