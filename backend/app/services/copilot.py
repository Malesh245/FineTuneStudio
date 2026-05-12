"""AI Training Copilot — Smart hyperparameter recommendation engine."""

class TrainingCopilot:
    """Analyzes dataset + model and recommends optimal training config."""

    # Knowledge base: optimal configs based on dataset size vs model size
    PROFILES = {
        "tiny":   {"max_rows": 100,   "epochs": 10, "lr": 5e-4, "lora_rank": 8,  "lora_alpha": 16,  "batch": 4,  "warmup": 10,  "max_len": 256},
        "small":  {"max_rows": 500,   "epochs": 5,  "lr": 3e-4, "lora_rank": 16, "lora_alpha": 32,  "batch": 8,  "warmup": 50,  "max_len": 512},
        "medium": {"max_rows": 5000,  "epochs": 3,  "lr": 2e-4, "lora_rank": 32, "lora_alpha": 64,  "batch": 16, "warmup": 100, "max_len": 512},
        "large":  {"max_rows": 50000, "epochs": 2,  "lr": 1e-4, "lora_rank": 64, "lora_alpha": 128, "batch": 32, "warmup": 200, "max_len": 1024},
        "xl":     {"max_rows": float('inf'), "epochs": 1, "lr": 5e-5, "lora_rank": 64, "lora_alpha": 128, "batch": 64, "warmup": 500, "max_len": 2048},
    }

    MODEL_SCALE = {
        "distilgpt2": "small", "gpt2": "small",
        "google/flan-t5-small": "small", "bert-base-uncased": "small", "roberta-base": "small",
        "meta-llama/Llama-3.2-1B": "medium", "google/gemma-2b": "medium",
        "Qwen/Qwen1.5-1.8B": "medium", "liquidai/lfm-1b": "medium",
        "microsoft/phi-2": "large", "liquidai/lfm-3b": "large",
        "mistralai/Mistral-7B-v0.1": "xl", "liquidai/lfm-7b": "xl",
    }

    @classmethod
    def recommend(cls, model_name: str, dataset_rows: int, dataset_domain: str = "general"):
        """Generate intelligent hyperparameter recommendations."""

        # Determine dataset size tier
        ds_tier = "tiny"
        for tier, profile in cls.PROFILES.items():
            if dataset_rows <= profile["max_rows"]:
                ds_tier = tier
                break

        profile = cls.PROFILES[ds_tier]
        model_scale = cls.MODEL_SCALE.get(model_name, "medium")

        # Adjust based on model scale
        scale_multipliers = {"small": 1.0, "medium": 0.8, "large": 0.5, "xl": 0.3}
        scale_factor = scale_multipliers.get(model_scale, 0.8)

        lr = round(profile["lr"] * scale_factor, 6)
        epochs = max(1, int(profile["epochs"] * (1 if model_scale in ["small", "medium"] else 0.7)))
        lora_rank = profile["lora_rank"]
        lora_alpha = profile["lora_alpha"]
        batch_size = max(2, int(profile["batch"] * scale_factor))
        warmup = profile["warmup"]
        max_len = profile["max_len"]

        # Build explanation
        reasons = []
        reasons.append({
            "param": "Learning Rate",
            "value": lr,
            "reason": f"Your dataset has {dataset_rows} rows ({ds_tier} tier). "
                      f"With a {model_scale}-scale model, we use a {'conservative' if lr < 1e-4 else 'moderate'} "
                      f"learning rate to {'prevent catastrophic forgetting' if lr < 1e-4 else 'ensure fast convergence'}."
        })
        reasons.append({
            "param": "Epochs",
            "value": epochs,
            "reason": f"{'Small datasets need more passes to learn patterns.' if epochs > 3 else 'Large datasets converge faster, so fewer epochs prevent overfitting.'}"
        })
        reasons.append({
            "param": "LoRA Rank",
            "value": lora_rank,
            "reason": f"Rank {lora_rank} provides {'basic adaptation' if lora_rank <= 16 else 'deep knowledge injection'} "
                      f"for your {'small' if dataset_rows < 500 else 'large'} dataset."
        })
        reasons.append({
            "param": "Batch Size",
            "value": batch_size,
            "reason": f"Optimized for {model_scale}-scale models. "
                      f"{'Smaller batches use less GPU memory.' if batch_size <= 8 else 'Larger batches provide more stable gradients.'}"
        })
        reasons.append({
            "param": "Max Sequence Length",
            "value": max_len,
            "reason": f"Set to {max_len} tokens based on typical {dataset_domain} domain text lengths."
        })

        # Calculate confidence
        confidence = 85
        if dataset_rows < 50:
            confidence -= 15  # Very small datasets are risky
        if model_scale == "xl" and dataset_rows < 1000:
            confidence -= 10  # Big model + small data = risky

        # Overfitting risk
        overfit_risk = "Low"
        if dataset_rows < 200 and epochs > 5:
            overfit_risk = "High"
        elif dataset_rows < 1000 and epochs > 3:
            overfit_risk = "Medium"

        return {
            "config": {
                "learningRate": lr,
                "epochs": epochs,
                "batchSize": batch_size,
                "loraRank": lora_rank,
                "loraAlpha": lora_alpha,
                "warmupSteps": warmup,
                "maxLength": max_len,
            },
            "reasons": reasons,
            "confidence": min(95, confidence),
            "overfitRisk": overfit_risk,
            "datasetTier": ds_tier,
            "modelScale": model_scale,
            "summary": f"Optimized for {ds_tier} dataset ({dataset_rows} rows) on {model_scale}-scale model. "
                       f"Confidence: {min(95, confidence)}%. Overfit risk: {overfit_risk}."
        }
