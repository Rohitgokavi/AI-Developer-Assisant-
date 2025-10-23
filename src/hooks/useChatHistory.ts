import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

export interface ChatSession {
  id: string;
  title: string;
  messages: { role: string; content: string }[];
  created_at: string;
  updated_at: string;
}

export const useChatHistory = (user: User | null) => {
  const [history, setHistory] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadHistory();
    } else {
      setHistory([]);
      setCurrentSessionId(null);
    }
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("chat_history")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error loading history:", error);
      return;
    }

    const typedData = (data || []).map(item => ({
      ...item,
      messages: item.messages as { role: string; content: string }[]
    })) as ChatSession[];

    setHistory(typedData);
  };

  const saveSession = async (messages: { role: string; content: string }[]) => {
    if (!user || messages.length === 0) return;

    const title = messages[0]?.content.slice(0, 50) || "New Chat";

    if (currentSessionId) {
      // Update existing session
      const { error } = await supabase
        .from("chat_history")
        .update({ messages, title, updated_at: new Date().toISOString() })
        .eq("id", currentSessionId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating session:", error);
      } else {
        await loadHistory();
      }
    } else {
      // Create new session
      const { data, error } = await supabase
        .from("chat_history")
        .insert({ user_id: user.id, messages, title })
        .select()
        .single();

      if (error) {
        console.error("Error creating session:", error);
      } else if (data) {
        setCurrentSessionId(data.id);
        await loadHistory();
      }
    }
  };

  const loadSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    return session.messages;
  };

  const deleteSession = async (sessionId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("chat_history")
      .delete()
      .eq("id", sessionId)
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to delete session");
    } else {
      toast.success("Session deleted");
      await loadHistory();
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
      }
    }
  };

  const newSession = () => {
    setCurrentSessionId(null);
  };

  return {
    history,
    saveSession,
    loadSession,
    deleteSession,
    newSession,
  };
};
