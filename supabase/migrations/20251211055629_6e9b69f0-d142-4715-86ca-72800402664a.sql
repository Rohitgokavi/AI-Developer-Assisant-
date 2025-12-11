-- Create code_history table to track user code generations and reviews
CREATE TABLE public.code_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('generate', 'review')),
  title TEXT NOT NULL,
  language TEXT NOT NULL,
  prompt TEXT,
  code TEXT,
  result TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.code_history ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own code history" 
ON public.code_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own code history" 
ON public.code_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own code history" 
ON public.code_history 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_code_history_user_id ON public.code_history(user_id);
CREATE INDEX idx_code_history_created_at ON public.code_history(created_at DESC);