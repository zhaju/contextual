from pydantic import BaseModel, Field
from typing import List, Optional, Union, Literal
from datetime import datetime


# Output schema for root endpoint
class RootResponse(BaseModel):
    message: str = Field(description="Response message from the root endpoint")
    version: str = Field(description="Current version of the API")


# Chat class stores all chat context, including distilled memories and block summaries
class Block(BaseModel):
    topic: str = Field(description="The main topic or subject of this memory block")
    description: str = Field(description="Detailed description of the memory block content")

class Memory(BaseModel):
    summary_string: str = Field(default="", description="A brief summary of the memory (at most 18 words)")
    blocks: List[Block] = Field(default_factory=list, description="List of memory blocks with topics and descriptions")
    
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
    role: Union[Literal["user"], Literal["assistant"]] = Field(description="The role of the message sender - either 'user' or 'assistant'")
    content: str = Field(description="The actual message content or text")
    timestamp: datetime = Field(description="When the message was created or sent")

class Chat(BaseModel):
    id: str = Field(description="Unique identifier for the chat session")
    current_memory: Memory = Field(description="The current memory state containing distilled memories and block summaries")
    title: str = Field(description="Human-readable title for the chat session")
    chat_history: List[ChatMessage] = Field(description="Complete history of messages in this chat")


# Define request schemas

# SendMessageRequest is the base request for sending a message to the chat
class SendMessageRequest(BaseModel):
    message: str = Field(description="The message content to send to the chat")

# SendMessageToChatRequest is the request for sending a message to a specific chat
class SendMessageToChatRequest(SendMessageRequest):
    chat_id: str = Field(description="The unique identifier of the chat to send the message to")

# DeleteChatRequest is the request for deleting a chat
class DeleteChatRequest(BaseModel):
    chat_id: str = Field(description="The unique identifier of the chat to delete")

# Define response schemas

class RelevantChatList(BaseModel):
    relevant_chats: List[Chat] = Field(description="List of chats that are relevant to the current context")

# ContextResponse returns a list of relevant contexts to the chat
class ContextResponse(BaseModel):
    relevant_chats: List[Chat] = Field(description="List of chats that are relevant to the current context")
    chat_id: str = Field(description="The unique identifier of the current chat")

# StreamedChatResponse is the response for streaming a chat response
class StreamedChatResponse(BaseModel):
    content: Optional[str] = Field(default=None, description="Partial or complete content of the streaming response")
    done: Optional[bool] = Field(default=None, description="Indicates whether the streaming response is complete")
    hasContext: Optional[bool] = Field(default=None, description="Indicates whether this response contains context information")
    context: Optional[RelevantChatList] = Field(default=None, description="List of relevant chats for context when hasContext is True")


class SetChatContextRequest(BaseModel):
    chat_id: str = Field(description="The unique identifier of the chat to set context for")
    required_context: List[Chat] = Field(description="List of chats that should be used as context for this chat")

# Response model for chat selection
class ChatSelectionResponse(BaseModel):
    selected_indices: List[int] = Field(description="1-indexed list of selected chat indices, MUST BE BETWEEN 1 AND THE NUMBER OF CHATS, COMMA SEPARATED")

