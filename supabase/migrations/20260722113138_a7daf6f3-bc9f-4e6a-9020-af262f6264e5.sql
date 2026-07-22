
-- 1. GraphQL: hide from anon/authenticated
REVOKE USAGE ON SCHEMA graphql_public FROM anon, authenticated;
REVOKE ALL ON SCHEMA graphql FROM anon, authenticated;

-- 2. Revoke EXECUTE on SECURITY DEFINER functions from anon/authenticated/public
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.is_circle_moderator(uuid, uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
-- keep mark_all_notifications_read callable via RPC by authenticated
REVOKE EXECUTE ON FUNCTION public.mark_all_notifications_read(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.mark_all_notifications_read(uuid) TO authenticated;

-- 3. activity_log: require user_id = auth.uid() on insert
DROP POLICY IF EXISTS "Users can insert own activity" ON public.activity_log;
CREATE POLICY "Users can insert own activity" ON public.activity_log
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 4. circle_members: only fellow members can see rows for a circle
CREATE OR REPLACE FUNCTION public.is_circle_member(_user_id uuid, _circle_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.circle_members
    WHERE circle_id = _circle_id AND user_id = _user_id
  );
$$;
REVOKE EXECUTE ON FUNCTION public.is_circle_member(uuid, uuid) FROM anon, authenticated, public;

DROP POLICY IF EXISTS "Circle members viewable by authenticated" ON public.circle_members;
CREATE POLICY "Circle members viewable by fellow members" ON public.circle_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_circle_member(auth.uid(), circle_id)
    OR public.is_circle_moderator(auth.uid(), circle_id)
  );

-- 5. media: only uploader (admins covered by existing ALL policy)
DROP POLICY IF EXISTS "Media viewable by authenticated users" ON public.media;
CREATE POLICY "Users can view own media" ON public.media
  FOR SELECT TO authenticated
  USING (uploaded_by = auth.uid());

-- 6. post_reactions: only own reactions
DROP POLICY IF EXISTS "Post reactions viewable by authenticated" ON public.post_reactions;
CREATE POLICY "Users can view own reactions" ON public.post_reactions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 7. profiles: own + users sharing a circle
DROP POLICY IF EXISTS "Profiles viewable by authenticated" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Users can view profiles of circle co-members" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.circle_members cm1
      JOIN public.circle_members cm2 ON cm1.circle_id = cm2.circle_id
      WHERE cm1.user_id = auth.uid() AND cm2.user_id = profiles.user_id
    )
  );

-- 8. social_links: only owner
DROP POLICY IF EXISTS "Social links viewable by authenticated" ON public.social_links;
CREATE POLICY "Users can view own social links" ON public.social_links
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
