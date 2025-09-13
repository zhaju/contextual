"""
Context selection module for the Contextual Chat API
Contains functions for selecting relevant chats based on queries
"""
from typing import List
from custom_types import Chat
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
    
    # Call Groq API to get the selected chat indices
    response = await groq_caller.call_groq_single(messages)
    
    # Parse the response to extract the selected indices
    try:
        # Clean the response and split by commas
        selected_indices_str = str(response).strip()
        selected_indices = [int(idx.strip()) for idx in selected_indices_str.split(',')]
        
        # Convert 1-indexed to 0-indexed and get the selected chats
        selected_chats = []
        for idx in selected_indices:
            if 1 <= idx <= len(chats):
                selected_chats.append(chats[idx - 1])  # Convert to 0-indexed
        
        return selected_chats
        
    except (ValueError, IndexError) as e:
        # If parsing fails, return empty list or handle error as needed
        print(f"Error parsing selected chat indices: {e}")
        print(f"Raw response: {response}")
        return []
