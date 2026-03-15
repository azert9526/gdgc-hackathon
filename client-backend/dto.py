from pydantic import BaseModel

class ChatRequest(BaseModel):
    prompt: str

class ChatResponse(BaseModel):
    original_prompt: str
    masked_prompt: str
    llm_raw_response: str
    final_response: str
    redacted_entities: dict
