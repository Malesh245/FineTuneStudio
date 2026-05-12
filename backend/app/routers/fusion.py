"""Model Fusion router — merge multiple models."""
from fastapi import APIRouter, Depends
from app.services.fusion import ModelFusion
from app.auth import get_optional_user

router = APIRouter(prefix="/api/fusion", tags=["Model Fusion"])


@router.get("/methods")
async def list_methods():
    """List all available merge methods."""
    return {"methods": ModelFusion.get_methods()}


@router.post("/merge")
async def merge_models(req: dict, user=Depends(get_optional_user)):
    """Merge multiple models using the specified method."""
    models = req.get("models", [])
    method = req.get("method", "slerp")
    weights = req.get("weights")
    
    result = ModelFusion.merge_models(models, method, weights)
    return result
