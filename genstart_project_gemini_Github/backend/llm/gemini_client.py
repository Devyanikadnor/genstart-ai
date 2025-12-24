
import vertexai
from vertexai.preview.generative_models import GenerativeModel

vertexai.init(
    project="genstart-ai-hackathon",
    location="us-central1"
)

model = GenerativeModel("gemini-1.5-pro")

def call_gemini(prompt: str) -> str:
    response = model.generate_content(
        prompt,
        generation_config={
            "temperature": 0.4,
            "max_output_tokens": 2048
        }
    )
    return response.text
