"""
Prompts for the Contextual Chat API
Contains all the prompts used for different operations
"""
from typing import List, Dict, Any
from custom_types import ChatMessage

def get_response_generation_prompt(memory_str: str, chat_history_messages: List[ChatMessage], user_message: str) -> tuple[str, List[Dict[str, str]]]:
    """
    Generate a system message and list of messages for creating a response given memory and chat history
    
    Args:
        memory_str: String representation of current memory
        chat_history_messages: List of recent chat messages (last 6, truncated)
        user_message: The current user message
        
    Returns:
        tuple: (system_message, list of message dictionaries for Claude API)
    """
    # System message with memory and instructions
    system_message = f"""You are a helpful AI assistant capable of engaging in extremely intellectual, complex, and helpful converstaions with a user. You have access to "memory blocks", which are previous conversations you have had with the user. Each memory block contains a topic and description of that topic, which is very useful for you to reference when responding to the user.

INSTRUCTIONS:
1. Use the memory blocks and chat history to provide a contextual and relevant response
2. Consider the conversation flow and previous topics discussed
3. Reference relevant information from memory blocks when appropriate
4. Maintain conversation continuity
5. Be helpful, accurate, and engaging

CURRENT MEMORY:
{memory_str}

Please provide a thoughtful response that takes into account the context and memory provided."""

    # Build the message list: chat history + current user message
    messages = []
    
    # Add each chat history message as a separate message
    for msg in chat_history_messages:
        messages.append({
            "role": msg.role,
            "content": msg.content[:200] + "..." if len(msg.content) > 200 else msg.content
        })
    
    # Add the current user message
    messages.append({"role": "user", "content": user_message})
    
    return system_message, messages


def get_memory_summarization_prompt(chat_history: str, memory_str: str) -> List[Dict[str, str]]:
    """
    Generate a list of messages for summarizing chat history into memory blocks
    
    Args:
        chat_history: String representation of chat history
        memory_str: String representation of existing memory
        
    Returns:
        List[Dict[str, str]]: List of message dictionaries for Groq API
    """
    system_overview = """
You are a memory assistant designed to extract essential information from prior conversations for efficient recall and distill the conversation into topics and summaries, known as "memory blocks". Your task is to analyze chat transcripts and generate structured memory summaries that capture key information useful for future reference.

INSTRUCTIONS:
1. Identify the main topics and themes discussed
2. Extract key information, facts, and insights
3. Create a concise summary that captures the essence of the conversation
4. Focus on information that would be useful for future conversations
5. Keep the summary clear and well-organized
6. Build off existing memory blocks but feel free to reorganize topics and summaries if more appropriate
7. Topics should be specific and summaries should be concise and as descriptive as possible
"""
    
    system_memory = f"""EXISTING MEMORY BLOCKS:
{memory_str}

Please provide a structured memory summary.
"""
    
    user_message = f"""CHAT HISTORY TO ANALYZE:
{chat_history}
"""
    
    return [
        {"role": "system", "content": system_overview},
        {"role": "system", "content": system_memory},
        {"role": "user", "content": user_message}
    ]


def get_context_retrieval_prompt(query: str, available_chats: str) -> str:
    """
    Generate a prompt for retrieving relevant context from available chats
    
    Args:
        query: The query or topic to find context for
        available_chats: String representation of available chats
        
    Returns:
        str: The prompt for context retrieval
    """
    return f"""You need to find relevant context for the following query from the available chats.

QUERY:
{query}

AVAILABLE CHATS:
{available_chats}

INSTRUCTIONS:
1. Identify which chats contain relevant information for the query
2. Rank them by relevance
3. Extract the most pertinent information
4. Provide a summary of relevant context

Please identify and summarize the most relevant context for this query."""


def get_chat_title_generation_prompt(first_message: str) -> str:
    """
    Generate a prompt for creating a chat title from the first message
    
    Args:
        first_message: The first message in the chat
        
    Returns:
        str: The prompt for title generation
    """
    return f"""Create a concise, descriptive title for a chat that starts with this message:

FIRST MESSAGE:
{first_message}

INSTRUCTIONS:
1. Create a title that captures the main topic or intent
2. Keep it under 50 characters
3. Make it clear and descriptive
4. Avoid generic titles like "New Chat" or "Conversation"

Please provide a good title for this chat."""
