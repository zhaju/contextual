
import anthropic
import re
import os

# Initialize Claude client using environment variable
api_key = os.getenv("ANTHROPIC_API_KEY")
if not api_key:
    raise RuntimeError("ANTHROPIC_API_KEY environment variable not set. Please set it before running this script.")
client = anthropic.Anthropic(api_key=api_key)

# Load your parsed txt
with open("chat_history.txt", "r", encoding="utf-8") as f:
    raw_text = f.read()

# --- Step 1: Split into chats ---
# Assuming chats are separated by a line like "===" or some marker.
# Adjust this regex to whatever separates your chats.
chats = re.split(r"\n=+\n", raw_text.strip())

print(f"Found {len(chats)} chats.")

# --- Step 2: Summarize each chat ---
def summarize_chat(chat_text):
    prompt = f"""
You are given the text of a single chat history between a user and an AI assistant.

Chat:
{chat_text}

Task:
Summarize this chat into a list of exactly 5 high-level ideas.
Each idea should be described in one sentence.
Output as a numbered list.
"""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",  # best balance of speed/cost/quality
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}]
    )

    return response.content[0].text

# --- Step 3: Run through all chats ---
all_summaries = []
for i, chat in enumerate(chats, start=1):
    summary = summarize_chat(chat)
    all_summaries.append(f"Chat {i}:\n{summary}\n")

# Save to file
with open("chat_summaries.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(all_summaries))

print("Summaries saved to chat_summaries.txt")
