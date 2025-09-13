"""
Context selection module for the Contextual Chat API
Contains functions for selecting relevant chats based on queries
"""
from typing import List
from custom_types import Chat, ChatSelectionResponse
from groq_caller import GroqCaller
from prompts import get_context_retrieval_prompt


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
    
    # Call Groq API to get the selected chat indices with structured output
    response = await groq_caller.call_groq_single(messages, response_format=ChatSelectionResponse)
    
    # Handle the structured response
    try:
        if isinstance(response, ChatSelectionResponse):
            selected_indices = response.selected_indices
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
        for idx in selected_indices:
            if 1 <= idx <= len(chats):
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
