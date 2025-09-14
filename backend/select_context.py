"""
Context selection module for the Contextual Chat API
Contains functions for selecting relevant chats based on queries
"""
from typing import List

from pydantic import BaseModel, Field
from custom_types import Chat, ChatSelectionResponse, Memory, ChatMessage
from groq_caller import GroqCaller
from prompts import get_context_retrieval_prompt, get_topic_change_detection_prompt


async def get_selected_chats(chats: List[Chat], query: str, groq_caller: GroqCaller, num_chats: int) -> List[Chat]:
    """
    Select the most relevant chats based on a query using AI-powered selection
    
    Args:
        chats: List of Chat objects to select from
        query: The query or topic to find context for
        groq_caller: GroqCaller instance for making API calls
        num_chats: Number of chats to select
        
    Returns:
        List[Chat]: List of selected Chat objects (1-indexed from input list)
    """
    # Generate the prompt for context retrieval
    messages = get_context_retrieval_prompt(chats, query, groq_caller, num_chats)
    
    def make_chat_selection_schema(num_chats: int):
        namespace = {"__annotations__": {}}
        for i in range(1, num_chats + 1):
            field_name = f"chat_selection_{i}"
            namespace["__annotations__"][field_name] = int
            namespace[field_name] = Field(..., description=f"The {i}-th most relevant chat for the user query")
        return type("ChatSchema", (BaseModel,), namespace)
    CHAT_SELECTION_TYPE = make_chat_selection_schema(num_chats)
    # Call Groq API to get the selected chat indices with structured output
    response = await groq_caller.call_groq_single(messages, response_format=CHAT_SELECTION_TYPE)

    
    # Handle the structured response
    try:
        if isinstance(response, CHAT_SELECTION_TYPE):
            selected_indices = response.model_dump().values()
        else:
            # Fallback if response format parsing failed
            print(f"Failed to parse structured response: {response}")
            return []
        
        # Handle empty selection
        if not selected_indices:
            print("No highly relevant chats found - returning empty list")
            return []
        
        # Validate indices and convert 1-indexed to 0-indexed
        selected_chats = []
        selected_ids = set()
        for idx in selected_indices:
            if idx == 0:
                continue
            elif 1 <= idx <= len(chats):
                if idx not in selected_ids:
                    selected_chats.append(chats[idx - 1])  # Convert to 0-indexed
            else:
                print(f"Warning: Invalid index {idx} (out of range 1-{len(chats)})")
        
        # Log the selection for debugging
        if selected_chats:
            print(f"Selected {len(selected_chats)} highly relevant chats")
        else:
            print("No valid chats selected - returning empty list")
        
        return selected_chats
        
    except Exception as e:
        # If anything fails, return empty list
        print(f"Error processing chat selection response: {e}")
        return []


class ContextRequirementResponse(BaseModel):
    """Response model for context requirement detection"""
    requires_additional_context: bool = Field(
        ..., 
        description="True if the query represents a major topic change requiring additional context from past chats, False otherwise"
    )


async def is_context_required(memory: Memory, chat_history_messages: List[ChatMessage], user_query: str, groq_caller: GroqCaller) -> bool:
    """
    Determine if a user query requires additional context from past chats
    
    Args:
        memory: Memory object containing current memory
        chat_history_messages: List of recent chat messages
        user_query: The current user query to analyze
        groq_caller: GroqCaller instance for making API calls
        
    Returns:
        bool: True if additional context is required, False otherwise
    """
    # Convert memory to string and get recent messages (last 6, truncated)
    memory_str = memory.to_llm_str()
    recent_messages = chat_history_messages[-6:] if len(chat_history_messages) > 6 else chat_history_messages
    
    # Generate the prompt for topic change detection
    messages = get_topic_change_detection_prompt(memory_str, recent_messages, user_query)
    
    try:
        # Call Groq API to get the context requirement with structured output
        response = await groq_caller.call_groq_single(messages, response_format=ContextRequirementResponse)
        
        # Handle the structured response
        if isinstance(response, ContextRequirementResponse):
            return response.requires_additional_context
        else:
            # Fallback if response format parsing failed
            print(f"Failed to parse structured response for context requirement: {response}")
            return False
            
    except Exception as e:
        # If anything fails, default to False (no additional context required)
        print(f"Error processing context requirement response: {e}")
        return False
