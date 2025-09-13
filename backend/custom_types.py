from pydantic import BaseModel
from typing import List, Optional, Union, Literal
from datetime import datetime


# Output schema for root endpoint
class RootResponse(BaseModel):
    message: str
    version: str


# Chat class stores all chat context, including distilled memories and block summaries
class Block(BaseModel):
    topic: str
    description: str

class Memory(BaseModel):
    summary_string: str = ""
    blocks: List[Block] = []
    
    def to_llm_str(self) -> str:
        """
        Convert memory to a string format suitable for LLM consumption
        
        Returns:
            str: Formatted memory string
        """
        result = f"Memory Summary: {self.summary_string}\n\n"
        
        if self.blocks:
            result += "Memory Blocks:\n"
            for i, block in enumerate(self.blocks, 1):
                result += f"{i}. Topic: {block.topic}\n"
                result += f"   Description: {block.description}\n\n"
        
        return result.strip()

class ChatMessage(BaseModel):
    role: Union[Literal["user"], Literal["assistant"]]
    content: str
    timestamp: datetime

class Chat(BaseModel):
    id: str
    current_memory: Memory
    title: str
    chat_history: List[ChatMessage]


# Define request schemas

# SendMessageRequest is the base request for sending a message to the chat
class SendMessageRequest(BaseModel):
    message: str

# SendMessageToChatRequest is the request for sending a message to a specific chat
class SendMessageToChatRequest(SendMessageRequest):
    chat_id: str

# Define response schemas

# ContextResponse returns a list of relevant contexts to the chat
class ContextResponse(BaseModel):
    relevant_chats: List[Chat]

# StreamedChatResponse is the response for streaming a chat response
class StreamedChatResponse(BaseModel):
    content: Optional[str] = None
    done: Optional[bool] = None


class SetChatContextRequest(BaseModel):
    chat_id: str
    required_context: List[str] # List of chat IDs for now #TODO
