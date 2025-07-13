import os
import requests
from huggingface_hub import InferenceClient
from PIL import Image

# Load environment variables
from dotenv import load_dotenv

load_dotenv()

# Load your Hugging Face token
HF_TOKEN = os.getenv("HF_TOKEN")
if not HF_TOKEN:
    raise ValueError("Set your Hugging Face token in HF_TOKEN env variable")

# Choose a stable model, e.g. SDXL
MODEL_ID = "stabilityai/stable-diffusion-xl-base-1.0"

# Initialize the inference client once
client = InferenceClient(model=MODEL_ID, token=HF_TOKEN)


def generate_design(
    prompt: str,
    negative_prompt: str = "",
    width: int = 1024,
    height: int = 1024,
    guidance_scale: float = 7.5,
    num_inference_steps: int = 50,
) -> Image.Image:
    """
    Generates an image using HF Inference API and returns a PIL Image.
    """
    try:
        response = client.text_to_image(
            prompt,
            negative_prompt=negative_prompt,
            width=width,
            height=height,
            guidance_scale=guidance_scale,
            num_inference_steps=num_inference_steps,
        )
        return response  # PIL.Image
    except Exception as e:
        print(f"⚠️ Image generation failed: {e}")
        # Create a simple placeholder image
        from PIL import Image, ImageDraw, ImageFont

        img = Image.new("RGB", (width, height), color="lightblue")
        draw = ImageDraw.Draw(img)

        # Add text to the placeholder
        try:
            # Try to use a default font
            font = ImageFont.load_default()
        except Exception:
            font = None

        text = f"Product Design\n{prompt[:50]}..."
        draw.text((50, height // 2), text, fill="darkblue", font=font)
        return img


def save_design(image: Image.Image, filename: str = "design.png"):
    """Save the generated PIL Image locally."""
    image.save(filename)
    print(f"🖼️ Image saved: {filename}")


if __name__ == "__main__":
    demo_prompt = (
        "Minimalist organic cotton T-shirt with a green leaf pattern on a white tee"
    )
    img = generate_design(demo_prompt)
    save_design(img, "sample_design.png")
