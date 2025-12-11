import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CodeHistoryItem {
  id: string;
  type: 'generate' | 'review';
  title: string;
  language: string;
  prompt?: string;
  code?: string;
  result?: string;
  created_at: string;
}

export const useCodeHistory = () => {
  const [history, setHistory] = useState<CodeHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHistory([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('code_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setHistory((data || []) as CodeHistoryItem[]);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveGeneration = async (prompt: string, language: string, result: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create a title from the first few words of the prompt
      const title = prompt.slice(0, 50) + (prompt.length > 50 ? '...' : '');

      const { error } = await supabase
        .from('code_history')
        .insert({
          user_id: user.id,
          type: 'generate',
          title,
          language,
          prompt,
          result,
        });

      if (error) throw error;
      await loadHistory();
    } catch (error) {
      console.error('Error saving generation:', error);
    }
  };

  const saveReview = async (code: string, language: string, result: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create a title from the first line of code
      const firstLine = code.split('\n')[0].slice(0, 50);
      const title = `Review: ${firstLine}${firstLine.length >= 50 ? '...' : ''}`;

      const { error } = await supabase
        .from('code_history')
        .insert({
          user_id: user.id,
          type: 'review',
          title,
          language,
          code,
          result,
        });

      if (error) throw error;
      await loadHistory();
    } catch (error) {
      console.error('Error saving review:', error);
    }
  };

  const deleteHistoryItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('code_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting history item:', error);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return {
    history,
    loading,
    saveGeneration,
    saveReview,
    deleteHistoryItem,
    refreshHistory: loadHistory,
  };
};
