import os
from google import genai
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse

from PrivacyProxy import PrivacyProxy
from dto import ChatRequest, ChatResponse
from secretapi import API_KEY

load_dotenv()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

gateway = PrivacyProxy()
model_name = "gemini-2.5-flash"
api_key = os.getenv('API_KEY', API_KEY)
client = genai.Client(api_key=api_key)

def call_llm(masked_prompt: str) -> str:
    try:
        response = client.models.generate_content(
            model=model_name,
            contents=masked_prompt
        )
        return response.text
    except Exception as e:
        return f"LLM Error: {str(e)}"

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        masked_prompt, mapping_dict = gateway.mask_prompt(request.prompt)
        llm_raw_response = call_llm(masked_prompt)
        final_response = gateway.unmask_response(llm_raw_response, mapping_dict)

        return ChatResponse(
            original_prompt=request.prompt,
            masked_prompt=masked_prompt,
            llm_raw_response=llm_raw_response,
            final_response=final_response,
            redacted_entities=mapping_dict
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/{catchall:path}")
def serve_react_app(catchall: str):
    file_path = os.path.join("dist", catchall)
    if catchall and os.path.isfile(file_path):
        return FileResponse(file_path)
    
    index_path = os.path.join("dist", "index.html")
    if os.path.isfile(index_path):
        return FileResponse(index_path)

    return JSONResponse(
        {"error": "Frontend build not found."},
        status_code=404
    )
