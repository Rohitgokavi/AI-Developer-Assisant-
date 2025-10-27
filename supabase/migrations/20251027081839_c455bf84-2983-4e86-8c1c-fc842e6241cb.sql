-- Fix profiles table RLS policy to prevent public email exposure
-- Users should only be able to view their own profile, not all profiles

DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);