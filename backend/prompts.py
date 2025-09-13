"""
Prompts for the Contextual Chat API
Contains all the prompts used for different operations
"""

def get_response_generation_prompt(memory_str: str, chat_history_str: str, user_message: str) -> str:
    """
    Generate a prompt for creating a response given memory and chat history
    
    Args:
        memory_str: String representation of current memory
        chat_history_str: String representation of last 6 chat messages (truncated)
        user_message: The current user message
        
    Returns:
        str: The complete prompt for response generation
    """
    return f"""You are a helpful AI assistant with access to contextual memory and chat history.

CURRENT MEMORY:
{memory_str}

RECENT CHAT HISTORY (last 6 messages, truncated):
{chat_history_str}

CURRENT USER MESSAGE:
{user_message}

INSTRUCTIONS:
1. Use the memory and chat history to provide a contextual and relevant response
2. Consider the conversation flow and previous topics discussed
3. Reference relevant information from memory when appropriate
4. Maintain conversation continuity
5. Be helpful, accurate, and engaging

Please provide a thoughtful response that takes into account the context and memory provided."""

def get_memory_summarization_prompt(chat_history: str) -> str:
    """
    Generate a prompt for summarizing chat history into memory blocks
    
    Args:
        chat_history: String representation of chat history
        
    Returns:
        str: The prompt for memory summarization
    """
    return f"""You are tasked with creating a memory summary from the following chat history.

CHAT HISTORY:
{chat_history}

INSTRUCTIONS:
1. Identify the main topics and themes discussed
2. Extract key information, facts, and insights
3. Create a concise summary that captures the essence of the conversation
4. Focus on information that would be useful for future conversations
5. Keep the summary clear and well-organized

Please provide a structured memory summary."""

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
