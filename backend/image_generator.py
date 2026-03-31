"""
Generates product images using Stable Diffusion v1.5 + LoRA weights.
Falls back to a grey placeholder if the model / LoRA is unavailable.
"""
import base64
import io
import os

# ── Config — override via environment variables ────────────────────────────────
BASE_MODEL  = os.getenv("SD_BASE_MODEL", "runwayml/stable-diffusion-v1-5")
LORA_PATH   = os.getenv(
    "LORA_PATH",
    "/content/drive/MyDrive/Pivot/genai/output/10_pelobottle/pelobottle_lora.safetensors",
)
MOCK_MODE   = os.getenv("MOCK_IMAGES", "false").lower() == "true"
STEPS       = int(os.getenv("SD_STEPS", "30"))
GUIDANCE    = float(os.getenv("SD_GUIDANCE", "7.5"))
SEED        = int(os.getenv("SD_SEED", "42"))
IMAGE_SIZE  = int(os.getenv("SD_SIZE", "512"))

_pipe = None  # module-level singleton


def _load_pipeline():
    global _pipe
    if _pipe is not None:
        return _pipe

    import torch
    from diffusers import StableDiffusionPipeline

    pipe = StableDiffusionPipeline.from_pretrained(
        BASE_MODEL,
        torch_dtype=torch.float16,
        safety_checker=None,
    )

    device = "cuda" if torch.cuda.is_available() else "cpu"
    pipe = pipe.to(device)
    pipe.set_progress_bar_config(disable=True)

    if os.path.exists(LORA_PATH):
        pipe.load_lora_weights(LORA_PATH)
        print(f"[image_generator] LoRA loaded from {LORA_PATH}")
    else:
        print(f"[image_generator] WARNING: LoRA not found at {LORA_PATH}, using base model.")

    _pipe = pipe
    return _pipe


def _placeholder_image(label: str = "") -> str:
    """Return a base64-encoded grey PNG with the scene label."""
    from PIL import Image, ImageDraw

    img = Image.new("RGB", (IMAGE_SIZE, IMAGE_SIZE), color=(28, 28, 46))
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, IMAGE_SIZE - 1, IMAGE_SIZE - 1], outline=(60, 60, 90), width=2)
    # centre text
    text = label or "Image placeholder"
    draw.text((IMAGE_SIZE // 2, IMAGE_SIZE // 2), text, fill=(120, 120, 160), anchor="mm")

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


def generate_image(prompt: str, scene: str = "") -> str:
    """
    Generate an image from the prompt and return it as a base64-encoded PNG string.
    If MOCK_IMAGES=true or the pipeline fails to load, returns a placeholder.
    """
    if MOCK_MODE:
        return _placeholder_image(scene)

    try:
        import torch
        pipe = _load_pipeline()

        generator = torch.Generator(pipe.device.type).manual_seed(SEED)
        result = pipe(
            prompt,
            num_inference_steps=STEPS,
            guidance_scale=GUIDANCE,
            height=IMAGE_SIZE,
            width=IMAGE_SIZE,
            generator=generator,
        )
        img = result.images[0]

        buf = io.BytesIO()
        img.save(buf, format="PNG")
        return base64.b64encode(buf.getvalue()).decode()

    except Exception as exc:
        print(f"[image_generator] Image generation failed: {exc}")
        return _placeholder_image(scene)


def unload_pipeline():
    """Free GPU memory — call after a batch of images is done."""
    global _pipe
    if _pipe is not None:
        try:
            import torch
            del _pipe
            _pipe = None
            torch.cuda.empty_cache()
        except Exception:
            pass
