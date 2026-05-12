"""Dataset Builder router — create instruction-tuning datasets visually."""
from datetime import datetime
from fastapi import APIRouter, Depends
from app.auth import get_optional_user
from app.database import get_db

router = APIRouter(prefix="/api/builder", tags=["Dataset Builder"])


@router.post("/save")
async def save_dataset(req: dict, user=Depends(get_optional_user)):
    """Save a hand-crafted instruction dataset."""
    db = get_db()
    pairs = req.get("pairs", [])
    name = req.get("name", "My Custom Dataset")
    format_type = req.get("format", "alpaca")  # alpaca, sharegpt, chatml
    
    # Convert pairs to the chosen format
    formatted = []
    for p in pairs:
        if format_type == "alpaca":
            formatted.append({
                "instruction": p.get("instruction", ""),
                "input": p.get("input", ""),
                "output": p.get("output", ""),
            })
        elif format_type == "sharegpt":
            formatted.append({
                "conversations": [
                    {"from": "human", "value": p.get("instruction", "")},
                    {"from": "gpt", "value": p.get("output", "")},
                ]
            })
        elif format_type == "chatml":
            formatted.append({
                "messages": [
                    {"role": "user", "content": p.get("instruction", "")},
                    {"role": "assistant", "content": p.get("output", "")},
                ]
            })

    doc = {
        "name": name,
        "format": format_type,
        "pairs": formatted,
        "pair_count": len(formatted),
        "created_at": datetime.utcnow(),
        "source": "builder",
    }
    if user:
        doc["user_id"] = str(user.get("_id"))

    result = await db.built_datasets.insert_one(doc)
    
    return {
        "id": str(result.inserted_id),
        "name": name,
        "pair_count": len(formatted),
        "format": format_type,
        "preview": formatted[:3],
    }


@router.get("/")
async def list_built_datasets(user=Depends(get_optional_user)):
    """List all hand-crafted datasets."""
    db = get_db()
    query = {}
    if user:
        query["user_id"] = str(user.get("_id"))
    
    cursor = db.built_datasets.find(query).sort("created_at", -1).limit(50)
    datasets = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        datasets.append(doc)
    
    return {"datasets": datasets}
