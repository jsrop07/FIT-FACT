from fastapi import FastAPI
from pydantic import BaseModel
from fashn_vton import TryOnPipeline
from PIL import Image
from io import BytesIO
import base64

app = FastAPI()
pipeline = TryOnPipeline(weights_dir="./weights")

class TryOnRequest(BaseModel):
    human_image: str
    top_image: str | None = None
    bottom_image: str | None = None

def decode_b64_to_image(b64_string: str) -> Image.Image:
    if "," in b64_string:
        b64_string = b64_string.split(",", 1)[1]
    image_data = base64.b64decode(b64_string)
    return Image.open(BytesIO(image_data)).convert("RGB")

def encode_image_to_b64(image: Image.Image) -> str:
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buffer.getvalue()).decode("utf-8")

def apply_tryon(person_img: Image.Image, garment_img: Image.Image, category: str, segmentation_free: bool):
    result = pipeline(
        person_image=person_img,
        garment_image=garment_img,
        category=category,
        garment_photo_type="flat-lay",
        num_samples=1,
        num_timesteps=40 if category == "tops" else 50,
        guidance_scale=1.3 if category == "tops" else 2.0,
        seed=42,
        segmentation_free=segmentation_free,
    )
    return result.images[0]

@app.post("/tryon")
def tryon(req: TryOnRequest):
    human = decode_b64_to_image(req.human_image)

    if req.top_image and req.bottom_image:
        top = decode_b64_to_image(req.top_image)
        bottom = decode_b64_to_image(req.bottom_image)
        top_result = apply_tryon(human, top, "tops", True)
        final_img = apply_tryon(top_result, bottom, "bottoms", False)
    elif req.top_image:
        top = decode_b64_to_image(req.top_image)
        final_img = apply_tryon(human, top, "tops", True)
    elif req.bottom_image:
        bottom = decode_b64_to_image(req.bottom_image)
        final_img = apply_tryon(human, bottom, "bottoms", False)
    else:
        return {"status": "failed", "message": "top_image 또는 bottom_image가 필요합니다.", "result_image_url": None}

    return {"status": "success", "result_image_url": encode_image_to_b64(final_img)}