from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import uuid
from datetime import datetime

app = FastAPI(title="Contextual Chat API", version="1.0.0")

# Pydantic Models
class Block(BaseModel):
    topic: str
    description: str

class Memory(BaseModel):
    summary_string: str
    blocks: List[Block]

class ChatHistory(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime

class Chat(BaseModel):
    id: str
    current_memory: Memory
    title: str
    chat_history: List[ChatHistory]

# Request Models
class SendMessageRequest(BaseModel):
    chat_id: str
    message: str

class NewChatRequest(BaseModel):
    first_message: str

class NewChatContextRequest(BaseModel):
    required_context: List[str]  # List of chat IDs and memory topics
    chat_id: str

# Response Models
class RootResponse(BaseModel):
    message: str
    version: str

class NewChatResponse(BaseModel):
    chat_id: str
    chat: Chat

class SSEChunk(BaseModel):
    content: Optional[str] = None
    done: Optional[bool] = None

# In-memory storage (replace with database in production)
chats_db: Dict[str, Chat] = {}
chat_list: List[str] = []  # List of chat IDs

@app.get("/", response_model=RootResponse)
async def root():
    return RootResponse(message="Contextual Chat API", version="1.0.0")

@app.get("/chats", response_model=List[Chat])
async def list_chats():
    """
    Get list of all chats
    """
    return [chats_db[chat_id] for chat_id in chat_list]

@app.get("/chats/{chat_id}", response_model=Chat)
async def get_chat(chat_id: str):
    """
    Get a specific chat by ID
    """
    if chat_id not in chats_db:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chats_db[chat_id]

@app.post("/chats/{chat_id}/send")
async def send_message(request: SendMessageRequest):
    """
    Send a message to a chat and get SSE response from GPT
    """
    if request.chat_id not in chats_db:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Add user message to chat history
    user_message = ChatHistory(
        role="user",
        content=request.message,
        timestamp=datetime.now()
    )
    chats_db[request.chat_id].chat_history.append(user_message)
    
    # Placeholder SSE response
    async def generate_response():
        # Simulate GPT response streaming
        response_text = f"Placeholder response to: {request.message}"
        chunks = [response_text[i:i+10] for i in range(0, len(response_text), 10)]
        
        for chunk in chunks:
            yield f"data: {json.dumps({'content': chunk})}\n\n"
        
        # Add assistant response to chat history
        assistant_message = ChatHistory(
            role="assistant",
            content=response_text,
            timestamp=datetime.now()
        )
        chats_db[request.chat_id].chat_history.append(assistant_message)
        
        yield f"data: {json.dumps({'done': True})}\n\n"
    
    return StreamingResponse(
        generate_response(),
        media_type="text/plain",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )

@app.post("/chats/new", response_model=NewChatResponse)
async def new_chat(request: NewChatRequest):
    """
    Create a new chat with first message and context prompt
    """
    chat_id = str(uuid.uuid4())
    
    # Create initial memory with context from other chats
    context_prompt = "Context from previous chats: " + ", ".join(chat_list[:5])  # Limit to 5 recent chats
    
    initial_memory = Memory(
        summary_string=f"New chat started with context: {context_prompt}",
        blocks=[
            Block(
                topic="initial_context",
                description=context_prompt
            )
        ]
    )
    
    # Create chat history with first message
    chat_history = [
        ChatHistory(
            role="user",
            content=request.first_message,
            timestamp=datetime.now()
        )
    ]
    
    # Create new chat
    new_chat = Chat(
        id=chat_id,
        current_memory=initial_memory,
        title=request.first_message[:50] + "..." if len(request.first_message) > 50 else request.first_message,
        chat_history=chat_history
    )
    
    # Store chat
    chats_db[chat_id] = new_chat
    chat_list.append(chat_id)
    
    return NewChatResponse(chat_id=chat_id, chat=new_chat)

@app.post("/chats/{chat_id}/context")
async def new_chat_context_set(request: NewChatContextRequest):
    """
    Set context for a chat and get SSE response from GPT
    """
    if request.chat_id not in chats_db:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Update chat memory with required context
    context_summary = f"Required context: {', '.join(request.required_context)}"
    context_blocks = [
        Block(
            topic=f"context_{i}",
            description=context
        ) for i, context in enumerate(request.required_context)
    ]
    
    chats_db[request.chat_id].current_memory = Memory(
        summary_string=context_summary,
        blocks=context_blocks
    )
    
    # Placeholder SSE response for context setting
    async def generate_context_response():
        response_text = f"Context set successfully with {len(request.required_context)} items"
        chunks = [response_text[i:i+10] for i in range(0, len(response_text), 10)]
        
        for chunk in chunks:
            yield f"data: {json.dumps({'content': chunk})}\n\n"
        
        yield f"data: {json.dumps({'done': True})}\n\n"
    
    return StreamingResponse(
        generate_context_response(),
        media_type="text/plain",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
