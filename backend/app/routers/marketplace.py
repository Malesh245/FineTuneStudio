"""Model Marketplace router — browse, publish, and discover fine-tuned models."""
from datetime import datetime
from fastapi import APIRouter, Depends
from app.auth import get_optional_user

router = APIRouter(prefix="/api/marketplace", tags=["Marketplace"])

FEATURED_MODELS = [
    {
        "id": "m1", "name": "MedAssist-7B", "author": "DrAI_Labs",
        "description": "Medical Q&A assistant trained on 50K clinical conversations. HIPAA-aware responses.",
        "model_id": "mistralai/Mistral-7B-v0.1", "category": "Healthcare",
        "downloads": 12400, "stars": 342, "price": "free",
        "tags": ["medical", "clinical", "Q&A"], "accuracy": 94.2,
    },
    {
        "id": "m2", "name": "CodeForge-3B", "author": "DevOps_Pro",
        "description": "Code generation specialist for Python, TypeScript, and Rust. Trained on 100K code reviews.",
        "model_id": "microsoft/phi-2", "category": "Coding",
        "downloads": 28900, "stars": 567, "price": "free",
        "tags": ["code", "python", "typescript"], "accuracy": 91.5,
    },
    {
        "id": "m3", "name": "LegalEagle-1B", "author": "LawTech",
        "description": "Contract analysis and legal document summarization. Trained on 30K legal briefs.",
        "model_id": "meta-llama/Llama-3.2-1B", "category": "Legal",
        "downloads": 5600, "stars": 189, "price": "$9.99/mo",
        "tags": ["legal", "contracts", "compliance"], "accuracy": 89.8,
    },
    {
        "id": "m4", "name": "FinanceGPT-2B", "author": "WallStreetAI",
        "description": "Financial analysis, earnings call summarization, and market sentiment detection.",
        "model_id": "google/gemma-2b", "category": "Finance",
        "downloads": 8900, "stars": 256, "price": "$19.99/mo",
        "tags": ["finance", "stocks", "analysis"], "accuracy": 92.1,
    },
    {
        "id": "m5", "name": "TutorBot-1B", "author": "EduAI",
        "description": "Socratic teaching assistant that guides students through problem-solving steps.",
        "model_id": "meta-llama/Llama-3.2-1B", "category": "Education",
        "downloads": 15200, "stars": 423, "price": "free",
        "tags": ["education", "tutoring", "math"], "accuracy": 88.7,
    },
    {
        "id": "m6", "name": "ChefAI-Mini", "author": "FoodieML",
        "description": "Recipe generation and meal planning based on dietary restrictions and ingredients.",
        "model_id": "distilgpt2", "category": "Lifestyle",
        "downloads": 3200, "stars": 98, "price": "free",
        "tags": ["cooking", "recipes", "nutrition"], "accuracy": 85.3,
    },
]

CATEGORIES = ["All", "Healthcare", "Coding", "Legal", "Finance", "Education", "Lifestyle", "Creative"]


@router.get("/")
async def list_marketplace():
    """List all marketplace models."""
    return {"models": FEATURED_MODELS, "categories": CATEGORIES}


@router.get("/model/{model_id}")
async def get_model(model_id: str):
    """Get details of a specific marketplace model."""
    model = next((m for m in FEATURED_MODELS if m["id"] == model_id), None)
    if not model:
        return {"error": "Model not found"}
    return model


@router.post("/publish")
async def publish_model(req: dict, user=Depends(get_optional_user)):
    """Publish a model to the marketplace."""
    return {
        "message": "Model published successfully! It will appear in the marketplace after review.",
        "model_name": req.get("name"),
        "status": "pending_review",
    }
