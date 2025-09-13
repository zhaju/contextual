#!/usr/bin/env python3
"""
Test script for groq_caller.py
Tests both streaming and non-streaming functionality
"""
import asyncio
import os
import sys
import traceback
from groq_caller import GroqCaller
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List
load_dotenv()

async def test_groq_caller():
    """Test the GroqCaller functionality"""
    
    # Check if API key is set
    if not os.environ.get("GROQ_API_KEY"):
        print("❌ GROQ_API_KEY environment variable not set")
        print("Please set it with: export GROQ_API_KEY='your_api_key_here'")
        return False
    
    print("✅ GROQ_API_KEY found")
    
    # Initialize the caller
    try:
        caller = GroqCaller()
        print("✅ GroqCaller initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize GroqCaller: {e}")
        traceback.print_exc()
        return False
    
    # Test 1: Simple non-streaming call
    print("\n🧪 Test 1: Non-streaming call")
    try:
        response = await caller.call_groq_simple("Say hello in one word")
        print(f"✅ Non-streaming response: {response}")
    except Exception as e:
        print(f"❌ Non-streaming call failed: {e}")
        traceback.print_exc()
        return False
    
    # Test 2: Streaming call
    print("\n🧪 Test 2: Streaming call")
    try:
        print("Streaming response: ", end="")
        async for chunk in caller.call_groq(
            model="openai/gpt-oss-20b",
            messages=[{"role": "user", "content": "Count from 1 to 5"}]
        ):
            print(chunk, end="", flush=True)
        print("\n✅ Streaming call completed successfully")
    except Exception as e:
        print(f"\n❌ Streaming call failed: {e}")
        traceback.print_exc()
        return False
    
    # Test 3: Custom model test
    print("\n🧪 Test 3: Custom model test")
    try:
        response = await caller.call_groq_simple(
            "What is 2+2?", 
            model="openai/gpt-oss-20b"
        )
        print(f"✅ Custom model response: {response}")
    except Exception as e:
        print(f"❌ Custom model test failed: {e}")
        traceback.print_exc()
        return False
    
    # Test 4: Multiple messages
    print("\n🧪 Test 4: Multiple messages conversation")
    try:
        messages = [
            {"role": "user", "content": "My name is Alice"},
            {"role": "assistant", "content": "Hello Alice! Nice to meet you."},
            {"role": "user", "content": "What's my name?"}
        ]
        
        print("Conversation response: ", end="")
        async for chunk in caller.call_groq(
            model="openai/gpt-oss-20b",
            messages=messages
        ):
            print(chunk, end="", flush=True)
        print("\n✅ Multiple messages test completed")
    except Exception as e:
        print(f"\n❌ Multiple messages test failed: {e}")
        traceback.print_exc()
        return False
    
    # Test 5: Error handling (invalid model)
    print("\n🧪 Test 5: Error handling")
    try:
        print("Testing error handling: ", end="")
        async for chunk in caller.call_groq(
            model="invalid-model-name",
            messages=[{"role": "user", "content": "Hello"}]
        ):
            print(chunk, end="", flush=True)
        print("\n✅ Error handling test completed")
    except Exception as e:
        print(f"\n❌ Error handling test failed: {e}")
        traceback.print_exc()
        return False
    
    # Test 6: Pydantic response format test
    print("\n🧪 Test 6: Pydantic response format test")
    try:
        # Define a simple Pydantic model for structured output
        class PersonInfo(BaseModel):
            name: str
            age: int
            occupation: str
            hobbies: List[str]
        
        # Test with structured output
        response = await caller.call_groq_simple(
            "Create a fictional person named John who is 30 years old, works as a software engineer, and enjoys reading and hiking. Return the information in the specified format.",
            response_format=PersonInfo
        )
        print(f"✅ Structured response: {response}")
            
    except Exception as e:
        print(f"❌ Pydantic response format test failed: {e}")
        traceback.print_exc()
        return False
    
    print("\n🎉 All tests completed!")
    return True

async def test_performance():
    """Test performance with multiple concurrent calls"""
    print("\n🚀 Performance Test: Multiple concurrent calls")
    
    caller = GroqCaller()
    
    async def single_call(i):
        try:
            response = await caller.call_groq_simple(f"Say number {i}")
            return f"Call {i}: {response.strip()}"
        except Exception as e:
            traceback.print_exc()
            return f"Call {i}: Error - {e}"
    
    # Run 3 concurrent calls
    tasks = [single_call(i) for i in range(1, 4)]
    results = await asyncio.gather(*tasks)
    
    for result in results:
        print(f"✅ {result}")
    
    print("✅ Performance test completed")

def main():
    """Main test function"""
    print("🧪 Testing GroqCaller...")
    print("=" * 50)
    
    # Run basic tests
    success = asyncio.run(test_groq_caller())
    
    if success:
        # Run performance tests
        asyncio.run(test_performance())
        print("\n🎉 All tests passed successfully!")
        return 0
    else:
        print("\n❌ Some tests failed!")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
