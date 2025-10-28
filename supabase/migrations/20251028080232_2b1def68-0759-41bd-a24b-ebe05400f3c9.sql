-- Drop existing foreign key if it exists (might be pointing to wrong column)
ALTER TABLE public.circle_posts
DROP CONSTRAINT IF EXISTS circle_posts_user_id_fkey;

ALTER TABLE public.circle_members
DROP CONSTRAINT IF EXISTS circle_members_user_id_fkey;

-- Create proper foreign key relationships pointing to profiles.user_id (not id)
ALTER TABLE public.circle_posts
ADD CONSTRAINT circle_posts_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(user_id)
ON DELETE CASCADE;

ALTER TABLE public.circle_members
ADD CONSTRAINT circle_members_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(user_id)
ON DELETE CASCADE;

-- Reload schema cache for PostgREST
NOTIFY pgrst, 'reload schema';