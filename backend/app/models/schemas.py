"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ============ Auth ============
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class SettingsUpdate(BaseModel):
    name: Optional[str] = None
    hf_token: Optional[str] = None
    kaggle_username: Optional[str] = None
    kaggle_key: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    plan: str = "free"


class TokenResponse(BaseModel):
    token: str
    user: UserResponse


# ============ Dataset ============
class HFImportRequest(BaseModel):
    dataset_name: str
    split: str = "train"


class KaggleImportRequest(BaseModel):
    dataset_id: str


class CleanRequest(BaseModel):
    dataset_id: str
    file_path: Optional[str] = None
    actions: list[str]


class ColumnInfo(BaseModel):
    name: str
    type: str


# ============ Training ============
class TrainingConfig(BaseModel):
    dataset_id: Optional[str] = None
    dataset_path: Optional[str] = None
    model_name: str = "distilgpt2"
    epochs: int = 3
    learning_rate: float = 0.0002
    batch_size: int = 8
    lora_rank: int = 16
    lora_alpha: int = 32
    warmup_steps: int = 100
    weight_decay: float = 0.01
    max_length: int = 512
    gpu_provider: str = "local"


# ============ Comparison ============
class CompareRequest(BaseModel):
    prompt: str
    base_model: str = "distilgpt2"
    finetuned_model_path: str = ""


# ============ Deployment ============
class DeployRequest(BaseModel):
    job_id: Optional[str] = None
    model_path: str = ""
    repo_name: str = "my-finetuned-model"
    hf_token: str = ""
    private: bool = False
