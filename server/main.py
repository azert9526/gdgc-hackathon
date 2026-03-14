from PrivacyProxy import PrivacyProxy
from fastapi import FastAPI, HTTPException
from dto import ChatRequest, ChatResponse
from google import genai
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware


load_dotenv()

app = FastAPI()
# Allow your React frontend to talk to the FastAPI backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, change this to your actual frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
gateway = PrivacyProxy()

client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

def call_llm(masked_prompt: str) -> str:
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
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
