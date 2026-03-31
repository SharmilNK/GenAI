"""
AdCraft AI — FastAPI backend
Receives a campaign prompt, returns a full campaign (copy + images) as JSON.

Streaming endpoint: POST /api/generate
  - Sends progress lines ("data:progress:<message>") while working
  - Ends with "data:result:<json>" containing the full campaign

Quick start:
  pip install -r requirements.txt
  export ANTHROPIC_API_KEY=sk-ant-...
  export LORA_PATH=/path/to/pelobottle_lora.safetensors   # optional
  export MOCK_IMAGES=true                                  # skip GPU for dev
  uvicorn app:app --reload --port 8000
"""

import asyncio
import json
import os
from typing import AsyncGenerator

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from campaign_generator import generate_campaign_copy
from image_generator import generate_image, unload_pipeline

app = FastAPI(title="AdCraft AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    prompt: str
    product: str = "Pelo Water Bottle"


# ── Helpers ────────────────────────────────────────────────────────────────────

def _progress(msg: str) -> str:
    return f"data:progress:{msg}\n"


def _result(data: dict) -> str:
    return f"data:result:{json.dumps(data)}\n"


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok", "mock_images": os.getenv("MOCK_IMAGES", "false")}


@app.post("/api/generate")
async def generate_campaign(req: GenerateRequest):
    """
    Streaming endpoint.  Yields progress lines then the final JSON payload.
    """
    if not req.prompt.strip():
        raise HTTPException(status_code=422, detail="prompt cannot be empty")

    async def stream() -> AsyncGenerator[bytes, None]:
        # 1. Generate copy via Claude
        yield _progress("Drafting campaign concept with Claude…").encode()
        await asyncio.sleep(0)   # let FastAPI flush

        try:
            campaign = await asyncio.get_event_loop().run_in_executor(
                None, generate_campaign_copy, req.prompt, req.product
            )
        except Exception as exc:
            yield _progress(f"Error generating copy: {exc}").encode()
            raise

        yield _progress(
            f'Campaign "{campaign.get("name", "")}" ready — generating images…'
        ).encode()
        await asyncio.sleep(0)

        # 2. Generate an image for each ad
        ads = campaign.get("ads", [])
        for i, ad in enumerate(ads):
            scene   = ad.get("scene", f"Scene {i + 1}")
            img_prompt = ad.get("image_prompt", f"a photo of {req.product}")

            yield _progress(f"Generating image {i + 1}/{len(ads)}: {scene}…").encode()
            await asyncio.sleep(0)

            image_b64 = await asyncio.get_event_loop().run_in_executor(
                None, generate_image, img_prompt, scene
            )
            ad["image"] = image_b64

        # Free GPU memory after all images are done
        await asyncio.get_event_loop().run_in_executor(None, unload_pipeline)

        yield _progress("Finalising campaign…").encode()
        await asyncio.sleep(0)

        # 3. Return full campaign
        yield _result(campaign).encode()

    return StreamingResponse(stream(), media_type="text/plain")


@app.post("/api/generate/json")
async def generate_campaign_json(req: GenerateRequest):
    """
    Non-streaming alternative — waits for everything then returns JSON.
    Useful for testing with curl or Postman.
    """
    if not req.prompt.strip():
        raise HTTPException(status_code=422, detail="prompt cannot be empty")

    try:
        campaign = generate_campaign_copy(req.prompt, req.product)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Copy generation failed: {exc}")

    for i, ad in enumerate(campaign.get("ads", [])):
        img_prompt = ad.get("image_prompt", f"a photo of {req.product}")
        ad["image"] = generate_image(img_prompt, ad.get("scene", f"Scene {i+1}"))

    unload_pipeline()
    return campaign
