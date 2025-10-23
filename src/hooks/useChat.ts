import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Message, ChatSession } from '../types';

export function useChat(userId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load or create session
  useEffect(() => {
    loadSession();
  }, [userId]);

  // Subscribe to new messages
  useEffect(() => {
    if (!session?.id) return;

    const channel = supabase
      .channel(`chat:${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${session.id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === newMessage.id);
            if (exists) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.id]);

  const loadSession = async () => {
    try {
      // Try to get the most recent active session for this user
      const { data: existingSessions, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (sessionError) throw sessionError;

      if (existingSessions && existingSessions.length > 0) {
        const activeSession = existingSessions[0];
        setSession(activeSession);
        await loadMessages(activeSession.id);
      }
    } catch (err) {
      console.error('Error loading session:', err);
      setError('Failed to load chat session');
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const { data, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(data || []);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
    }
  };

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      setIsLoading(true);
      setError(null);

      try {
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-support`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            sessionId: session?.id,
            userId,
            message: content,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const result = await response.json();

        // Update session if it was just created
        if (!session && result.sessionId) {
          const { data: newSession } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('id', result.sessionId)
            .single();

          if (newSession) {
            setSession(newSession);
          }
        }

        // Check if session was escalated
        if (result.escalated && session) {
          const { data: updatedSession } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('id', session.id)
            .single();

          if (updatedSession) {
            setSession(updatedSession);
          }
        }
      } catch (err) {
        console.error('Error sending message:', err);
        setError('Failed to send message. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [session, userId]
  );

  const startNewSession = useCallback(async () => {
    try {
      // Mark current session as resolved if exists
      if (session?.id) {
        await supabase
          .from('chat_sessions')
          .update({ status: 'resolved' })
          .eq('id', session.id);
      }

      // Create new session
      const { data: newSession, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({ user_id: userId, status: 'active' })
        .select()
        .single();

      if (sessionError) throw sessionError;

      setSession(newSession);
      setMessages([]);
      setError(null);
    } catch (err) {
      console.error('Error starting new session:', err);
      setError('Failed to start new session');
    }
  }, [session, userId]);

  return {
    messages,
    session,
    isLoading,
    error,
    sendMessage,
    startNewSession,
  };
}
