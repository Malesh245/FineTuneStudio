"""Hugging Face dataset connector."""


def fetch_hf_dataset(dataset_name: str, split: str = "train", max_rows: int = 1000) -> dict:
    """
    Fetch a dataset from Hugging Face Hub.

    Args:
        dataset_name: HF dataset identifier (e.g., "imdb", "squad")
        split: Dataset split to load
        max_rows: Maximum rows to fetch for preview
    """
    # ================================================================
    # PRODUCTION CODE — Uncomment to fetch real datasets
    # ================================================================
    # from datasets import load_dataset
    #
    # ds = load_dataset(dataset_name, split=split)
    # preview_ds = ds.select(range(min(max_rows, len(ds))))
    # preview_df = preview_ds.to_pandas()
    #
    # return {
    #     "name": dataset_name,
    #     "source": "huggingface",
    #     "split": split,
    #     "total_rows": len(ds),
    #     "columns": [{"name": col, "type": str(ds.features[col])} for col in ds.column_names],
    #     "preview": preview_df.head(20).fillna("").to_dict(orient="records"),
    #     "quality_score": 80,
    # }
    # ================================================================

    # === DEMO MODE ===
    return {
        "name": dataset_name,
        "source": "huggingface",
        "split": split,
        "total_rows": 1000,
        "columns": [
            {"name": "text", "type": "string"},
            {"name": "label", "type": "int64"},
        ],
        "preview": [
            {"text": f"Sample text {i} from {dataset_name}", "label": i % 2}
            for i in range(20)
        ],
        "quality_score": 80,
    }
