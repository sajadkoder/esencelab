import { useState, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import type { ChatMessage } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { aiService } from '@/lib/api';

function createInitialGreeting(userName?: string): ChatMessage {
  return {
    id: 'welcome',
    role: 'assistant',
    content: `Hi${userName ? `, ${userName.split(' ')[0]}` : ''}! I'm your career guidance assistant powered by AI. I can help you with:

- Resume tips and improvements
- Career path advice for Indian tech industry
- Interview preparation (DSA, System Design)
- Skill development suggestions
- Job search strategies for campus placements

What would you like to know?`,
    timestamp: new Date().toISOString(),
  };
}

export function useCareerChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [createInitialGreeting()]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user, getToken } = useAuth();

  const initialGreeting = useMemo(() => createInitialGreeting(user?.name), [user?.name]);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const context = {
        name: user?.name,
        role: user?.role,
        email: user?.email,
      };

      const history = messages.slice(-5).map((message) => ({
        role: message.role,
        content: message.content,
      }));

      const token = await getToken();
      if (!token) {
        throw new Error('Authentication token unavailable. Sign out and sign in again, then retry.');
      }

      const response = await aiService.chat(content, context, history, token);

      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response?.response || 'I apologize, but I had trouble generating a response. Please try again.',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get response from AI';
      toast.error(message);
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: `I hit an error while reaching the AI service.

Details: ${message}

If this keeps happening on Vercel, verify VITE_AI_SERVICE_URL is set to /api/ai and GEMINI_API_KEY is configured.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [user, messages, getToken]);

  const clearChat = useCallback(() => {
    setMessages([initialGreeting]);
  }, [initialGreeting]);

  return {
    messages,
    isLoading,
    isOpen,
    setIsOpen,
    sendMessage,
    clearChat,
  };
}

export function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return date.toLocaleDateString();
}
