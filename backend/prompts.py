"""
Prompts for the Contextual Chat API
Contains all the prompts used for different operations
"""
from typing import List, Dict, Any
from custom_types import ChatMessage, Chat, ChatSelectionResponse

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
3. Create a concise summary that captures the essence of the conversation, which should be at most 15 words.
4. Focus on information that would be useful for future conversations.
5. Keep the summary clear and well-organized
6. Build off existing memory blocks but make sure to include the most recent information
    6a. Use at most 4 blocks, if need be make the description longer.
    6b. If need be, remove/merge other topics to make space for new blocks (if the new messages don't fit in the topics)
7. Topics should be specific and summaries should be concise.
8. Ensure that personal ideas are included, and if space allows, include relevant factual information.
"""
    
    system_memory = f"""EXISTING MEMORY BLOCKS:
{memory_str}

Please provide a structured memory summary.
"""
    
    user_message = f"""NEW CHAT MESSAGES TO ANALYZE:
{chat_history}
"""
    
    return [
        {"role": "system", "content": system_overview},
        {"role": "system", "content": system_memory},
        {"role": "user", "content": user_message}
    ]


def get_chat_consolidation_prompt(chats: List[Chat], user_query: str) -> List[Dict[str, str]]:
    """
    Generate a list of messages for consolidating multiple chats into a comprehensive memory
    
    Args:
        chats: List of Chat objects to consolidate
        user_query: The user query that these chats are relevant to
        
    Returns:
        List[Dict[str, str]]: List of message dictionaries for Groq API
    """
    system_overview = """
You are a memory consolidation assistant designed to analyze multiple chat conversations and create a comprehensive, well-organized memory structure. Your task is to extract the most valuable information from these conversations and organize it into a coherent memory that captures key insights, topics, and context.

INSTRUCTIONS:
1. Analyze all provided chat conversations thoroughly
2. Identify the main topics, themes, and insights across all chats
3. Extract key information, facts, and personal insights
4. Create a comprehensive summary that captures the essence of all conversations (at most 20 words)
5. Organize information into specific, well-defined memory blocks
6. Focus on information that would be most useful for future conversations
7. Ensure personal ideas and insights are prioritized over generic factual information
8. Use at most 6 memory blocks to organize the information effectively
9. Make descriptions concise but comprehensive
10. Remove redundancy and merge related topics when appropriate
"""
    
    # Convert chats to string format
    chats_summary = ""
    for i, chat in enumerate(chats, 1):
        chat_title = chat.title
        chat_memory = chat.current_memory.to_llm_str()
        
        # Get recent chat history (last 4 messages to keep it manageable)
        recent_messages = chat.chat_history[-4:] if len(chat.chat_history) > 4 else chat.chat_history
        chat_history_str = "\n".join([
            f"{msg.role.upper()}: {msg.content}"
            for msg in recent_messages
        ])
        
        chats_summary += f"""
CHAT {i}: {chat_title}
Memory: {chat_memory}
"""
    
    system_context = f"""CHATS TO CONSOLIDATE:
{chats_summary}

Consolidate information from all chats into a coherent, well-organized memory structure.
"""
    
    user_message = f"""USER QUERY CONTEXT:
{user_query}

Please create a comprehensive memory that consolidates the most relevant information from all the provided chats, organized in a way that would be most helpful for addressing this query and similar future conversations.
"""
    
    return [
        {"role": "system", "content": system_overview},
        {"role": "system", "content": system_context},
        {"role": "user", "content": user_message}
    ]


def get_context_retrieval_prompt(chats: List[Chat], query: str, groq_caller, num_chats: int) -> List[Dict[str, str]]:
    """
    Generate a list of messages for selecting relevant chats based on a query
    
    Args:
        chats: List of Chat objects to select from
        query: The query or topic to find context for
        groq_caller: GroqCaller instance for making API calls
        num_chats: Number of chats to select
        
    Returns:
        List[Dict[str, str]]: List of message dictionaries for Groq API
    """
    # System prompt for instructions
    system_instructions = f"""You are a context assistant tasked with selecting the most likely chats that may aid in answering a specific query. Your job is to analyze the query and identify chats from a provided list that could contain relevant context.

GUIDELINES FOR RELEVANCE:
1. Prioritize chats that are clearly relevant to the query.
2. If you are unsure about a chat’s relevance, include it.
3. Consider both the memory summary and the topics discussed in each chat.

SELECTION CRITERIA:
- Include chats that may reasonably contain helpful or tangentially relevant information.
- Relevance can be direct or indirect, as long as it might help understand or answer the query.
- Avoid chats that are clearly off-topic or unrelated.
- If no chats seem useful at all, return an empty list.

INSTRUCTIONS:
1. Analyze the query to understand what kind of information is being asked for.
2. Review each chat's memory summary and topics.
3. Select UP TO {num_chats} chats that could be relevant (even if uncertain).
4. Return the 1-indexed positions of selected chats in the selected_indices array.
5. If no chats seem relevant at all, return an empty selected_indices array.

You must respond with a JSON object containing a "selected_indices" array of integers."""

    # System prompt for ordered list of chats
    chat_list = ""
    for i, chat in enumerate(chats, 1):
        chat_list += f"{i}. Chat ID: {chat.id}\n"
        chat_list += f"   Title: {chat.title}\n"
        chat_list += f"   Memory Summary: {chat.current_memory.summary_string}\n"
        chat_list += f"   Memory Blocks:\n"
        for block in chat.current_memory.blocks:
            chat_list += f"     - Topic: {block.topic}\n"
            # don't include description
            # chat_list += f"       Description: {block.description[:100]}\n"
        chat_list += "\n"
    
    system_chat_list = f"""AVAILABLE CHATS:
{chat_list.strip()}"""

    # User prompt with the query
    user_message = f"""QUERY:
{query}

IMPORTANT: Only select chats that are HIGHLY relevant to this specific query. If no chats are directly relevant, return an empty selected_indices array. Better to have no context than irrelevant context.

Select up to {num_chats} highly relevant chats (or fewer if none meet the strict relevance criteria). Return a JSON object with the selected_indices array."""

    return [
        {"role": "system", "content": system_instructions},
        {"role": "system", "content": system_chat_list},
        {"role": "user", "content": user_message}
    ]


def get_chat_title_generation_prompt(messages: List[ChatMessage]) -> tuple[str, str]:
    """
    Generate system and user prompts for creating a chat title from messages
    
    Args:
        messages: List of ChatMessage objects from the chat
        
    Returns:
        tuple: (system_prompt, user_prompt) for title generation
    """
    system_prompt = """You are a helpful assistant that creates concise, descriptive titles for chat conversations.

INSTRUCTIONS:
1. Create a title that captures the main topic or intent of the conversation
2. Keep it under 50 characters
3. Make it clear and descriptive
4. Avoid generic titles like "New Chat" or "Conversation"
5. Focus on the primary subject matter or question being discussed
6. Use title case formatting

Please provide a good title for this chat."""
    
    # Format the messages for the user prompt
    message_text = ""
    for msg in messages:
        role = "User" if msg.role == "user" else "Assistant"
        message_text += f"{role}: {msg.content}\n"
    
    user_prompt = f"""Create a title for a chat with the following messages:

{message_text.strip()}

Please provide a concise, descriptive title."""
    
    return system_prompt, user_prompt
