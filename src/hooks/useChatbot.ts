import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import type { ChatMessage } from '@/types';
import { useAuth } from '@/hooks/useAuth';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export function useCareerChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const initialGreeting: ChatMessage = {
    id: 'welcome',
    role: 'assistant',
    content: `Hi${user?.name ? `, ${user.name.split(' ')[0]}` : ''}! I'm your career guidance assistant. I can help you with:\n\n• Resume tips and improvements\n• Career path advice\n• Interview preparation\n• Skill development suggestions\n• Job search strategies\n\nWhat would you like to know?`,
    timestamp: new Date().toISOString(),
  };

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([initialGreeting]);
    }
  }, []);

  const sendMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const context = buildContext();
      const prompt = `You are Esencelab's career guidance AI assistant. You help students with career advice, resume tips, interview preparation, and skill development. 

Current user context:
${context}

User's question: ${content}

Respond in a helpful, conversational manner. Keep responses concise but informative. If giving advice, provide specific actionable steps.`;

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 512,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: data.candidates?.[0]?.content?.parts?.[0]?.text || 
          'I apologize, but I had trouble generating a response. Please try again.',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('Failed to get response from AI');
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const buildContext = () => {
    return `User: ${user?.name || 'Unknown'}
Role: ${user?.role || 'student'}
Email: ${user?.email || 'Not provided'}`;
  };

  const clearChat = () => {
    setMessages([initialGreeting]);
  };

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
