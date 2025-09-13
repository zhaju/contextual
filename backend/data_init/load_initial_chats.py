from custom_types import Chat
import json
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data_init.convo_parser import extract_conversations

def load_initial_chats():
    chats = extract_conversations("data_init/conversations.json")