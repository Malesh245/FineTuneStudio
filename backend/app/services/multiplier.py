import pandas as pd
import json
from pathlib import Path
from datetime import datetime

class DataMultiplier:
    """Service to multiply datasets using synthetic data generation."""
    
    @staticmethod
    def generate_synthetic_data(input_file: str, target_count: int, api_key: str = None):
        """
        Simulates multiplying a dataset. 
        In production, this would call an LLM (Groq/OpenAI) with a few-shot prompt.
        """
        ext = Path(input_file).suffix.lower()
        if ext == ".csv":
            df = pd.read_csv(input_file)
        elif ext in (".json", ".jsonl"):
            df = pd.read_json(input_file, lines=(ext == ".jsonl"))
        else:
            return {"error": "Unsupported format for multiplication"}

        current_count = len(df)
        if current_count >= target_count:
            return {"message": "Dataset already meets or exceeds target size", "count": current_count}

        # --- SIMULATION LOGIC ---
        # We simulate creating new rows based on existing patterns
        new_rows = []
        needed = target_count - current_count
        
        # Take a sample to use as "few-shot" examples
        examples = df.head(min(5, current_count)).to_dict('records')
        
        for i in range(needed):
            # In real life, an LLM would generate this. 
            # Here we just tweak existing data to simulate variation.
            template = examples[i % len(examples)].copy()
            for key, value in template.items():
                if isinstance(value, str):
                    template[key] = f"[Synthetic] {value} (variant {i+1})"
            new_rows.append(template)

        new_df = pd.concat([df, pd.DataFrame(new_rows)], ignore_index=True)
        
        # Save the new multiplied dataset
        output_path = Path(input_file).parent / f"{Path(input_file).stem}_multiplied{ext}"
        if ext == ".csv":
            new_df.to_csv(output_path, index=False)
        else:
            new_df.to_json(output_path, orient='records', lines=(ext == ".jsonl"))

        return {
            "original_count": current_count,
            "new_count": len(new_df),
            "multiplied_file": str(output_path),
            "preview": new_df.head(10).to_dict('records')
        }
