"""
Post-process AI application analysis: penalty list hygiene and score consistency.

Does not hardcode role keywords — the model infers those from the vacancy text.
"""

from __future__ import annotations

from typing import Any

# Per-category caps (model must tag penalties with `kind` for strict enforcement).
_PENALTY_KIND_CAPS: dict[str, int] = {
    "domain_alignment": 35,
    "projects": 20,
    "skills": 20,
    "writing": 15,
}


def _clamp_int(value: Any, lo: int, hi: int, default: int = 0) -> int:
    try:
        n = int(float(value))
    except (TypeError, ValueError):
        n = default
    return max(lo, min(hi, n))


def normalize_penalties(raw: Any) -> list[dict[str, Any]]:
    """
    Return list of {kind, reason, deduction} with positive integer deductions.

    Multiple rows for the same `kind` are merged (max deduction, reasons joined)
    so the same issue category is not stacked.
    """
    if not isinstance(raw, (list, tuple)):
        return []
    by_kind: dict[str, dict[str, Any]] = {}
    order: list[str] = []

    for item in raw:
        if not isinstance(item, dict):
            continue
        kind = str(item.get("kind", "other") or "other").strip().lower()
        if not kind:
            kind = "other"
        reason = str(item.get("reason", "")).strip()
        ded = _clamp_int(item.get("deduction", 0), 0, 100, 0)
        if ded <= 0 or not reason:
            continue
        cap = _PENALTY_KIND_CAPS.get(kind, 35)
        ded = min(ded, cap)

        if kind not in by_kind:
            by_kind[kind] = {"kind": kind, "reason": reason, "deduction": ded}
            order.append(kind)
        else:
            prev = by_kind[kind]
            prev["deduction"] = max(int(prev["deduction"]), ded)
            prev["reason"] = f"{prev['reason']} · {reason}"

    return [by_kind[k] for k in order]


def normalize_application_analysis(data: dict[str, Any]) -> dict[str, Any]:
    """
    Ensure base_score, penalties, and final_score are coherent and within bounds.

    When penalties are present, final_score is derived as base_score - sum(deductions)
    so the breakdown always matches the displayed score.
    """
    base_score = _clamp_int(data.get("base_score"), 0, 100, 100)
    if base_score <= 0:
        base_score = 100

    penalties = normalize_penalties(data.get("penalties"))
    total_deduction = sum(int(p["deduction"]) for p in penalties)
    total_deduction = min(total_deduction, 100)

    if penalties:
        final_score = max(0, min(100, base_score - total_deduction))
    else:
        final_score = _clamp_int(
            data.get("final_score", data.get("match_score")),
            0,
            100,
            0,
        )

    strengths = _coerce_str_list(data.get("strengths"))
    improvement_areas = _coerce_str_list(data.get("improvement_areas"))
    missing = _coerce_str_list(data.get("missing_skills_or_traits"))
    suggestions = _coerce_str_list(data.get("suggestions"))
    summary = str(data.get("overall_summary", "")).strip() or (
        "No summary was provided; try running analysis again."
    )

    return {
        "base_score": base_score,
        "penalties": penalties,
        "final_score": final_score,
        "match_score": final_score,
        "strengths": strengths,
        "improvement_areas": improvement_areas,
        "missing_skills_or_traits": missing,
        "suggestions": suggestions,
        "overall_summary": summary,
    }


def _coerce_str_list(value: Any, *, max_items: int = 8) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        return [value.strip()] if value.strip() else []
    if isinstance(value, (list, tuple)):
        out: list[str] = []
        for item in value[:max_items]:
            s = str(item).strip()
            if s:
                out.append(s)
        return out
    s = str(value).strip()
    return [s] if s else []
