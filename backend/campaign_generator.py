"""
Uses the Anthropic API to generate a structured ad campaign from a user prompt.
Returns a dict with campaign metadata + per-ad scene/headline/copy/cta/image_prompt.
"""
import json
import anthropic

SYSTEM_PROMPT = """You are an expert advertising creative director.
Given a campaign brief and product, you produce structured, compelling ad campaigns.
Always respond with valid JSON only — no markdown, no commentary."""

USER_TEMPLATE = """
Create a 4-ad advertising campaign for the following:

Product: {product}
Campaign brief: {prompt}

Return a JSON object with this exact structure:
{{
  "name": "short catchy campaign name (2-4 words)",
  "tagline": "memorable campaign tagline (under 10 words)",
  "concept": "1-2 sentence creative concept explaining the campaign idea",
  "target_audience": "specific target audience description",
  "tone": "campaign tone (e.g. Energetic, Aspirational, Warm, Bold)",
  "ads": [
    {{
      "scene": "short scene label (2-3 words)",
      "image_prompt": "detailed Stable Diffusion prompt: 'a photo of {product_lower}, [scene description], [lighting], [atmosphere], product photography, advertising',",
      "headline": "punchy ad headline (under 8 words)",
      "body_copy": "1-2 sentence ad body copy",
      "cta": "call-to-action button text (2-4 words)"
    }}
  ]
}}

Make the 4 scenes visually distinct: vary the setting, lighting, and mood.
The image_prompt must start with 'a photo of {product_lower}' (the LoRA trigger phrase).
"""


def generate_campaign_copy(prompt: str, product: str) -> dict:
    """Call Claude to produce campaign structure + image prompts."""
    client = anthropic.Anthropic()

    user_msg = USER_TEMPLATE.format(
        product=product,
        prompt=prompt,
        product_lower=product.lower(),
    )

    message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1500,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_msg}],
    )

    raw = message.content[0].text.strip()

    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    return json.loads(raw)
