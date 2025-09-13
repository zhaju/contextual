import os
from anthropic import AsyncAnthropic
from typing import Dict, List, AsyncGenerator
import asyncio
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class ClaudeCaller:
    def __init__(self) -> None:
        self.client = AsyncAnthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    async def call_claude(self, messages: List[Dict], model: str = "claude-sonnet-4-20250514", stream: bool = True):
        """
        Call Claude API with streaming support
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
            model: The model to use (default: "claude-sonnet-4-20250514")
            stream: Whether to stream the response
            
        Yields:
            str: Content chunks from the streaming response
        """
        try:
            completion = await self.client.messages.create(
                model=model,
                messages=messages,
                max_tokens=8192,
                temperature=1,
                top_p=1,
                stream=stream,
            )

            if not stream:
                raw_text = "".join([c.text for c in completion.content if c.type == "text"])
                yield raw_text
            else:
                async for event in completion:
                    # Anthropic streaming events have different types
                    if event.type == "content_block_delta":
                        if hasattr(event.delta, 'text'):
                            yield event.delta.text
        except Exception as e:
            yield f"Error calling Claude API: {str(e)}"


    async def call_claude_single(self, messages: List[Dict], model: str = "claude-sonnet-4-20250514") -> str:
        """
        Single non-streaming call to Claude API that returns the complete response
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
            model: The model to use (default: "claude-sonnet-4-20250514")
            
        Returns:
            str: The complete response
        """
        response = ""
        
        async for chunk in self.call_claude(messages, model, stream=False):
            response += chunk
            
        return response

    async def call_claude_simple(self, message: str, model: str = "claude-sonnet-4-20250514") -> str:
        """
        Simple non-streaming call to Claude API with a single user message
        
        Args:
            message: The user message
            model: The model to use (default: "claude-sonnet-4-20250514")
            
        Returns:
            str: The complete response
        """
        messages = [{"role": "user", "content": message}]
        return await self.call_claude_single(messages, model)

# Example usage
async def main():
    caller = ClaudeCaller()
    
    # Streaming example
    print("Streaming response:")
    async for chunk in caller.call_claude(
        messages=[{"role": "user", "content": "Explain the importance of fast language models"}]
    ):
        print(chunk, end="")
    
    print("\n\nSingle call example:")
    response = await caller.call_claude_single(
        messages=[{"role": "user", "content": "Count from 1 to 3"}]
    )
    print(response)
    
    print("\nSimple call example:")
    response = await caller.call_claude_simple("Explain the importance of fast language models")
    print(response)

if __name__ == "__main__":
    asyncio.run(main())