import json
import os
from pathlib import Path

# Load keywords once at module level
_data_path = Path(__file__).parent / "data" / "scam_keywords.json"
with open(_data_path, "r", encoding="utf-8") as f:
    RULES = json.load(f)


def score_message(text: str) -> dict:
    """Score a message for scam risk based on keyword rules.
    
    Each rule category is checked once. If ANY keyword in a category
    is found in the text, that category's score and reason are added.
    Total score is capped at 100.
    
    Returns: {"score": int, "reasons": [str]}
    """
    text_lower = text.lower()
    total_score = 0
    reasons = []

    for rule in RULES:
        # Check if any keyword from this category matches
        matched = any(keyword.lower() in text_lower for keyword in rule["keywords"])
        if matched:
            total_score += rule["score"]
            reasons.append(rule["reason"])

    # Cap at 100
    total_score = min(total_score, 100)

    # If no rules matched, still return a helpful message
    if not reasons:
        reasons.append("No known scam patterns detected — exercise caution anyway")

    return {"score": total_score, "reasons": reasons}


def get_risk_level(score: int) -> str:
    """Map numeric score to risk level."""
    if score <= 30:
        return "low"
    elif score <= 60:
        return "medium"
    else:
        return "high"
