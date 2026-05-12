"""Knowledge Distillation router."""
from fastapi import APIRouter, Depends
from app.services.distillation import DistillationEngine
from app.auth import get_optional_user

router = APIRouter(prefix="/api/distillation", tags=["Distillation"])


@router.get("/models")
async def get_model_pairs():
    """Get available teacher/student model pairs."""
    return DistillationEngine.get_model_pairs()


@router.post("/start")
async def start_distillation(req: dict, user=Depends(get_optional_user)):
    """Start knowledge distillation from teacher to student."""
    teacher_id = req.get("teacher_id")
    student_id = req.get("student_id")
    dataset_rows = req.get("dataset_rows", 1000)
    
    result = DistillationEngine.distill(teacher_id, student_id, dataset_rows)
    return result
