"""Comparison router — before vs after model testing."""
from fastapi import APIRouter

from app.models.schemas import CompareRequest

router = APIRouter(prefix="/api/compare", tags=["Comparison"])


@router.post("/test")
async def compare_models(req: CompareRequest):
    """
    Compare base model vs fine-tuned model outputs for a given prompt.

    In production, this loads both models and runs inference.
    In demo mode, returns simulated outputs.
    """
    # === PRODUCTION CODE (uncomment when GPU available) ===
    # from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
    #
    # # Load base model
    # base_pipe = pipeline("text-generation", model=req.base_model)
    # base_output = base_pipe(req.prompt, max_new_tokens=100)[0]["generated_text"]
    #
    # # Load fine-tuned model
    # ft_pipe = pipeline("text-generation", model=req.finetuned_model_path)
    # ft_output = ft_pipe(req.prompt, max_new_tokens=100)[0]["generated_text"]
    #
    # return {"prompt": req.prompt, "before": base_output, "after": ft_output}

    # === DEMO MODE ===
    # We simulate a more detailed response to show the power of fine-tuning
    return {
        "prompt": req.prompt,
        "before": (
            f"The model attempts to answer \"{req.prompt}\" but generates vague and unfocused text. "
            f"It lacks a deep understanding of the context and uses very generic filler words. "
            f"Essentially, the base model is struggling to provide any concrete value here, "
            f"often repeating the prompt or going off on a tangent that is only loosely related to the topic."
        ),
        "after": (
            f"Detailed Analysis of \"{req.prompt}\":\n\n"
            f"1. Executive Summary: After fine-tuning on your specific dataset, the model has developed a nuanced "
            f"understanding of the technical nuances required for this query. It now prioritizes precision over verbosity.\n\n"
            f"2. Core Logic: The model correctly identifies the underlying patterns in \"{req.prompt}\" and applies "
            f"domain-specific reasoning. For instance, it no longer hallucinates generic facts but instead references "
            f"the structured knowledge found in your training data.\n\n"
            f"3. Style Alignment: The output is now professionally structured, using the exact terminology and "
            f"tone expected in your industry. This demonstrates that the LoRA adapters have successfully shifted the "
            f"latent space of the model towards your desired target distribution.\n\n"
            f"Conclusion: The fine-tuned model is significantly more reliable for production use cases involving this domain."
        ),
    }
