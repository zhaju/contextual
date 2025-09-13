from custom_types import Chat
import uuid
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data_init.json_convo_parser import extract_conversations
from custom_types import Memory
from chat_memory_updater import updated_memory_with_messages

async def load_initial_chats(groq_model):
    raw_chats = extract_conversations("data_init/conversations.json")
    ret = {}
    for chat_messages in raw_chats:
        chat_id = str(uuid.uuid4())
        memories = await updated_memory_with_messages(Memory(), chat_messages, groq_model)
        print(memories.to_llm_str())        
        chat = Chat(
            id=chat_id,
            current_memory=memories,
            title="",
            chat_history=chat_messages
        )
        ret[chat_id] = chat
    return ret
