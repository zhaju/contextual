# Contextual Chat - Integration Guide

This is a **full-stack contextual chat application** that automatically recommends relevant past conversations and injects context to eliminate the need to re-explain everything from scratch. The system maintains topic → information mapping and provides intelligent context selection for seamless conversation continuity.

## 🚀 Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🎯 Core Concept

**Elevator Pitch:** Imagine having a deep conversation with ChatGPT about a math problem or a new app idea. A week later, you want to pick it back up—but you either have to dig through old chats or re-explain everything from scratch. Our tool eliminates that hassle by automatically recommending the right past conversations and injecting the context you need.

### Key Features
- **Maintains Topic → Information mapping** after every message
- **Automatic context recommendations** for new chats based on first message
- **Intelligent memory updates** with "significant" mentions only
- **User-controlled context selection** with automatic suggestions
- **Hotkey support** for adding particular topics
- **Memory persistence** across chat sessions

## 📁 Project Structure

### Backend (`/backend/`)
```
backend/
├── main.py                 # FastAPI server with all endpoints
├── custom_types.py         # Pydantic models for API
├── groq_caller.py         # Groq LLM integration
├── convo_parser.py        # Chat history parsing utilities
├── convo_summarizer.py    # Chat summarization with Claude
├── requirements.txt       # Python dependencies
└── *.txt                  # Data files (conversations, summaries)
```

### Frontend (`/frontend/`)
```
src/
├── components/
│   ├── layout/            # App shell and sidebars
│   ├── chat/              # Chat display and input components
│   ├── memory/            # Memory directory and context management
│   ├── features/          # Suggested topics and relevant chats
│   └── ui/                # Reusable UI components
├── types.ts               # TypeScript type definitions
├── mockData.ts            # Mock data for development
└── App.tsx                # Main app with state management
```

## 🔧 API Integration

### Backend API Endpoints

#### 1. Chat Management
- `GET /chats` - List all chats
- `GET /chats/{chat_id}` - Get specific chat
- `POST /chats/new` - Create new chat with context prompt
- `POST /chats/{chat_id}/send` - Send message with SSE response
- `POST /chats/{chat_id}/set_context` - Set context for chat

#### 2. Data Models

**Chat Object:**
```typescript
interface Chat {
  id: string;
  current_memory: Memory;
  title: string;
  chat_history: ChatMessage[];
}
```

**Memory System:**
```typescript
interface Memory {
  summary_string: string;
  blocks: Block[];
}

interface Block {
  topic: string;
  description: string;
}
```

### Frontend Integration Points

#### 1. Replace Mock Data with API Calls

**Current:** Mock data from `mockData.ts`
```typescript
import { chats, topics, messages } from './mockData';
```

**Integration:** Connect to backend API
```typescript
// Example with React Query
const { data: chats } = useQuery('chats', () => fetch('/api/chats').then(r => r.json()));
const { data: messages } = useQuery(['messages', chatId], () => 
  fetch(`/api/chats/${chatId}`).then(r => r.json())
);
```

#### 2. Real-time Message Streaming

**Current:** Mock setTimeout for responses
```typescript
setTimeout(() => {
  setCurrentMessages(prev => [...prev, assistantMessage]);
}, 2000);
```

**Integration:** Server-Sent Events (SSE)
```typescript
const handleSendMessage = async (message: string) => {
  const response = await fetch(`/api/chats/${chatId}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        if (data.content) {
          // Update UI with streaming content
          setCurrentMessages(prev => [...prev, { content: data.content }]);
        }
        if (data.done) {
          // Streaming complete
          break;
        }
      }
    }
  }
};
```

#### 3. Context Management Integration

**Current:** Mock memory filtering
```typescript
const filterMemoriesByMessage = (message: string) => {
  // Simple keyword matching
};
```

**Integration:** Backend context recommendation
```typescript
const handleNewChat = async (firstMessage: string) => {
  const response = await fetch('/api/chats/new', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ first_message: firstMessage })
  });
  
  const { relevant_chats } = await response.json();
  // Display context selection UI
};
```

## 🧠 Memory System Architecture

### MVP Version 1 Implementation

#### Memory Structure
- **Topic → Description mapping** maintained per chat
- **Automatic updates** after every message using LLM
- **Significant mention detection** for memory updates
- **Context summarization** for new chat recommendations

#### Memory Update Flow
1. **After every message:** LLM analyzes content for significant mentions
2. **Memory regeneration:** Background thread updates entire memory for chat
3. **Context injection:** Relevant memories automatically added to new chats
4. **User control:** Users can remove/add context as needed

#### Backend Memory Processing
```python
# In main.py - Memory update after message
async def update_memory_after_message(chat_id: str, message: str):
    # Use Groq to analyze message for significant mentions
    # Update memory blocks based on analysis
    # Regenerate summary string
    pass
```

### Frontend Memory UI

#### Memory Directory Component
- **Collapsible memory blocks** with topic/description
- **Selection interface** for context injection
- **Importance indicators** (# for high importance)
- **Chat reference tracking** for each memory block

#### Context Selection Flow
1. **New chat created** with first message
2. **Backend analyzes** message and recommends relevant memories
3. **Frontend displays** recommended memories for selection
4. **User selects** desired context (with auto-selection)
5. **Context submitted** and chat proceeds with injected context

## 🔄 Integration Workflow

### 1. New Chat Creation
```typescript
// Frontend: User types first message
const handleNewChat = async (firstMessage: string) => {
  // 1. Create new chat with backend
  const response = await fetch('/api/chats/new', {
    method: 'POST',
    body: JSON.stringify({ first_message: firstMessage })
  });
  
  // 2. Get context recommendations
  const { relevant_chats } = await response.json();
  
  // 3. Display context selection UI
  setShowContextSelection(true);
  setRecommendedMemories(relevant_chats);
};
```

### 2. Context Selection
```typescript
// Frontend: User selects context
const handleSubmitContext = async (selectedMemories: string[]) => {
  // 1. Submit selected context to backend
  await fetch(`/api/chats/${chatId}/set_context`, {
    method: 'POST',
    body: JSON.stringify({ required_context: selectedMemories })
  });
  
  // 2. Proceed with first message + context
  await handleSendMessage(firstMessage);
};
```

### 3. Message Streaming
```typescript
// Frontend: Send message and stream response
const handleSendMessage = async (message: string) => {
  // 1. Send message to backend
  const response = await fetch(`/api/chats/${chatId}/send`, {
    method: 'POST',
    body: JSON.stringify({ message })
  });
  
  // 2. Stream response chunks
  const reader = response.body?.getReader();
  // ... SSE processing as shown above
  
  // 3. Backend automatically updates memory in background
};
```

## 🎨 UI Components

### Key Components

#### 1. AppShell (`components/layout/AppShell.tsx`)
- **3-column layout:** Chat list, message area, memory directory
- **Responsive design** with collapsible sidebars
- **Theme support** with dark/light mode

#### 2. MemoryDirectory (`components/memory/MemoryDirectory.tsx`)
- **Memory block display** with topic/description
- **Selection interface** for context injection
- **Importance indicators** and chat references
- **Collapsible sections** for better organization

#### 3. Composer (`components/input/Composer.tsx`)
- **Message input** with context pills
- **Context removal** functionality
- **Send button** with loading states

#### 4. ChatView (`components/chat/ChatView.tsx`)
- **Message display** with markdown support
- **Typing indicators** for streaming responses
- **Message history** with proper formatting

## 🔧 Configuration

### Environment Variables

#### Backend
```bash
GROQ_API_KEY=your_groq_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

#### Frontend
```bash
VITE_API_BASE_URL=http://localhost:8000
```

### API Configuration
- **Base URL:** `http://localhost:8000` (backend)
- **CORS:** Configured for frontend development
- **Streaming:** Server-Sent Events for real-time responses

## 🚀 Deployment

### Backend Deployment
1. **Install dependencies:** `pip install -r requirements.txt`
2. **Set environment variables**
3. **Run server:** `python main.py` or `uvicorn main:app --host 0.0.0.0 --port 8000`

### Frontend Deployment
1. **Build:** `npm run build`
2. **Deploy:** Upload `dist/` folder to hosting service
3. **Configure API URL** in environment variables

## 📚 Dependencies

### Backend
- **FastAPI** - Web framework
- **Pydantic** - Data validation
- **Groq** - LLM API client
- **Anthropic** - Claude API client
- **Uvicorn** - ASGI server

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Markdown** - Markdown rendering

## 🔍 Key Integration Points

### Message Handling
- **Location:** `App.tsx` → `handleSendMessage`
- **Current:** Mock implementation
- **Integration:** Connect to `/api/chats/{chat_id}/send` with SSE

### Memory Management
- **Location:** `App.tsx` → `handleSubmitContext`
- **Current:** Mock memory filtering
- **Integration:** Connect to `/api/chats/{chat_id}/set_context`

### Chat Creation
- **Location:** `App.tsx` → `handleNewChat`
- **Current:** Mock chat creation
- **Integration:** Connect to `/api/chats/new` with context recommendations

### Context Selection
- **Location:** `MemoryDirectory.tsx`
- **Current:** Mock memory display
- **Integration:** Display backend-recommended memories for selection

## 🧪 Testing

The application is designed for easy testing:

```typescript
// Example test for MemoryDirectory component
import { render, screen } from '@testing-library/react';
import { MemoryDirectory } from './MemoryDirectory';

test('displays memory blocks correctly', () => {
  const memories = [
    {
      id: 'mem1',
      title: 'Test Memory',
      blocks: [
        { id: 'block1', topic: 'Test Topic', description: 'Test Description' }
      ]
    }
  ];
  
  render(<MemoryDirectory memories={memories} />);
  expect(screen.getByText('Test Memory')).toBeInTheDocument();
  expect(screen.getByText('Test Topic')).toBeInTheDocument();
});
```

## 🤝 Contributing

When integrating or extending:
1. **Maintain type safety** with TypeScript interfaces
2. **Follow the memory system architecture** for context management
3. **Preserve the SSE streaming** for real-time responses
4. **Add proper error handling** for API failures
5. **Include loading states** for better UX

## 📄 License

This contextual chat application is provided as-is for integration into your projects.
