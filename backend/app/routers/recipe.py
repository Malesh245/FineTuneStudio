from fastapi import APIRouter, Depends
from app.auth import get_optional_user
from app.database import get_db

router = APIRouter(prefix="/api/recipes", tags=["Recipes"])

# Mock recipes for the community hub
DEFAULT_RECIPES = [
    {
        "id": "1",
        "name": "Medical Assistant Llama",
        "description": "Optimized for medical Q&A and terminology. Uses high LoRA rank for complex knowledge absorption.",
        "model": "meta-llama/Llama-3.2-1B",
        "config": {"epochs": 5, "learning_rate": 5e-5, "lora_rank": 64, "lora_alpha": 128},
        "author": "DrAI",
        "stars": 128
    },
    {
        "id": "2",
        "name": "Creative Storyteller",
        "description": "Fine-tuned for long-form narrative consistency and descriptive prose.",
        "model": "mistralai/Mistral-7B-v0.1",
        "config": {"epochs": 3, "learning_rate": 2e-4, "lora_rank": 16, "lora_alpha": 32},
        "author": "StorySmith",
        "stars": 85
    },
    {
        "id": "3",
        "name": "SQL Query Master",
        "description": "Converts natural language to complex SQL queries with high accuracy.",
        "model": "google/gemma-2b",
        "config": {"epochs": 10, "learning_rate": 1e-4, "lora_rank": 32, "lora_alpha": 64},
        "author": "DataWizard",
        "stars": 210
    }
]

@router.get("/")
async def list_recipes():
    """List all community recipes."""
    # In production, fetch from MongoDB
    return {"recipes": DEFAULT_RECIPES}

@router.post("/clone/{recipe_id}")
async def clone_recipe(recipe_id: str, user=Depends(get_optional_user)):
    """Clone a recipe to user's local training config."""
    recipe = next((r for r in DEFAULT_RECIPES if r["id"] == recipe_id), None)
    return {"message": "Recipe cloned successfully", "recipe": recipe}
