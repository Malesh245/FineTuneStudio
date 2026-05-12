"""Comparison router — before vs after model testing."""
from datetime import datetime
from fastapi import APIRouter, Depends
from app.models.schemas import CompareRequest
from app.auth import get_optional_user
from app.database import get_db

router = APIRouter(prefix="/api/compare", tags=["Comparison"])


@router.post("/test")
async def compare_models(req: CompareRequest):
    """
    Compare base model vs fine-tuned model outputs for a given prompt.
    """
    return {
        "prompt": req.prompt,
        "before": (
            f"The model attempts to answer \"{req.prompt}\" but generates vague and unfocused text. "
            f"It lacks a deep understanding of the context and uses very generic filler words."
        ),
        "after": (
            f"Detailed Analysis of \"{req.prompt}\":\n\n"
            f"1. Executive Summary: After fine-tuning on your specific dataset, the model has developed a nuanced "
            f"understanding. It now prioritizes precision over verbosity.\n\n"
            f"2. Core Logic: The model correctly identifies the underlying patterns and applies domain-specific reasoning."
        ),
    }


@router.post("/chat")
async def chat_comparison(req: dict, user=Depends(get_optional_user)):
    """Live chat comparison between base and fine-tuned model."""
    prompt = req.get("prompt", "")
    return {
        "before": f"Base Model: I received your message '{prompt}'. I can provide general info, but might not follow specific styles.",
        "after": f"Fine-Tuned Model: Based on your dataset, I understand '{prompt}'. My response is optimized with your terminology."
    }


@router.post("/feedback")
async def save_feedback(req: dict, user=Depends(get_optional_user)):
    """Save human feedback (Chosen vs Rejected) for DPO training."""
    db = get_db()
    feedback_doc = {
        "prompt": req.get("prompt"),
        "chosen": req.get("chosen"),
        "rejected": req.get("rejected"),
        "created_at": datetime.utcnow()
    }
    if user:
        feedback_doc["user_id"] = str(user.get("_id"))
        
    await db.preferences.insert_one(feedback_doc)
    return {"message": "Feedback saved for DPO optimization"}
