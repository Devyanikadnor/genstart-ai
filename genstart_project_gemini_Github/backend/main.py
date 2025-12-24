
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os, json
from datetime import datetime

from llm.gemini_client import call_gemini

app = FastAPI(title="GenStart - Gemini Version")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class IdeaRequest(BaseModel):
    idea: str

def safe_json_parse(text: str) -> dict:
    try:
        return json.loads(text)
    except Exception as e:
        return {"raw": text, "parse_error": str(e)}

def ceo_agent(idea: str) -> dict:
    prompt = f"You are a startup CEO. Respond in JSON. Idea: {idea}"
    return safe_json_parse(call_gemini(prompt))

def product_agent(idea: str, ceo: dict) -> dict:
    prompt = f"You are a product manager. CEO: {ceo}. Idea: {idea}"
    return safe_json_parse(call_gemini(prompt))

def dev_agent(idea: str, ceo: dict, product: dict) -> dict:
    prompt = f"You are a developer. CEO: {ceo}. Product: {product}. Idea: {idea}"
    return safe_json_parse(call_gemini(prompt))

def marketing_agent(idea: str, ceo: dict, product: dict) -> dict:
    prompt = f"You are a marketer. CEO: {ceo}. Product: {product}. Idea: {idea}"
    return safe_json_parse(call_gemini(prompt))

def synthesizer_agent(idea, ceo, product, dev, marketing):
    prompt = f"Create pitch JSON. CEO:{ceo} Product:{product} Dev:{dev} Marketing:{marketing}"
    return safe_json_parse(call_gemini(prompt))

def orchestrate(idea: str):
    ceo = ceo_agent(idea)
    product = product_agent(idea, ceo)
    dev = dev_agent(idea, ceo, product)
    marketing = marketing_agent(idea, ceo, product)
    summary = synthesizer_agent(idea, ceo, product, dev, marketing)

    result = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "idea": idea,
        "ceo": ceo,
        "product": product,
        "dev": dev,
        "marketing": marketing,
        "summary": summary,
    }

    path = "backend/data/history.json"
    history = []
    if os.path.exists(path):
        history = json.load(open(path))
    history.append(result)
    json.dump(history[-20:], open(path, "w"), indent=2)

    return result

@app.post("/generate-plan")
def generate_plan(req: IdeaRequest):
    return orchestrate(req.idea)

@app.get("/health")
def health():
    return {"status":"ok","message":"GenStart Gemini backend running"}
