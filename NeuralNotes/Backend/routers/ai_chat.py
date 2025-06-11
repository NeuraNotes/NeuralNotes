import os
import google.generativeai as genai
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file

router = APIRouter()

class ChatMessage(BaseModel):
    message: str

# Configure Google Generative AI with API key from environment variable
try:
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
except Exception as e:
    raise RuntimeError(f"Failed to configure Generative AI: {e}")

# Initialize the Generative Model
model = genai.GenerativeModel('gemini-pro')

@router.post("/api/ai-chat")
async def post_message(chat_message: ChatMessage):
    """
    Receives a message from the user, processes it with a Google AI model,
    and returns the AI's response.
    """
    try:
        # Generate content using the Gemini model
        response = model.generate_content(chat_message.message)
        response_message = response.text
    except Exception as e:
        print(f"Error generating AI response: {e}")
        raise HTTPException(status_code=500, detail="Failed to get AI response.")
    
    return {"response": response_message}