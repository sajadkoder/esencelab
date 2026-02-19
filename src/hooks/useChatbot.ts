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
    content: `Hi${userName ? `, ${userName.split(' ')[0]}` : ''}! I'm your career guidance assistant powered by AI. I can help you with:\n\n• Resume tips and improvements\n• Career path advice for Indian tech industry\n• Interview preparation (DSA, System Design)\n• Skill development suggestions\n• Job search strategies for campus placements\n\nWhat would you like to know?`,
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

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const context = {
        name: user?.name,
        role: user?.role,
        email: user?.email,
      };

      const history = messages.slice(-5).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const token = await getToken();
      const response = await aiService.chat(content, context, history, token);

      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response?.response || 'I apologize, but I had trouble generating a response. Please try again.',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      toast.error('Failed to get response from AI');
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please make sure the AI service is running on port 8000.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
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
