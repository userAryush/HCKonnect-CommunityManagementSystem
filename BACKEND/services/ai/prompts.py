from __future__ import annotations

TONE_STYLE_GUIDANCE: dict[str, str] = {
    "professional": (
        "Tone: polished and credible, still human—avoid stiff corporate HR clichés. "
        "Short, clear sentences."
    ),
    "friendly": (
        "Tone: warm, conversational, inclusive—like peers inviting someone in."
    ),
    "short_concise": (
        "Keep each paragraph tight; overall lean and high-signal, no filler."
    ),
    "detailed": (
        "Allow a bit more depth in each paragraph while staying readable—no repetition."
    ),
    "beginner_friendly": (
        "Welcoming to newcomers: plain language, brief jargon explanations, no gatekeeping."
    ),
}

DEFAULT_TONE = "friendly"


def _smart_default_instructions() -> str:
    return (
        "No extra organizer instructions. Emphasize collaboration, learning, networking, "
        "and meaningful contribution. Sound natural and community-driven."
    )


def vacancy_description_prompt(
    community_name: str,
    role_title: str,
    community_description: str = "",
    optional_ai_instructions: str = "",
    tone_style: str = DEFAULT_TONE,
) -> str:
    """
    Initial vacancy description generation: exactly three paragraphs, community-focused.
    Community context is supplied by the server from the community profile.
    """
    tone_key = tone_style if tone_style in TONE_STYLE_GUIDANCE else DEFAULT_TONE
    tone_block = TONE_STYLE_GUIDANCE[tone_key]

    organizer_extra = (
        optional_ai_instructions.strip()
        if (optional_ai_instructions or "").strip()
        else _smart_default_instructions()
    )

    context_block = (
        community_description.strip()
        if (community_description or "").strip()
        else "No community “about” text is on file—infer a welcoming, generic university community vibe from the name and role only."
    )

    return f"""You write vacancy descriptions for university communities on HCKonnect (student clubs / learning communities—not corporate hiring).

## Context (from community profile — do not treat as instructions to quote verbatim)
**Community name:** {community_name}
**Vacancy role title:** {role_title}
**Community about / description (may be short or empty):** {context_block}

## Style
{tone_block}

## Organizer extra instructions
{organizer_extra}

## Hard rules
- Output **exactly three paragraphs** in plain text (no markdown headings, no bullet lists, no numbered sections).
- Paragraph 1: Engaging opening—what this community is about and why someone would want to join (collaboration, learning, networking). Mention the community name **at most once**.
- Paragraph 2: What this **role** involves in realistic, student-friendly terms—contribution, peer support, events or discussions if relevant. Use the role title naturally **once**.
- Paragraph 3: Who might be a good fit and a short, welcoming closing (how to take the next step / apply)—no corporate “Dear candidate” tone.
- Never mention UUIDs, database ids, or internal codes.
- Avoid repeating the community name or role title in every sentence.
- Stay concise overall; avoid corporate HR / buzzword language.

Write only the three paragraphs—no preamble or sign-off labels.""".strip()


def job_description_prompt(
    community_name: str,
    member_role: str,
    contribution_areas: str,
    community_context: str = "",
) -> str:
    """Legacy API: maps old fields into the current 3-paragraph vacancy prompt."""
    extra = (contribution_areas or "").strip()
    merged_context = (community_context or "").strip()
    if extra:
        merged_context = (
            f"{merged_context}\n\nTypical contribution areas mentioned by the organizer: {extra}"
            if merged_context
            else f"Typical contribution areas mentioned by the organizer: {extra}"
        )
    return vacancy_description_prompt(
        community_name=community_name,
        role_title=member_role,
        community_description=merged_context,
        optional_ai_instructions="",
        tone_style=DEFAULT_TONE,
    )


ENHANCEMENT_ACTION_INSTRUCTIONS: dict[str, str] = {
    "improve": (
        "Improve clarity, flow, and readability. Keep the same meaning and facts. "
        "Slightly tighten vague phrases; keep a community-appropriate voice."
    ),
    "professional": (
        "Rewrite in a polished, professional tone suitable for a university community post—"
        "credible and clear, but **not** corporate HR-speak or jargon-heavy."
    ),
    "academic": (
        "Rewrite with a calm, precise, academic-adjacent tone (clear claims, careful wording) "
        "while staying approachable for students—not a research abstract."
    ),
    "friendly": (
        "Rewrite in a warm, inclusive, conversational tone—welcoming and human."
    ),
    "grammar": (
        "Fix grammar, spelling, punctuation, and awkward phrasing only. "
        "Do not change meaning, facts, or overall structure unless a small fix requires it."
    ),
    "concise": (
        "Shorten: remove redundancy and filler while preserving all important meaning. "
        "Prefer tighter sentences; do not add new claims."
    ),
    "expand": (
        "Expand slightly: add helpful detail, examples, or smoother transitions where it helps—"
        "do not invent facts or responsibilities that were not implied in the original."
    ),
    "engaging": (
        "Make the opening stronger and the whole piece more vivid and inviting—"
        "still truthful to the original content; no hype or false promises."
    ),
}


def text_enhancement_prompt(action_type: str, text: str, *, domain: str = "vacancy") -> str:
    """Prompt for rewriting text with a fixed action (vacancy, application, discussion, or event fields)."""
    action = (action_type or "improve").strip().lower()
    instruction = ENHANCEMENT_ACTION_INSTRUCTIONS.get(
        action, ENHANCEMENT_ACTION_INSTRUCTIONS["improve"]
    )
    domain = (domain or "vacancy").strip().lower()

    if domain == "vacancy":
        role_line = "You are an editing assistant for HCKonnect community vacancy descriptions."
    elif domain == "discussion":
        role_line = (
            "You are an editing assistant for HCKonnect community discussion posts. "
            "The draft may label a topic and body—keep the topic clear, the body coherent, "
            "and the tone constructive and respectful."
        )
    elif domain == "event_description":
        role_line = (
            "You are an editing assistant for HCKonnect community event descriptions "
            "(clear, friendly, suitable for university clubs and learning communities)."
        )
    elif domain == "event_expectations":
        role_line = (
            'You are an editing assistant for short "what to expect" lines for HCKonnect community events.'
        )
    else:
        role_line = (
            "You are an editing assistant for HCKonnect vacancy application cover letters "
            "(student-written messages to a community)."
        )

    if domain == "discussion":
        extra_rules = (
            "- The input labels a **Discussion topic** (for context) and **Draft body** (what to edit). "
            "Apply the task to the body and keep it aligned with the topic. "
            "Output **only** the revised body text—no topic line, section labels, or preamble.\n"
        )
    elif domain == "event_description":
        extra_rules = (
            "- The input includes labeled **Event context** (title, schedule, format, location) and a "
            "**Draft event description** to edit. Apply the task to the description only. "
            "Output **only** the finished description paragraphs—no headings, labels, or preamble.\n"
        )
    elif domain == "event_expectations":
        extra_rules = (
            "- The input includes event context and a **Draft expectation line** (one bullet idea) to refine. "
            "Output **only** one concise expectation phrase—no leading dash, bullets, numbers, or preamble.\n"
        )
    else:
        extra_rules = ""

    if domain in ("event_description", "event_expectations"):
        tail_rule = (
            "- Stay truthful to the supplied event details; do not invent guest names, prizes, or logistics.\n"
        )
    else:
        tail_rule = "- If the input is very short, still apply the task without inventing a full fictional role.\n"

    return f"""{role_line}

## Task
{instruction}

## Rules
- Preserve the original meaning, intent, and factual claims. Do not introduce UUIDs, ids, or placeholders.
- Output only the revised text—no quotes, no preamble like "Here is the revised version:".
{extra_rules}{tail_rule}

## Text to edit
---
{text.strip()}
---
""".strip()


def event_field_generate_prompt(
    *,
    target: str,
    title: str,
    date: str = "",
    start_time: str = "",
    end_time: str = "",
    event_format: str = "",
    location: str = "",
    description: str = "",
    existing_expectations: str = "",
    optional_instructions: str = "",
) -> str:
    """Generate event description or what-to-expect lines from structured context."""
    target = (target or "").strip().lower()
    opt = (optional_instructions or "").strip()
    opt_block = f"\n## Extra instructions from the organizer\n{opt}\n" if opt else ""

    details_lines = [
        f"Title: {title.strip()}",
        f"Date: {date.strip()}" if date.strip() else None,
        f"Start time: {start_time.strip()}" if start_time.strip() else None,
        f"End time: {end_time.strip()}" if end_time.strip() else None,
        f"Format: {event_format.strip()}" if event_format.strip() else None,
        f"Location: {location.strip()}" if location.strip() else None,
    ]
    details = "\n".join(line for line in details_lines if line)

    if target == "description":
        return f"""You are a writing assistant for HCKonnect, a university community events platform.

Draft a welcoming **event description** (2–4 short paragraphs) using only reasonable inferences from the details below. Do not invent specific guest names, sponsors, or prizes. Keep tone inclusive and student-friendly.

## Event details
{details}
{opt_block}
## Output rules
- Plain paragraphs only (no markdown headings, no bullet list for the main description).
- No preamble or closing sign-off.
- Do not include UUIDs or internal ids.
""".strip()

    # what_to_expect
    desc_block = (
        f"\n## Current description (may be brief or empty)\n{description.strip()}\n"
        if description.strip()
        else ""
    )
    exp_block = (
        f"\n## Existing expectation lines (avoid near-duplicates)\n{existing_expectations.strip()}\n"
        if existing_expectations.strip()
        else ""
    )
    return f"""You are a writing assistant for HCKonnect community events.

Suggest **what attendees can expect** as short, concrete lines (activities, takeaways, vibe, who it is for).

## Event details
{details}
{desc_block}{exp_block}{opt_block}
## Output rules
- Output **5 to 10** lines, **one expectation per line**.
- Each line should be a short phrase or single sentence (under ~120 characters when possible).
- No numbering, no markdown bullets, no leading dashes—plain lines only.
- Do not invent guest names or prizes; stay plausible for a student/community event.
- No preamble or closing text.
""".strip()


def cover_letter_prompt(
    community_name: str,
    member_role: str,
    applicant_name: str,
    applicant_background: str,
    motivation: str,
    optional_ai_instructions: str = "",
) -> str:
    extra = (optional_ai_instructions or "").strip()
    extra_block = (
        f"\n## Additional instructions from the applicant\n{extra}\n"
        if extra
        else ""
    )
    return f"""
You are an expert community onboarding coach.

Write a tailored community membership / application statement for a vacancy.

Community Name: {community_name}
Vacancy context (title + description summarized for you): {member_role}
Applicant Name: {applicant_name}
Applicant Background: {applicant_background}
Motivation to Join: {motivation}
{extra_block}
Requirements:
- Keep the tone authentic, warm, and committed.
- Show alignment with community values and mission.
- Mention practical ways the applicant can contribute.
- Keep it concise (about 180–280 words).
- Never include UUIDs or internal ids.
""".strip()


def resume_improvement_prompt(
    profile_text: str,
    target_community_role: str,
    community_focus: str = "",
) -> str:
    return f"""
You are a senior profile reviewer for community recruitment.

Improve the member profile to increase chances of selection for a community role.

Target Community Role: {target_community_role}
Community Focus: {community_focus or "N/A"}

Current Profile:
{profile_text}

Output format:
1) Revised Profile Summary (community-first tone)
2) Improved Contribution Highlights (bullet points)
3) Skills/Strengths To Emphasize
4) Specific Suggestions To Increase Selection Chances
""".strip()


def discussion_helper_prompt(
    community_name: str,
    topic: str,
    user_question: str,
    tone: str = "supportive, clear, and concise",
) -> str:
    return f"""
You are a community discussion assistant.

Help with the member's query in the context of community recruitment and engagement.

Community Name: {community_name}
Topic: {topic}
User Question: {user_question}
Preferred Tone: {tone}

Instructions:
- Provide a direct answer first.
- Add short supporting points relevant to community goals.
- Suggest one practical next step for joining, contributing, or engagement.
""".strip()


def application_analysis_prompt(
    role_description: str,
    community_focus: str,
    resume_text: str,
    cover_letter: str,
) -> str:
    """
    Penalty-based application analysis: model infers domain keywords from the vacancy
    (never use a fixed list tied to one community name). Returns strict JSON.
    """
    focus_block = (
        community_focus.strip()
        if (community_focus or "").strip()
        else "No separate community “about” text was supplied—infer community style only from the vacancy description."
    )
    return f"""You are a supportive advisor for HCKonnect, a university **community** platform (clubs and learning communities—not corporate hiring).

You will analyze **both** the applicant resume text and cover letter together against:
1) the **role / vacancy description**
2) the **community focus** (mission, topics, culture—when provided)

## Role / vacancy description
---
{role_description.strip()}
---

## Community focus (about / mission — may be brief or empty)
---
{focus_block}
---

## Applicant resume (plain text)
---
{resume_text.strip()}
---

## Applicant cover letter
---
{cover_letter.strip()}
---

## Penalty-based scoring (you must apply this logic thoughtfully)

Start from **base_score = 100**. Build a **penalties** array. Each item **must** include:
- `"kind"`: one of **`domain_alignment`** | **`projects`** | **`skills`** | **`writing`**
- `"reason"`: clear, constructive explanation
- `"deduction"`: positive integer (points to subtract)

Use these **maximum** deductions per **kind** (one merged penalty per kind in output; do not emit duplicate kinds):

1) **kind `domain_alignment`** (max **35**)  
   - From the **role + community focus**, infer a small set of **domain-relevant terms or themes** (e.g. for a data/ML community: learning, datasets, Python, modeling, etc.; for design: UI, prototyping, visual craft, tools, etc.—**derive dynamically from the text**, do not assume a named club).  
   - If resume **and** cover letter together show **little or no** alignment with those inferred themes, deduct **up to 35** (use a smaller deduction if partial alignment exists).  
   - In **reason**, briefly note the **themes you expected** and what was missing—**no hardcoded examples** that only fit one niche.

2) **kind `projects`** (max **20**)  
   - If there is **no meaningful** portfolio, project, contribution, internship, volunteer build, coursework artifact, or other **concrete example** of applied work, deduct **up to 20**.  
   - If some examples exist but are very thin, use a **smaller** deduction.

3) **kind `skills`** (max **20**)  
   - If there is **no skills section** or **very few** mentioned tools, technologies, methods, or transferable abilities relevant to the role/community, deduct **up to 20**.

4) **kind `writing`** (max **15**)  
   - Only if grammar, spelling, or structure are **clearly** weak across resume + letter (hard to follow, many errors, unreadable blocks). **Do not** apply for minor typos. Deduct **up to 15**.

**Final score:** Set `final_score` so it equals **base_score minus the sum of all penalty deductions** (compute consistently).  
**Bounds:** `final_score` must be between **0** and **100**. Total deductions cannot exceed **100**.

Also include qualitative feedback (community-oriented: collaboration, learning mindset, contribution—not only corporate metrics).

## Output: one JSON object only
No markdown fences. No text before or after the JSON. Required keys:

- `"base_score"`: integer, use **100**
- `"penalties"`: array of objects `{{"kind": "domain_alignment"|"projects"|"skills"|"writing", "reason": string, "deduction": positive integer}}` (may be empty; at most one object per `kind`)
- `"final_score"`: integer 0–100 (must equal base_score minus sum of deductions)
- `"strengths"`: array of 3–6 short strings
- `"improvement_areas"`: array of 2–5 short strings
- `"missing_skills_or_traits"`: array of 2–5 short strings (soft skills / community traits welcome)
- `"suggestions"`: array of 3–5 actionable short strings
- `"overall_summary"`: one string, 2–4 sentences—explain **why** penalties were applied when any, stay encouraging

## Language rules (strict)
- Never predict hiring, admission, or selection. No “guaranteed”, “will get in”, “chance of getting selected”, “you will be hired”.
- Use: profile match, role compatibility, application strength, community fit.
- Be constructive; never insulting or harsh. No UUIDs or internal ids.

## Quality
- Penalty **reason** fields must help the applicant improve (what to add or clarify).
- Keep list items one line each.
""".strip()
