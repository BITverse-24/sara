'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatbotProps {
  currentQuestion?: string;
  currentAnswer?: string;
  userAnswer?: string;
}

export function AIChatbot({ currentQuestion, currentAnswer, userAnswer }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your study assistant. I can help explain concepts, provide examples, or answer questions about the flashcards you're studying. How can I help?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateMockResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Context-aware responses based on current flashcard
    if (currentQuestion && lowerMessage.includes('question') || lowerMessage.includes('current')) {
      return `The current question is: "${currentQuestion}". Would you like me to explain it in more detail or provide examples?`;
    }
    
    if (currentAnswer && (lowerMessage.includes('answer') || lowerMessage.includes('correct'))) {
      return `The correct answer is: "${currentAnswer}". I can help you understand why this is the answer or provide related information.`;
    }
    
    if (userAnswer && lowerMessage.includes('my answer')) {
      return `You answered: "${userAnswer}". Let me help you understand how it compares to the correct answer.`;
    }
    
    // General responses
    if (lowerMessage.includes('help') || lowerMessage.includes('explain')) {
      return "I'm here to help! I can explain concepts, provide examples, clarify questions, or help you understand the material better. What would you like to know?";
    }
    
    if (lowerMessage.includes('example') || lowerMessage.includes('example')) {
      return "Here's an example to help you understand better. Would you like me to provide more specific examples related to the current flashcard?";
    }
    
    if (lowerMessage.includes('hint') || lowerMessage.includes('clue')) {
      return "I can give you hints! Try thinking about the key concepts related to this topic. Would you like a more specific hint?";
    }
    
    // Default response
    return "That's an interesting question! I can help you understand this better. Could you provide more context or ask about something specific from the current flashcard?";
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: generateMockResponse(userMessage.content),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleQuickAction = (action: string) => {
    let message = '';
    switch (action) {
      case 'explain':
        message = currentQuestion 
          ? `Can you explain "${currentQuestion}" in more detail?`
          : 'Can you explain the current concept?';
        break;
      case 'example':
        message = 'Can you give me an example?';
        break;
      case 'hint':
        message = 'Can you give me a hint?';
        break;
      default:
        return;
    }
    setInput(message);
  };

  return (
    <div className="flex flex-col h-[600px] lg:h-[calc(100vh-200px)] bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-100">Study Assistant</h3>
        <p className="text-xs text-gray-400 mt-1">AI-powered learning companion</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-gray-700 bg-gray-800 space-y-2">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleQuickAction('explain')}
            className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-full text-gray-300 transition-colors"
          >
            💡 Explain
          </button>
          <button
            onClick={() => handleQuickAction('example')}
            className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-full text-gray-300 transition-colors"
          >
            📝 Example
          </button>
          <button
            onClick={() => handleQuickAction('hint')}
            className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-full text-gray-300 transition-colors"
          >
            💭 Hint
          </button>
        </div>
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}

