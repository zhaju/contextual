"""
Title Creator Module
Provides functionality to generate chat titles using AI
"""
from typing import List, Optional
from custom_types import ChatMessage
from prompts import get_chat_title_generation_prompt
from groq_caller import GroqCaller


class TitleCreator:
    """
    A class to handle chat title generation using AI
    """
    
    def __init__(self, groq_caller: Optional[GroqCaller] = None):
        """
        Initialize the TitleCreator
        
        Args:
            groq_caller: Optional GroqCaller instance. If None, will create a new one.
        """
        self.groq_caller = groq_caller or GroqCaller()
    
    async def generate_title(self, messages: List[ChatMessage]) -> str:
        """
        Generate a title for a chat based on its messages
        
        Args:
            messages: List of ChatMessage objects from the chat
            
        Returns:
            str: Generated title for the chat
        """
        # Get the system and user prompts
        system_prompt, user_prompt = get_chat_title_generation_prompt(messages)
        
        # Prepare messages for the API call
        api_messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        # Call Groq to generate the title
        response_text = await self.groq_caller.call_groq_single(messages=api_messages)
        
        return response_text


# Convenience function for direct usage
async def create_chat_title(messages: List[ChatMessage], groq_caller: Optional[GroqCaller] = None) -> str:
    """
    Convenience function to create a chat title
    
    Args:
        messages: List of ChatMessage objects from the chat
        groq_caller: Optional GroqCaller instance
        
    Returns:
        str: Generated title for the chat
    """
    title_creator = TitleCreator(groq_caller)
    return await title_creator.generate_title(messages)
