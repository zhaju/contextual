import os
from groq import AsyncGroq
from groq.types.chat.completion_create_params import ResponseFormat
from groq._types import NotGiven
from typing import Dict, List, AsyncGenerator, TypeVar, Type, Union
import asyncio

from pydantic import BaseModel

T = TypeVar('T', bound=BaseModel)

class GroqCaller:
    def __init__(self) -> None:
        self.client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))

    async def call_groq(self, messages: List[Dict], model: str = "openai/gpt-oss-20b", response_format: type[BaseModel] | None = None, stream: bool = True) -> AsyncGenerator[str, None]:
        """
        Call Groq API with streaming support
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
            model: The model to use (default: "openai/gpt-oss-20b")
            response_format: Optional Pydantic model for structured output
            stream: Whether to stream the response
            
        Yields:
            str: Content chunks from the streaming response
        """
        try:
            groq_response_format = {
                    "type": "json_schema",
                    "json_schema": {
                        "name": "response_format",
                        "schema": response_format.model_json_schema()
                    }
                } if response_format else None
            
            completion = await self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=1,
                max_completion_tokens=8192,
                top_p=1,
                stream=stream,
                stop=None,
                response_format=groq_response_format
            )
            
            if stream:
                async for chunk in completion:
                    if chunk.choices[0].delta.content:
                        yield chunk.choices[0].delta.content
            else:
                # Non-streaming response
                yield completion.choices[0].message.content
                
        except Exception as e:
            yield f"Error calling Groq API: {str(e)}"

    async def call_groq_single(self, messages: List[Dict], model: str = "openai/gpt-oss-20b", response_format: Type[T] | None = None) -> Union[str, T]:
        """
        Single non-streaming call to Groq API that returns the complete response
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
            model: The model to use (default: "openai/gpt-oss-20b")
            response_format: Optional Pydantic model for structured output
            
        Returns:
            Union[str, T]: The complete response as string or parsed Pydantic model
        """
        response = ""
        
        async for chunk in self.call_groq(messages, model, response_format=response_format, stream=False):
            response += chunk
            
        if response_format:
            try:
                parsed = response_format.model_validate_json(response)
                return parsed
            except Exception as e:
                # Return error message with raw response for debugging
                return f"Error parsing response into {response_format.__name__}: {str(e)}\nRaw response: {response}"
        return response

    async def call_groq_simple(self, message: str, model: str = "openai/gpt-oss-20b", response_format: Type[T] | None = None) -> Union[str, T]:
        """
        Simple non-streaming call to Groq API with a single user message
        
        Args:
            message: The user message
            model: The model to use (default: "openai/gpt-oss-20b")
            response_format: Optional Pydantic model for structured output
            
        Returns:
            Union[str, T]: The complete response as string or parsed Pydantic model
        """
        messages = [{"role": "user", "content": message}]
        return await self.call_groq_single(messages, model, response_format)

# Example usage
async def main():
    caller = GroqCaller()
    
    # Streaming example
    print("Streaming response:")
    async for chunk in caller.call_groq(
        messages=[{"role": "user", "content": "Hello there!"}]
    ):
        print(chunk, end="")
    
    print("\n\nSingle call example:")
    response = await caller.call_groq_single(
        messages=[{"role": "user", "content": "Count from 1 to 3"}]
    )
    print(response)
    
    print("\nSimple call example:")
    response = await caller.call_groq_simple("Explain the importance of fast language models")
    print(response)

if __name__ == "__main__":
    asyncio.run(main())