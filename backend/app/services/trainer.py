"""Model fine-tuning service using Hugging Face Transformers + PEFT (LoRA)."""


def run_finetuning(config: dict) -> dict:
    """
    Run fine-tuning job.

    In production (when GPU is available), uncomment the real training code below.
    In demo mode, returns simulated metrics so the full UI pipeline works.
    """
    model_name = config.get("model_name", "distilgpt2")
    epochs = config.get("epochs", 3)

    # ================================================================
    # PRODUCTION CODE — Uncomment when you have GPU access
    # ================================================================
    # from transformers import (
    #     AutoModelForCausalLM, AutoTokenizer,
    #     TrainingArguments, Trainer, DataCollatorForLanguageModeling,
    # )
    # from peft import LoraConfig, get_peft_model, TaskType
    # from datasets import load_dataset
    #
    # # 1. Load tokenizer and model
    # tokenizer = AutoTokenizer.from_pretrained(model_name)
    # if tokenizer.pad_token is None:
    #     tokenizer.pad_token = tokenizer.eos_token
    #
    # model = AutoModelForCausalLM.from_pretrained(model_name)
    #
    # # 2. Apply LoRA adapter
    # lora_config = LoraConfig(
    #     task_type=TaskType.CAUSAL_LM,
    #     r=config.get("lora_rank", 16),
    #     lora_alpha=config.get("lora_alpha", 32),
    #     lora_dropout=0.05,
    #     target_modules=["c_attn", "c_proj"],  # GPT-2 layers
    # )
    # model = get_peft_model(model, lora_config)
    # model.print_trainable_parameters()
    #
    # # 3. Load and tokenize dataset
    # dataset_path = config.get("dataset_path", "")
    # if dataset_path:
    #     dataset = load_dataset("csv", data_files=dataset_path, split="train")
    # else:
    #     dataset = load_dataset("wikitext", "wikitext-2-raw-v1", split="train[:1000]")
    #
    # def tokenize(examples):
    #     return tokenizer(examples["text"], truncation=True, max_length=config.get("max_length", 512))
    #
    # tokenized = dataset.map(tokenize, batched=True, remove_columns=dataset.column_names)
    #
    # # 4. Training arguments
    # output_dir = str(Path(config.get("output_dir", "./model_outputs")) / model_name.replace("/", "_"))
    # training_args = TrainingArguments(
    #     output_dir=output_dir,
    #     num_train_epochs=config.get("epochs", 3),
    #     per_device_train_batch_size=config.get("batch_size", 8),
    #     learning_rate=config.get("learning_rate", 2e-4),
    #     warmup_steps=config.get("warmup_steps", 100),
    #     weight_decay=config.get("weight_decay", 0.01),
    #     logging_steps=10,
    #     save_strategy="epoch",
    #     fp16=True,
    # )
    #
    # # 5. Train
    # trainer = Trainer(
    #     model=model,
    #     args=training_args,
    #     train_dataset=tokenized,
    #     data_collator=DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False),
    # )
    # train_result = trainer.train()
    #
    # # 6. Save
    # model.save_pretrained(output_dir)
    # tokenizer.save_pretrained(output_dir)
    #
    # return {
    #     "status": "completed",
    #     "model_name": model_name,
    #     "output_path": output_dir,
    #     "metrics": {
    #         "training_history": [...],  # Extract from trainer.state.log_history
    #     },
    # }
    # ================================================================

    from app.services.orchestrator import orchestrator
    
    # Delegate job execution to the orchestrator layer
    return orchestrator.dispatch_job(config)
