"""Dataset router — upload, import, preview, clean."""
import shutil
from pathlib import Path
from datetime import datetime
from bson import ObjectId

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends

from app.models.schemas import HFImportRequest, KaggleImportRequest, CleanRequest
from app.services.cleaner import analyze_dataset, apply_cleaning
from app.services.multiplier import DataMultiplier
from app.utils.hf_connector import fetch_hf_dataset
from app.utils.kaggle_connector import fetch_kaggle_dataset
from app.auth import get_optional_user
from app.database import get_db
from app.config import UPLOAD_DIR

router = APIRouter(prefix="/api/datasets", tags=["Datasets"])


@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...), user=Depends(get_optional_user)):
    """Upload a dataset file (CSV, JSON, Audio, Video)."""
    ext = Path(file.filename).suffix.lower()
    if ext not in [".csv", ".json", ".jsonl", ".parquet", ".mp3", ".wav", ".mp4", ".mov"]:
        raise HTTPException(status_code=400, detail=f"Unsupported file format: {ext}")

    # Save uploaded file
    file_path = UPLOAD_DIR / f"{int(datetime.now().timestamp())}_{file.filename}"
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Analyze dataset
    analysis = analyze_dataset(str(file_path))
    analysis["filename"] = file.filename
    analysis["file_path"] = str(file_path)
    analysis["source"] = "upload"

    # Save to DB if available
    db = get_db()
    if db is not None:
        doc = {
            "name": file.filename,
            "source": "upload",
            "file_path": str(file_path),
            "format": ext.lstrip("."),
            "columns": analysis.get("columns", []),
            "row_count": analysis.get("total_rows", 0),
            "quality_score": analysis.get("quality_score", 0),
            "preview_data": analysis.get("preview", []),
            "suggestions": analysis.get("suggestions", []),
            "status": "raw",
            "created_at": datetime.utcnow(),
        }
        if user:
            doc["user_id"] = str(user.get("_id", ""))
        result = await db.datasets.insert_one(doc)
        analysis["id"] = str(result.inserted_id)
        analysis["suggestions"] = doc["suggestions"]
        analysis["file_url"] = f"http://localhost:8000/uploads/{file_path.name}"

    return analysis


@router.post("/import/huggingface")
async def import_from_huggingface(req: HFImportRequest, user=Depends(get_optional_user)):
    """Import a dataset from Hugging Face Hub."""
    result = fetch_hf_dataset(req.dataset_name, req.split)

    db = get_db()
    if db is not None:
        doc = {
            "name": req.dataset_name,
            "source": "huggingface",
            "source_url": f"https://huggingface.co/datasets/{req.dataset_name}",
            "columns": result.get("columns", []),
            "row_count": result.get("total_rows", 0),
            "quality_score": 75,
            "preview_data": result.get("preview", []),
            "status": "raw",
            "created_at": datetime.utcnow(),
        }
        if user:
            doc["user_id"] = str(user.get("_id", ""))
        insert = await db.datasets.insert_one(doc)
        result["id"] = str(insert.inserted_id)

    return result


@router.post("/import/kaggle")
async def import_from_kaggle(req: KaggleImportRequest, user=Depends(get_optional_user)):
    """Import a dataset from Kaggle."""
    result = fetch_kaggle_dataset(req.dataset_id, str(UPLOAD_DIR))

    db = get_db()
    if db is not None:
        doc = {
            "name": req.dataset_id,
            "source": "kaggle",
            "source_url": f"https://www.kaggle.com/datasets/{req.dataset_id}",
            "status": "raw",
            "created_at": datetime.utcnow(),
        }
        if user:
            doc["user_id"] = str(user.get("_id", ""))
        insert = await db.datasets.insert_one(doc)
        result["id"] = str(insert.inserted_id)

    return result


@router.post("/clean")
async def clean_dataset(req: CleanRequest):
    """Apply cleaning actions to a dataset and persist changes."""
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not available")

    dataset = await db.datasets.find_one({"_id": ObjectId(req.dataset_id)})
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    file_path = req.file_path or dataset.get("file_path")
    
    # If we have a file, apply cleaning to it
    if file_path and Path(file_path).exists():
        result = apply_cleaning(file_path, req.actions)
        
        # Update DB with new results
        update_doc = {
            "preview_data": result.get("preview", []),
            "row_count": result.get("cleaned_rows", 0),
            "quality_score": result.get("new_quality_score", 100),
            "status": "cleaned",
            "cleaning_applied": req.actions,
            "file_path": result.get("cleaned_path")  # Save the path to the cleaned file
        }
        await db.datasets.update_one({"_id": ObjectId(req.dataset_id)}, {"$set": update_doc})
        return result
    else:
        # For non-file datasets (like some HF imports), just simulate DB update for now
        update_doc = {
            "quality_score": min(100, dataset.get("quality_score", 0) + 10),
            "status": "cleaned",
            "cleaning_applied": req.actions
        }
        await db.datasets.update_one({"_id": ObjectId(req.dataset_id)}, {"$set": update_doc})
        return {
            "preview": dataset.get("preview_data", []),
            "total_rows": dataset.get("row_count", 0),
            "quality_score": update_doc["quality_score"],
            "actions": req.actions
        }


@router.delete("/{dataset_id}")
async def delete_dataset(dataset_id: str):
    """Delete a dataset from the database and disk."""
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not available")

    dataset = await db.datasets.find_one({"_id": ObjectId(dataset_id)})
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    # Delete physical file if it exists
    file_path = dataset.get("file_path")
    if file_path and Path(file_path).exists():
        try:
            Path(file_path).unlink()
        except Exception as e:
            print(f"Failed to delete file: {e}")

    await db.datasets.delete_one({"_id": ObjectId(dataset_id)})
    return {"message": "Dataset deleted successfully"}


@router.post("/multiply")
async def multiply_dataset(req: dict, user=Depends(get_optional_user)):
    """Multiply a dataset using synthetic data generation."""
    dataset_id = req.get("dataset_id")
    target_count = req.get("target_count", 100)
    
    db = get_db()
    dataset = await db.datasets.find_one({"_id": ObjectId(dataset_id)})
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    file_path = dataset.get("file_path")
    if not file_path or not Path(file_path).exists():
        raise HTTPException(status_code=400, detail="Dataset file not found on disk")

    result = DataMultiplier.generate_synthetic_data(file_path, target_count)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    # Update DB with multiplied data
    update_doc = {
        "preview_data": result.get("preview", []),
        "row_count": result.get("new_count"),
        "status": "multiplied",
        "file_path": result.get("multiplied_file")
    }
    await db.datasets.update_one({"_id": ObjectId(dataset_id)}, {"$set": update_doc})
    
    return result


@router.get("/")
async def list_datasets(user=Depends(get_optional_user)):
    """List all datasets."""
    db = get_db()
    if db is None:
        return {"datasets": []}

    query = {}
    if user:
        query["user_id"] = str(user.get("_id", ""))

    cursor = db.datasets.find(query).sort("created_at", -1).limit(50)
    datasets = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        file_path = doc.get("file_path", "")
        doc["file_url"] = f"http://localhost:8000/uploads/{Path(file_path).name}" if file_path else None
        datasets.append(doc)

    return {"datasets": datasets}
