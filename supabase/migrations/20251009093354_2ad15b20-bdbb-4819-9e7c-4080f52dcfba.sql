-- Update the handle_new_user function to assign 'user' role by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user'::app_role);
  
  RETURN new;
END;
$$;

-- Create a function to get user's highest role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'content_creator' THEN 2
      WHEN 'user' THEN 3
      ELSE 4
    END
  LIMIT 1;
$$;

-- Drop existing conflicting policy if it exists
DROP POLICY IF EXISTS "Content creators can manage own posts" ON public.posts;

-- Update RLS policy for content creators
CREATE POLICY "Content creators can manage own posts" 
ON public.posts 
FOR ALL
USING (
  auth.uid() = author_id 
  AND (
    has_role(auth.uid(), 'content_creator'::app_role) 
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Content creators can view own analytics" ON public.post_analytics;

-- Allow content creators to view their own analytics
CREATE POLICY "Content creators can view own analytics" 
ON public.post_analytics 
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = post_analytics.post_id 
    AND posts.author_id = auth.uid()
    AND has_role(auth.uid(), 'content_creator'::app_role)
  )
);