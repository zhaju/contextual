"""
Chat Memory Updater
Singleton class for safely updating chat memory with asyncio task management
"""
import asyncio
from typing import Dict, List, Optional, Any
from custom_types import Chat, ChatMessage, Memory, Block
from groq_caller import GroqCaller
from prompts import get_memory_summarization_prompt, get_chat_consolidation_prompt


async def updated_memory_with_messages(memory: Memory, messages: List[ChatMessage], groq_caller: GroqCaller) -> Memory:
    """
    Update a Memory object with new messages by creating a summary and adding it as a new block.
    
    Args:
        memory: The current Memory object to update
        messages: List of new messages to incorporate into memory
        groq_caller: GroqCaller instance for generating summaries
        
    Returns:
        Memory: Updated Memory object with new block added
    """
    try:
        # Convert messages to string format for summarization
        chat_history_str = "\n".join([
            f"{msg.role.upper()}: {msg.content}"
            for msg in messages
        ])
        
        # Get memory as string for context
        memory_str = memory.to_llm_str()
        
        # Create summarization prompt messages
        summarization_messages = get_memory_summarization_prompt(chat_history_str, memory_str)
        
        # Use Groq to summarize the new messages with call_groq_single and structured output
        summary_response = await groq_caller.call_groq_single(
            messages=summarization_messages,
            model="openai/gpt-oss-20b",
            response_format=Memory
        )
        
        # Check if we got a parsed Memory object or an error string
        if isinstance(summary_response, Memory):
            # Return the structured Memory object from Groq
            return summary_response
        else:
            # Fallback: create a new memory block from the error response
            print(f"⚠️ Failed to parse structured Memory response: {summary_response}")
            raise Exception(f"Failed to parse structured Memory response: {summary_response}")
        
    except Exception as e:
        print(f"❌ Failed to update memory: {e}")
        # Return original memory if update fails
        return memory


async def consolidate_chats_into_memory(chats: List[Chat], user_query: str, groq_caller: GroqCaller) -> Memory:
    """
    Consolidate multiple chats into a comprehensive Memory object using AI analysis.
    
    Args:
        chats: List of Chat objects to consolidate
        user_query: The user query that these chats are relevant to
        groq_caller: GroqCaller instance for generating consolidated memory
        
    Returns:
        Memory: Consolidated Memory object with information from all chats
    """
    try:
        if not chats:
            # Return empty memory if no chats provided
            return Memory(summary_string="", blocks=[])
        
        # Create consolidation prompt messages
        consolidation_messages = get_chat_consolidation_prompt(chats, user_query)
        
        # Use Groq to consolidate the chats into structured memory
        consolidated_memory = await groq_caller.call_groq_single(
            messages=consolidation_messages,
            model="openai/gpt-oss-20b",
            response_format=Memory
        )
        
        # Check if we got a parsed Memory object or an error string
        if isinstance(consolidated_memory, Memory):
            print(f"✅ Successfully consolidated {len(chats)} chats into memory")
            return consolidated_memory
        else:
            print(f"⚠️ Failed to parse consolidated Memory response: {consolidated_memory}")
            # Fallback: create a simple memory from the error response
            return Memory(
                summary_string=f"Consolidation of {len(chats)} chats failed",
                blocks=[
                    Block(
                        topic="consolidation_error",
                        description=str(consolidated_memory)
                    )
                ]
            )
        
    except Exception as e:
        print(f"❌ Failed to consolidate chats into memory: {e}")
        # Return empty memory if consolidation fails
        return Memory(summary_string="", blocks=[])


class ChatMemoryUpdater:
    """
    Class for safely updating chat memory with asyncio task management.
    Ensures only one memory update task runs per chat at a time.
    """
    
    def __init__(self, chat_db: Dict[str, Chat]):
        self.chat_db = chat_db
        self._update_tasks: Dict[str, asyncio.Task] = {}
        self._semaphore = asyncio.Semaphore(1)  # Only one thread allowed
        self._groq_caller = GroqCaller()
    
    async def update_memory(self, chat_id: str, messages: List[ChatMessage]) -> None:
        """
        Update memory for a specific chat with new messages.
        Creates a task that waits for any existing update task for this chat,
        then updates the memory and replaces the task in the dictionary.
        
        Args:
            chat_id: ID of the chat to update
            messages: List of new messages to incorporate into memory
        """
        async with self._semaphore:  # Ensure only one thread
            # Wait for any existing update task for this chat
            if chat_id in self._update_tasks:
                existing_task = self._update_tasks[chat_id]
                if not existing_task.done():
                    try:
                        await existing_task
                    except Exception as e:
                        print(f"Previous memory update task for {chat_id} failed: {e}")
            
            # Create new update task
            new_task = asyncio.create_task(
                self._perform_memory_update(chat_id, messages)
            )
            
            # Replace the task in the dictionary
            self._update_tasks[chat_id] = new_task
    
    async def _perform_memory_update(self, chat_id: str, messages: List[ChatMessage]) -> None:
        """
        Perform the actual memory update operation.
        
        Args:
            chat_id: ID of the chat to update
            messages: List of new messages to incorporate into memory
        """
        try:
            if chat_id not in self.chat_db:
                print(f"Chat {chat_id} not found in database")
                return
            
            # Get current chat and memory
            chat = self.chat_db[chat_id]
            current_memory = chat.current_memory
            
            # Use the standalone function to update memory
            new_memory = await updated_memory_with_messages(
                memory=current_memory,
                messages=messages,
                groq_caller=self._groq_caller
            )
            
            # Update the chat in the database
            chat.current_memory = new_memory
            
            print(f"✅ Memory updated for chat {chat_id}")
                
        except Exception as e:
            print(f"❌ Error in memory update for chat {chat_id}: {e}")
    
    async def wait_for_all_updates(self) -> None:
        """
        Wait for all pending memory update tasks to complete.
        Useful for graceful shutdown.
        """
        if self._update_tasks:
            tasks = list(self._update_tasks.values())
            await asyncio.gather(*tasks, return_exceptions=True)
            self._update_tasks.clear()
    
    def get_pending_tasks_count(self) -> int:
        """
        Get the number of pending memory update tasks.
        
        Returns:
            int: Number of pending tasks
        """
        return len([task for task in self._update_tasks.values() if not task.done()])
    
    def get_pending_chat_ids(self) -> List[str]:
        """
        Get list of chat IDs that have pending memory update tasks.
        
        Returns:
            List[str]: List of chat IDs with pending tasks
        """
        return [
            chat_id for chat_id, task in self._update_tasks.items()
            if not task.done()
        ]


