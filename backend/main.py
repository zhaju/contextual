import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager
import asyncio
import asyncio
import json
import uuid
from datetime import datetime
from custom_types import *
from prompts import get_response_generation_prompt
from groq_caller import GroqCaller
from claude_caller import ClaudeCaller
from data_init.load_initial_chats import load_initial_chats
from chat_memory_updater import ChatMemoryUpdater, consolidate_chats_into_memory
from title_creator import create_chat_title
from select_context import get_selected_chats, is_context_required

# Global callers - initialized in lifespan
groq_caller: Optional[GroqCaller] = None
claude_caller: Optional[ClaudeCaller] = None
memory_updater: Optional[ChatMemoryUpdater] = None

# In-memory storage (replace with database in production)
chats_db: Optional[Dict[str, Chat]] = None

async def generate_chat_response(chat_id: str) -> StreamingResponse:
    """
    Generate a streaming chat response using Claude and update memory.
    
    Args:
        chat_id: ID of the chat to generate response for
        
    Returns:
        StreamingResponse: SSE response with generated content
    """
    if chats_db is None or chat_id not in chats_db:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    chat = chats_db[chat_id]
    
    # Get memory as string for context
    memory_str = chat.current_memory.to_llm_str()
    
    # Get last 6 chat messages (truncated)
    recent_messages = chat.chat_history[-6:] if len(chat.chat_history) > 6 else chat.chat_history
    
    # Get the last user message (should be the most recent)
    user_message = None
    for msg in reversed(chat.chat_history):
        if msg.role == "user":
            user_message = msg
            break
    
    if user_message is None:
        raise HTTPException(status_code=400, detail="No user message found in chat history")
    
    # Create the system message and messages list
    system_message, messages = get_response_generation_prompt(
        memory_str, 
        recent_messages, 
        user_message.content
    )
    
    async def generate_response():
        if claude_caller is None:
            # Fallback if Claude is not available
            error_response = "Claude API is not available. Please check your configuration."
            yield f"data: {json.dumps({'content': error_response})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
            return
        
        # Use Claude to generate the response
        response_text = ""
        try:
            async for chunk in claude_caller.call_claude(messages=messages, system=system_message):
                response_text += chunk
                yield f"data: {json.dumps({'content': chunk})}\n\n"
            
            # Add assistant response to chat history
            assistant_message = ChatMessage(
                role="assistant",
                content=response_text,
                timestamp=datetime.now()
            )
            chats_db[chat_id].chat_history.append(assistant_message)
            
            # Update memory with the new messages (user + assistant)
            if memory_updater is not None:
                try:
                    messages_to_update = [user_message, assistant_message]
                    await memory_updater.update_memory(chat_id, messages_to_update)
                except Exception as e:
                    print(f"⚠️ Failed to update memory for chat {chat_id}: {e}")
            
            yield f"data: {json.dumps({'done': True})}\n\n"
            
        except Exception as e:
            # Handle errors gracefully
            error_response = f"Error generating response: {str(e)}"
            yield f"data: {json.dumps({'content': error_response})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
    
    return StreamingResponse(
        generate_response(),
        media_type="text/plain",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )

"""
chat_db format:
"""
sample_chats_db = {
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


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan - startup and shutdown events"""
    global groq_caller, claude_caller, memory_updater, chats_db
    
    # Startup
    try:
        groq_caller = GroqCaller()
        print("✅ GroqCaller initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize GroqCaller: {e}")
        groq_caller = None
    
    try:
        claude_caller = ClaudeCaller()
        print("✅ ClaudeCaller initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize ClaudeCaller: {e}")
        claude_caller = None
    
    # Initialize chats_db as empty dict first
    chats_db = {}
    # Load initial chats
    if os.environ.get("LOAD_INITIAL_CHATS", "false").lower() == "true":
        if groq_caller is not None:
            initial_chats = await load_initial_chats(groq_caller)
            chats_db.update(initial_chats)
            print(f"✅ Loaded {len(chats_db)} initial chats")
        else:
            print("⚠️ Skipping initial chat loading - GroqCaller not available")
    else:
        chats_db = sample_chats_db
    
    try:
        memory_updater = ChatMemoryUpdater(chat_db=chats_db)
        print("✅ ChatMemoryUpdater initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize ChatMemoryUpdater: {e}")
        memory_updater = None
    
    
    yield
    
    # Shutdown
    groq_caller = None
    claude_caller = None
    memory_updater = None
    chats_db = None
    print("🔄 API callers cleaned up")

app = FastAPI(title="Contextual Chat API", version="1.0.0", lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev server ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", response_model=RootResponse)
async def root():
    return RootResponse(message="Contextual Chat API", version="1.0.0")

@app.get("/chats", response_model=List[Chat])
async def list_chats():
    """
    Get list of all chats sorted by most recent first
    """
    if chats_db is None:
        return []
    
    # Sort chats by the timestamp of their most recent message (reverse chronological order)
    def get_latest_timestamp(chat: Chat) -> datetime:
        if not chat.chat_history:
            return datetime.min  # If no messages, put at the end
        return max(msg.timestamp for msg in chat.chat_history)
    
    chats = list(chats_db.values())
    return sorted(chats, key=get_latest_timestamp, reverse=True)

@app.get("/chats/{chat_id}", response_model=Chat)
async def get_chat(chat_id: str):
    """
    Get a specific chat by ID
    """
    if chats_db is None or chat_id not in chats_db:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chats_db[chat_id]

@app.post("/chats/send", response_model=StreamedChatResponse)
async def send_message(request: SendMessageToChatRequest):
    """
    Send a message to a chat and get SSE response from GPT
    """
    if chats_db is None or request.chat_id not in chats_db:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Add user message to chat history
    user_message = ChatMessage(
        role="user",
        content=request.message,
        timestamp=datetime.now()
    )
    chats_db[request.chat_id].chat_history.append(user_message)
    
    # Check if additional context is required
    if groq_caller is not None:
        try:
            # Check if context is required
            context_required = await is_context_required(
                memory=chats_db[request.chat_id].current_memory,
                chat_history_messages=chats_db[request.chat_id].chat_history,
                user_query=request.message,
                groq_caller=groq_caller
            )
            
            if context_required:
                # Get relevant chats from all available chats
                all_chats = list(chats_db.values())
                # Remove the current chat from the list to avoid self-reference
                other_chats = [chat for chat in all_chats if chat.id != request.chat_id]
                
                if other_chats:
                    # Select up to 5 relevant chats
                    relevant_chats = await get_selected_chats(other_chats, request.message, groq_caller, 5)
                    
                    # Return a single streaming response with context
                    async def context_response():
                        relevant_chat_list = RelevantChatList(relevant_chats=relevant_chats)
                        yield f"data: {json.dumps({'done': True, 'hasContext': True, 'context': relevant_chat_list.model_dump()})}\n\n"
                    
                    return StreamingResponse(
                        context_response(),
                        media_type="text/plain",
                        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
                    )
                else:
                    # No other chats available, proceed with normal response
                    pass
        except Exception as e:
            print(f"⚠️ Failed to check context requirement: {e}")
            # Continue with normal response generation
    
    # Use the extracted response generation function
    return await generate_chat_response(request.chat_id)



@app.post("/chats/new", response_model=ContextResponse)
async def new_chat(request: SendMessageRequest):
    """
    Create a new chat with first message and context prompt
    """
    global chats_db
    if chats_db is None:
        chats_db = {}
    
    chat_id = str(uuid.uuid4())
    
    # Get relevant chats using AI-powered selection with strict relevance criteria
    relevant_chats = []
    
    if groq_caller is not None and len(chats_db) > 0:
        try:
            # Convert chats_db to list for selection
            all_chats = list(chats_db.values())
            print(f"🔍 Analyzing {len(all_chats)} available chats for relevance to: '{request.message[:50]}...'")
            
            # Use strict selection - only select up to 2 highly relevant chats
            # Better to have fewer, highly relevant chats than many loosely related ones
            relevant_chats = await get_selected_chats(all_chats, request.message, groq_caller, 5)
            
            if relevant_chats:
                print(f"✅ Found {len(relevant_chats)} highly relevant chats for context")
            else:
                print("ℹ️ No highly relevant chats found - new chat will start with empty context")
                
        except Exception as e:
            print(f"⚠️ Failed to select relevant chats: {e}")
            relevant_chats = []
    
    # Create initial memory as completely empty
    initial_memory = Memory(
        summary_string="",
        blocks=[]
    )
    
    # Create chat history with first message
    chat_history = [
        ChatMessage(
            role="user",
            content=request.message,
            timestamp=datetime.now()
        )
    ]
    
    # Generate title using AI
    title = await create_chat_title(chat_history, groq_caller)
    
    # Create new chat
    new_chat = Chat(
        id=chat_id,
        current_memory=initial_memory,
        title=title,
        chat_history=chat_history
    )
    
    # Store chat
    chats_db[chat_id] = new_chat
    
    return ContextResponse(relevant_chats=relevant_chats, chat_id=chat_id)



@app.post("/chats/set_context")
async def new_chat_context_set(request: SetChatContextRequest):
    """
    Set context for a chat and get SSE response from GPT
    """
    if chats_db is None or request.chat_id not in chats_db:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    if groq_caller is None:
        raise HTTPException(status_code=503, detail="GroqCaller not available")
    
    # Consolidate the provided chats into memory using AI
    consolidated_memory = await consolidate_chats_into_memory(
        chats=request.required_context,
        user_query="Setting context for chat",
        groq_caller=groq_caller
    )
    
    # Update chat memory with consolidated context
    chats_db[request.chat_id].current_memory = consolidated_memory
    
    # Use the extracted response generation function
    return await generate_chat_response(request.chat_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)