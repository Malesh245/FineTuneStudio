"""Deployment router — push models to Hugging Face Hub."""
from datetime import datetime

from fastapi import APIRouter, Depends

from app.models.schemas import DeployRequest
from app.services.deployer import deploy_to_huggingface
from app.auth import get_optional_user
from app.database import get_db

router = APIRouter(prefix="/api/deploy", tags=["Deployment"])


@router.post("/")
async def deploy_model(req: DeployRequest, user=Depends(get_optional_user)):
    """Deploy a fine-tuned model to Hugging Face Hub."""
    # Get HF token from user settings if not provided
    hf_token = req.hf_token
    if not hf_token and user:
        hf_token = user.get("hf_token", "")

    result = deploy_to_huggingface(
        model_path=req.model_path,
        repo_name=req.repo_name,
        hf_token=hf_token,
        private=req.private,
    )

    # Save deployment to DB
    db = get_db()
    if db is not None:
        doc = {
            "hf_repo_id": req.repo_name,
            "hf_repo_url": result.get("repo_url", ""),
            "inference_api_url": result.get("inference_url", ""),
            "status": result.get("status", "live"),
            "deployed_at": datetime.utcnow(),
            "created_at": datetime.utcnow(),
        }
        if user:
            doc["user_id"] = str(user.get("_id", ""))
        if req.job_id:
            doc["training_job_id"] = req.job_id

        insert = await db.deployments.insert_one(doc)
        result["deployment_id"] = str(insert.inserted_id)

    return result


@router.get("/")
async def list_deployments(user=Depends(get_optional_user)):
    """List all deployments."""
    db = get_db()
    if db is None:
        return {"deployments": []}

    query = {}
    if user:
        query["user_id"] = str(user.get("_id", ""))

    cursor = db.deployments.find(query).sort("created_at", -1).limit(50)
    deployments = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        deployments.append(doc)

    return {"deployments": deployments}
