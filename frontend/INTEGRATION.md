# Chat UI Template - Integration Guide

This is a **static, frontend-only** Chat UI template built with React, TypeScript, and Tailwind CSS. It provides a complete chat interface with no data layer or API wiring, making it easy to swap in real logic later.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── AppShell.tsx     # Main layout with 3-column grid
│   ├── LeftSidebar.tsx  # Chat list and search
│   ├── ChatView.tsx     # Message display area
│   ├── Composer.tsx     # Message input with context pills
│   ├── RightSidebar.tsx # Topics, relevant chats, pinned context
│   └── ...              # Individual components
├── types.ts             # TypeScript type definitions
├── mockData.ts          # Mock data for development
└── App.tsx              # Main app with event handlers
```

## 🔧 How to Integrate with Real Backend

### 1. Replace Mock Data

**Current:** All data comes from `mockData.ts`
```typescript
import { chats, topics, messages } from './mockData';
```

**Integration:** Replace with API calls
```typescript
// Example with React Query
const { data: chats } = useQuery('chats', fetchChats);
const { data: messages } = useQuery(['messages', chatId], () => fetchMessages(chatId));
```

### 2. Add State Management

**Current:** Local useState for simple state
```typescript
const [currentMessages, setCurrentMessages] = useState(messages);
```

**Integration:** Use Redux, Zustand, or Context API
```typescript
// Example with Zustand
const useChatStore = create((set) => ({
  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
}));
```

### 3. Implement Real-time Updates

**Current:** Mock setTimeout for assistant responses
```typescript
setTimeout(() => {
  setCurrentMessages(prev => [...prev, assistantMessage]);
}, 2000);
```

**Integration:** WebSocket or Server-Sent Events
```typescript
// Example with WebSocket
useEffect(() => {
  const ws = new WebSocket('ws://localhost:8080/chat');
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    addMessage(message);
  };
}, []);
```

### 4. Add Authentication

**Current:** No authentication
**Integration:** Add login/logout and user management
```typescript
// Example with Auth0
const { user, login, logout } = useAuth0();
```

### 5. Connect Search Functionality

**Current:** Client-side filtering only
```typescript
const filteredChats = chats.filter(chat =>
  chat.title.toLowerCase().includes(searchValue.toLowerCase())
);
```

**Integration:** Server-side search with debouncing
```typescript
const debouncedSearch = useDebounce(searchValue, 300);
const { data: searchResults } = useQuery(
  ['search', debouncedSearch],
  () => searchChats(debouncedSearch),
  { enabled: debouncedSearch.length > 0 }
);
```

### 6. Add File Upload Support

**Current:** Text-only messages
**Integration:** Add file upload to Composer
```typescript
const handleFileUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await uploadFile(formData);
  // Add file message to chat
};
```

## 🎨 Customization

### Theme Customization
The app uses CSS custom properties for theming. Modify `src/index.css`:

```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #1e293b;
  /* ... other variables */
}

[data-theme="dark"] {
  --bg-primary: #0f172a;
  --text-primary: #f1f5f9;
  /* ... dark theme variables */
}
```

### Component Styling
All components use Tailwind CSS classes. Customize by:
1. Modifying Tailwind classes in components
2. Adding custom CSS classes
3. Extending Tailwind config

## 📱 Responsive Design

The template is designed for desktop use. To make it mobile-responsive:

1. **Collapsible Sidebars:** Already implemented with collapse state
2. **Mobile Navigation:** Add hamburger menu for mobile
3. **Touch Gestures:** Add swipe gestures for mobile
4. **Viewport Meta:** Ensure proper viewport settings

## 🔍 Key Integration Points

### Message Handling
- **Location:** `App.tsx` → `handleSendMessage`
- **Current:** Mock implementation with setTimeout
- **Integration:** Connect to your AI assistant API

### Chat Management
- **Location:** `App.tsx` → `handleChatSelect`, `handleNewChat`
- **Current:** Console logs only
- **Integration:** Load/save chats from your database

### Context Management
- **Location:** `App.tsx` → `handleContextRemove`
- **Current:** Console logs only
- **Integration:** Connect to your context management system

### Search
- **Location:** `ChatSearchInput.tsx`
- **Current:** Client-side filtering
- **Integration:** Connect to your search API

## 🧪 Testing

The template is designed to be easily testable:

```typescript
// Example test for MessageList component
import { render, screen } from '@testing-library/react';
import { MessageList } from './MessageList';

test('renders messages correctly', () => {
  const messages = [
    { id: '1', role: 'user', text: 'Hello' },
    { id: '2', role: 'assistant', text: 'Hi there!' }
  ];
  
  render(<MessageList messages={messages} />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
  expect(screen.getByText('Hi there!')).toBeInTheDocument();
});
```

## 🚀 Deployment

1. **Build:** `npm run build`
2. **Preview:** `npm run preview`
3. **Deploy:** Upload `dist/` folder to your hosting service

## 📚 Dependencies

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Markdown** - Markdown rendering

## 🤝 Contributing

This is a template project. When integrating:
1. Keep the component structure
2. Maintain TypeScript types
3. Preserve accessibility features
4. Add proper error handling
5. Include loading states

## 📄 License

This template is provided as-is for integration into your projects.
