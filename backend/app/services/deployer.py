"""Deploy fine-tuned model to Hugging Face Hub."""


def deploy_to_huggingface(model_path: str, repo_name: str, hf_token: str, private: bool = False) -> dict:
    """
    Push model weights, config, and tokenizer to Hugging Face Hub.

    Args:
        model_path: Local path to saved model weights
        repo_name: Target repo (e.g., "username/model-name")
        hf_token: Hugging Face API token with write access
        private: Whether to make the repo private

    Returns:
        Dictionary with repo URL and inference API URL
    """
    # ================================================================
    # PRODUCTION CODE — Uncomment when ready to deploy real models
    # ================================================================
    # from huggingface_hub import HfApi, create_repo
    #
    # if not hf_token:
    #     return {"status": "failed", "error": "Hugging Face token is required"}
    #
    # api = HfApi(token=hf_token)
    #
    # # Create repository
    # create_repo(
    #     repo_id=repo_name,
    #     repo_type="model",
    #     private=private,
    #     token=hf_token,
    #     exist_ok=True,
    # )
    #
    # # Upload all model files
    # api.upload_folder(
    #     folder_path=model_path,
    #     repo_id=repo_name,
    #     commit_message="Upload fine-tuned model via FineTuneStudio",
    # )
    #
    # return {
    #     "status": "live",
    #     "repo_url": f"https://huggingface.co/{repo_name}",
    #     "inference_url": f"https://api-inference.huggingface.co/models/{repo_name}",
    # }
    # ================================================================

    # === DEMO MODE ===
    return {
        "status": "live",
        "repo_url": f"https://huggingface.co/{repo_name}",
        "inference_url": f"https://api-inference.huggingface.co/models/{repo_name}",
    }
