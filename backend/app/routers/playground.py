"""Inference Playground router — chat with your fine-tuned model."""
from fastapi import APIRouter, Depends
from app.auth import get_optional_user

router = APIRouter(prefix="/api/playground", tags=["Playground"])


@router.post("/chat")
async def playground_chat(req: dict, user=Depends(get_optional_user)):
    """Chat with a fine-tuned model. In production, loads the actual model."""
    prompt = req.get("prompt", "")
    system = req.get("system_prompt", "You are a helpful assistant.")
    temperature = req.get("temperature", 0.7)
    max_tokens = req.get("max_tokens", 256)
    
    # SIMULATION: In production, load the user's model via transformers pipeline
    response = (
        f"[Model Response | temp={temperature}]\n\n"
        f"Based on your system prompt: \"{system[:50]}...\"\n\n"
        f"I understand you're asking about: \"{prompt}\"\n\n"
        f"As your fine-tuned model, I can provide domain-specific insights that the base model cannot. "
        f"My responses are calibrated to your training data's style and terminology, "
        f"ensuring high relevance and accuracy for your specific use case."
    )
    
    return {
        "response": response,
        "tokens_used": len(prompt.split()) + len(response.split()),
        "temperature": temperature,
    }
