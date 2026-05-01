"""Dataset cleaning, analysis, and preview service."""
import pandas as pd
from pathlib import Path


def analyze_dataset(file_path: str) -> dict:
    """Analyze a dataset file and return quality metrics + preview."""
    ext = Path(file_path).suffix.lower()

    try:
        if ext in (".mp3", ".wav"):
            return {
                "total_rows": 1,
                "columns": [{"name": "Media", "type": "audio"}],
                "preview": [{"text": "Audio file detected", "label": "audio"}],
                "quality_score": 100,
                "suggestions": [],
                "format": ext.replace(".", "")
            }
        if ext in (".mp4", ".mov"):
            return {
                "total_rows": 1,
                "columns": [{"name": "Media", "type": "video"}],
                "preview": [{"text": "Video file detected", "label": "video"}],
                "quality_score": 100,
                "suggestions": [],
                "format": ext.replace(".", "")
            }

        if ext == ".csv":
            df = pd.read_csv(file_path)
        elif ext in (".json", ".jsonl"):
            df = pd.read_json(file_path, lines=(ext == ".jsonl"))
        elif ext == ".parquet":
            df = pd.read_parquet(file_path)
        else:
            return {"error": f"Unsupported format: {ext}"}
    except Exception as e:
        return {"error": f"Failed to read file: {str(e)}"}

    total_rows = len(df)
    duplicates = int(df.duplicated().sum())

    missing = {}
    for col in df.columns:
        miss_count = int(df[col].isnull().sum())
        if miss_count > 0:
            missing[col] = miss_count

    empty_strings = {}
    for col in df.select_dtypes(include=["object"]).columns:
        empty_count = int((df[col].str.strip() == "").sum())
        if empty_count > 0:
            empty_strings[col] = empty_count

    columns = [{"name": col, "type": str(df[col].dtype)} for col in df.columns]
    preview = df.head(20).fillna("").to_dict(orient="records")

    # Quality score calculation
    dup_pct = (duplicates / total_rows * 100) if total_rows > 0 else 0
    missing_total = sum(missing.values())
    missing_pct = (missing_total / (total_rows * len(df.columns)) * 100) if total_rows > 0 else 0
    empty_total = sum(empty_strings.values())
    empty_pct = (empty_total / total_rows * 100) if total_rows > 0 else 0

    quality_score = max(0, min(100, int(100 - (dup_pct * 0.3) - (missing_pct * 0.35) - (empty_pct * 0.2))))

    return {
        "total_rows": total_rows,
        "columns": columns,
        "duplicates": duplicates,
        "missing_values": missing,
        "empty_strings": empty_strings,
        "quality_score": quality_score,
        "preview": preview,
        "suggestions": _get_suggestions(duplicates, missing_total, empty_total),
    }


def _get_suggestions(duplicates: int, missing: int, empty: int) -> list:
    """Generate cleaning suggestions based on analysis."""
    suggestions = []
    if duplicates > 0:
        suggestions.append({
            "action": "remove_duplicates",
            "label": "Remove Duplicates",
            "description": f"Found {duplicates} duplicate row(s)",
            "affected_rows": duplicates,
            "severity": "warning",
        })
    if missing > 0:
        suggestions.append({
            "action": "remove_missing",
            "label": "Remove Missing Values",
            "description": f"Found {missing} missing value(s)",
            "affected_rows": missing,
            "severity": "danger",
        })
    if empty > 0:
        suggestions.append({
            "action": "trim_whitespace",
            "label": "Trim Whitespace & Remove Empty",
            "description": f"Found {empty} row(s) with issues",
            "affected_rows": empty,
            "severity": "info",
        })
    return suggestions


def apply_cleaning(file_path: str, actions: list[str]) -> dict:
    """Apply cleaning actions to a dataset and save the cleaned version."""
    ext = Path(file_path).suffix.lower()

    if ext == ".csv":
        df = pd.read_csv(file_path)
    elif ext in (".json", ".jsonl"):
        df = pd.read_json(file_path, lines=(ext == ".jsonl"))
    elif ext == ".parquet":
        df = pd.read_parquet(file_path)
    else:
        return {"error": f"Unsupported format: {ext}"}

    original_rows = len(df)
    applied = []

    for action in actions:
        before = len(df)
        if action == "remove_duplicates":
            df = df.drop_duplicates()
        elif action == "remove_missing":
            df = df.dropna()
        elif action == "trim_whitespace":
            for col in df.select_dtypes(include=["object"]).columns:
                df[col] = df[col].str.strip()
            df = df[~(df.select_dtypes(include=["object"]) == "").all(axis=1)]
        elif action == "normalize_text":
            for col in df.select_dtypes(include=["object"]).columns:
                df[col] = df[col].str.lower().str.strip()

        applied.append({"action": action, "removed_rows": before - len(df)})

    # Save cleaned file
    stem = Path(file_path).stem
    cleaned_path = str(Path(file_path).parent / f"{stem}_cleaned{ext}")
    if ext == ".csv":
        df.to_csv(cleaned_path, index=False)
    elif ext == ".parquet":
        df.to_parquet(cleaned_path, index=False)
    else:
        df.to_json(cleaned_path, orient="records", indent=2)

    # Re-analyze cleaned data
    new_analysis = analyze_dataset(cleaned_path)

    return {
        "original_rows": original_rows,
        "cleaned_rows": len(df),
        "removed_rows": original_rows - len(df),
        "applied": applied,
        "cleaned_path": cleaned_path,
        "new_quality_score": new_analysis.get("quality_score", 100),
        "preview": new_analysis.get("preview", []),
    }
