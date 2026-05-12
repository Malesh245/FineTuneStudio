"""Training router — start jobs, get status, list models."""
from datetime import datetime

from fastapi import APIRouter, Depends

from app.models.schemas import TrainingConfig
from app.services.trainer import run_finetuning
from app.services.quantizer import ModelQuantizer
from app.services.notebook_gen import NotebookGenerator
from app.services.copilot import TrainingCopilot
from app.auth import get_optional_user
from app.database import get_db

router = APIRouter(prefix="/api/training", tags=["Training"])

AVAILABLE_MODELS = [
    {"id": "distilgpt2", "name": "DistilGPT-2", "org": "Hugging Face", "params": "82M", "type": "text", "recommended": True},
    {"id": "gpt2", "name": "GPT-2", "org": "OpenAI", "params": "124M", "type": "text", "recommended": False},
    {"id": "meta-llama/Llama-3.2-1B", "name": "Llama 3.2 1B", "org": "Meta", "params": "1B", "type": "text", "recommended": False},
    {"id": "google/flan-t5-small", "name": "Flan-T5 Small", "org": "Google", "params": "80M", "type": "text", "recommended": False},
    {"id": "microsoft/phi-2", "name": "Phi-2", "org": "Microsoft", "params": "2.7B", "type": "text", "recommended": False},
    {"id": "mistralai/Mistral-7B-v0.1", "name": "Mistral 7B", "org": "Mistral AI", "params": "7B", "type": "text", "recommended": False},
    {"id": "google/gemma-2b", "name": "Gemma 2B", "org": "Google", "params": "2B", "type": "text", "recommended": False},
    {"id": "Qwen/Qwen1.5-1.8B", "name": "Qwen 1.5", "org": "Alibaba Cloud", "params": "1.8B", "type": "text", "recommended": False},
    {"id": "bert-base-uncased", "name": "BERT Base", "org": "Google", "params": "110M", "type": "text", "recommended": False},
    {"id": "roberta-base", "name": "RoBERTa Base", "org": "Facebook", "params": "125M", "type": "text", "recommended": False},
    {"id": "liquidai/lfm-1b", "name": "LFM-1B", "org": "Liquid AI", "params": "1B", "type": "text", "recommended": False},
    {"id": "liquidai/lfm-3b", "name": "LFM-3B", "org": "Liquid AI", "params": "3B", "type": "text", "recommended": False},
    {"id": "liquidai/lfm-7b", "name": "LFM-7B", "org": "Liquid AI", "params": "7B", "type": "text", "recommended": False},
    {"id": "custom", "name": "Custom Hugging Face Model", "org": "Hugging Face", "params": "Any", "type": "text", "recommended": False, "custom": True},
    {"id": "custom-liquid", "name": "Custom Liquid Model", "org": "Liquid AI", "params": "Any", "type": "text", "recommended": False, "custom": True},
]


@router.get("/models")
async def list_models():
    """List available models for fine-tuning."""
    return {"models": AVAILABLE_MODELS}


@router.post("/start")
async def start_training(config: TrainingConfig, user=Depends(get_optional_user)):
    """Start a fine-tuning job."""
    # Run training (demo mode returns simulated metrics)
    result = run_finetuning(config.model_dump())

    # Save job to DB
    db = get_db()
    if db is not None:
        job_doc = {
            "model_name": config.model_name,
            "model_type": "text",
            "config": config.model_dump(),
            "status": result.get("status", "completed"),
            "progress": 100,
            "metrics": result.get("metrics", {}),
            "output_path": result.get("output_path", ""),
            "gpu_provider": config.gpu_provider,
            "started_at": datetime.utcnow(),
            "completed_at": datetime.utcnow(),
            "created_at": datetime.utcnow(),
        }
        if user:
            job_doc["user_id"] = str(user.get("_id", ""))
        if config.dataset_id:
            job_doc["dataset_id"] = config.dataset_id

        insert = await db.training_jobs.insert_one(job_doc)
        result["job_id"] = str(insert.inserted_id)

    return result


@router.get("/jobs")
async def list_jobs(user=Depends(get_optional_user)):
    """List all training jobs."""
    db = get_db()
    if db is None:
        return {"jobs": []}

    query = {}
    if user:
        query["user_id"] = str(user.get("_id", ""))

    cursor = db.training_jobs.find(query).sort("created_at", -1).limit(50)
    jobs = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        jobs.append(doc)

    return {"jobs": jobs}


@router.get("/jobs/{job_id}")
async def get_job(job_id: str):
    """Get a specific training job."""
    db = get_db()
    if db is None:
        return {"error": "Database not available"}

    from bson import ObjectId
    job = await db.training_jobs.find_one({"_id": ObjectId(job_id)})
    if not job:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Job not found")

    job["id"] = str(job.pop("_id"))
    return job


@router.post("/quantize")
async def quantize_model(req: dict, user=Depends(get_optional_user)):
    """Shrink a model using quantization."""
    model_id = req.get("model_id")
    format = req.get("format", "4bit")
    
    # In a real app, we'd lookup the model path in the DB
    result = ModelQuantizer.quantize_model(model_id, format)
    return result


@router.get("/export-notebook")
async def export_notebook(model_name: str = "distilgpt2", epochs: int = 3, lr: float = 2e-4):
    """Generate and return a pre-filled Jupyter notebook."""
    content = NotebookGenerator.generate_colab_notebook({
        "model_name": model_name,
        "epochs": epochs,
        "learning_rate": lr
    })
    return {"notebook": content}


@router.post("/copilot/recommend")
async def copilot_recommend(req: dict, user=Depends(get_optional_user)):
    """AI Copilot: recommend optimal hyperparameters."""
    model_name = req.get("model_name", "distilgpt2")
    dataset_rows = req.get("dataset_rows", 100)
    domain = req.get("domain", "general")
    
    result = TrainingCopilot.recommend(model_name, dataset_rows, domain)
    return result
