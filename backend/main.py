from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import uuid
from datetime import datetime
from types import RootResponse, Chat, SendMessageRequest, SendMessageToChatRequest, ChatMessage, Memory, Block, ContextResponse, StreamedChatResponse, SetChatContextRequest

app = FastAPI(title="Contextual Chat API", version="1.0.0")

# In-memory storage (replace with database in production)
chats_db: Dict[str, Chat] = {}


@app.get("/", response_model=RootResponse)
async def root():
    return RootResponse(message="Contextual Chat API", version="1.0.0")

@app.get("/chats", response_model=List[Chat])
async def list_chats():
    """
    Get list of all chats
    """
    return list(chats_db.values())

@app.get("/chats/{chat_id}", response_model=Chat)
async def get_chat(chat_id: str):
    """
    Get a specific chat by ID
    """
    if chat_id not in chats_db:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chats_db[chat_id]



@app.post("/chats/{chat_id}/send", response_model=StreamedChatResponse)
async def send_message(request: SendMessageToChatRequest):
    """
    Send a message to a chat and get SSE response from GPT
    """
    if request.chat_id not in chats_db:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Add user message to chat history
    user_message = ChatMessage(
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
        assistant_message = ChatMessage(
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



@app.post("/chats/new", response_model=ContextResponse)
async def new_chat(request: SendMessageRequest):
    """
    Create a new chat with first message and context prompt
    """
    chat_id = str(uuid.uuid4())
    
    # Create initial memory with context from other chats
    recent_chat_ids = list(chats_db.keys())[-5:]  # Limit to 5 recent chats
    context_prompt = "Context from previous chats: " + ", ".join(recent_chat_ids)
    
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
        ChatMessage(
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
    
    return ContextResponse(context_summary=context_prompt, relevant_chats=[new_chat])



@app.post("/chats/{chat_id}/set_context")
async def new_chat_context_set(request: SetChatContextRequest):
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