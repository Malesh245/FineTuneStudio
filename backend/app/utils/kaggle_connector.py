"""Kaggle dataset connector."""
import os


def fetch_kaggle_dataset(dataset_id: str, download_path: str = "./data") -> dict:
    """
    Download a dataset from Kaggle.

    Args:
        dataset_id: Kaggle dataset identifier (e.g., "username/dataset-name")
        download_path: Local directory to save the dataset
    """
    # ================================================================
    # PRODUCTION CODE — Uncomment when Kaggle API is configured
    # ================================================================
    # import kaggle
    #
    # kaggle.api.authenticate()
    # kaggle.api.dataset_download_files(dataset_id, path=download_path, unzip=True)
    #
    # files = os.listdir(download_path)
    # return {
    #     "dataset_id": dataset_id,
    #     "source": "kaggle",
    #     "download_path": download_path,
    #     "files": files,
    #     "status": "downloaded",
    # }
    # ================================================================

    # === DEMO MODE ===
    return {
        "dataset_id": dataset_id,
        "source": "kaggle",
        "download_path": download_path,
        "files": ["data.csv"],
        "status": "downloaded",
    }
