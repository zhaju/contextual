from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import uuid
from datetime import datetime
from custom_types import RootResponse, Chat, SendMessageRequest, SendMessageToChatRequest, ChatMessage, Memory, Block, ContextResponse, StreamedChatResponse, SetChatContextRequest
from prompts import get_response_generation_prompt

app = FastAPI(title="Contextual Chat API", version="1.0.0")

# In-memory storage (replace with database in production)
chats_db: Dict[str, Chat] = {
    "sample_chat": Chat(
        id="sample_chat",
        current_memory=Memory(
            summary_string="This is a sample memory summary.",
            blocks=[
                Block(topic="sample_topic", description="This is a sample block description.")
            ]
        ),
        title="Sample Chat",
        chat_history=[
            ChatMessage(role="user", content="Hello, how are you?", timestamp=datetime.now()),
            ChatMessage(role="assistant", content="I'm good, thank you!", timestamp=datetime.now())
        ]
    )
}


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



@app.post("/chats/send", response_model=StreamedChatResponse)
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
    
    # Prepare context for the prompt
    chat = chats_db[request.chat_id]
    
    # Get memory as string
    memory_str = chat.current_memory.to_llm_str()
    
    # Get last 6 chat messages (truncated)
    recent_messages = chat.chat_history[-6:] if len(chat.chat_history) > 6 else chat.chat_history
    chat_history_str = "\n".join([
        f"{msg.role.upper()}: {msg.content[:200]}{'...' if len(msg.content) > 200 else ''}"
        for msg in recent_messages
    ])
    
    # Create the prompt
    prompt = get_response_generation_prompt(memory_str, chat_history_str, request.message)
    
    # TODO: Replace with actual Claude model call
    # For now, using placeholder response
    async def generate_response():
        # Placeholder response - will be replaced with actual Claude call
        response_text = f"Contextual response to: {request.message}\n\nMemory: {memory_str[:100]}...\n\nChat History: {chat_history_str[:100]}..."
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