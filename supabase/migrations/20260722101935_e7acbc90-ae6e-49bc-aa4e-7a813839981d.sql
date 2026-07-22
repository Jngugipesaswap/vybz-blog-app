
-- 1. Tighten permissive SELECT policies (require authenticated)
DROP POLICY IF EXISTS "Circle members viewable by everyone" ON public.circle_members;
CREATE POLICY "Circle members viewable by authenticated"
  ON public.circle_members FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Reactions viewable by everyone" ON public.circle_post_reactions;
CREATE POLICY "Reactions viewable by authenticated"
  ON public.circle_post_reactions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Reactions viewable by everyone" ON public.post_reactions;
CREATE POLICY "Post reactions viewable by authenticated"
  ON public.post_reactions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated"
  ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Social links are viewable by everyone" ON public.social_links;
CREATE POLICY "Social links viewable by authenticated"
  ON public.social_links FOR SELECT TO authenticated USING (true);

REVOKE SELECT ON public.circle_members, public.circle_post_reactions,
  public.post_reactions, public.profiles, public.social_links FROM anon;

-- 2. Fix always-true INSERT policies
DROP POLICY IF EXISTS "Anyone can create analytics events" ON public.share_analytics;
CREATE POLICY "Share analytics inserts constrained"
  ON public.share_analytics FOR INSERT TO anon, authenticated
  WITH CHECK (event_type IN ('view','click','share','copy'));

DROP POLICY IF EXISTS "System can grant achievements" ON public.user_achievements;
-- service_role bypasses RLS; no client-side inserts.

DROP POLICY IF EXISTS "System can insert activity" ON public.activity_log;
CREATE POLICY "Users can insert own activity"
  ON public.activity_log FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "Users can create own notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 3. Recreate views as security_invoker; remove auth.users exposure
DROP VIEW IF EXISTS public.user_engagement_stats;
CREATE VIEW public.user_engagement_stats
  WITH (security_invoker = true) AS
SELECT prof.user_id,
  prof.full_name,
  count(DISTINCT p.id) AS posts_count,
  count(DISTINCT c.id) AS comments_count,
  count(DISTINCT r.id) AS reviews_count,
  count(DISTINCT uc.id) AS content_uploads_count,
  COALESCE(lp.points, 0) AS loyalty_points,
  COALESCE(lp.tier, 'bronze') AS tier
FROM public.profiles prof
LEFT JOIN public.posts p ON prof.user_id = p.author_id
LEFT JOIN public.comments c ON prof.user_id = c.user_id
LEFT JOIN public.reviews r ON prof.user_id = r.user_id
LEFT JOIN public.user_content uc ON prof.user_id = uc.user_id
LEFT JOIN public.loyalty_points lp ON prof.user_id = lp.user_id
GROUP BY prof.user_id, prof.full_name, lp.points, lp.tier;

DROP VIEW IF EXISTS public.leaderboard;
CREATE VIEW public.leaderboard
  WITH (security_invoker = true) AS
SELECT lp.user_id, p.full_name, p.avatar_url, lp.points, lp.tier,
  lp.total_earned,
  count(DISTINCT ua.achievement_id) AS achievement_count,
  row_number() OVER (ORDER BY lp.points DESC) AS rank
FROM public.loyalty_points lp
LEFT JOIN public.profiles p ON p.user_id = lp.user_id
LEFT JOIN public.user_achievements ua ON ua.user_id = lp.user_id
GROUP BY lp.user_id, p.full_name, p.avatar_url, lp.points, lp.tier, lp.total_earned;

DROP VIEW IF EXISTS public.content_performance;
CREATE VIEW public.content_performance
  WITH (security_invoker = true) AS
SELECT p.id, p.title, p.author_id, p.status, p.published_at, p.views_count,
  COALESCE(sum(pa.views), 0::bigint) AS total_tracked_views,
  COALESCE(sum(pa.shares), 0::bigint) AS total_shares,
  COALESCE(avg(pa.avg_read_time), 0::numeric) AS avg_read_time,
  count(DISTINCT c.id) AS comment_count,
  count(DISTINCT pr.id) AS reaction_count
FROM public.posts p
LEFT JOIN public.post_analytics pa ON p.id = pa.post_id
LEFT JOIN public.comments c ON p.id = c.post_id AND c.status = 'approved'
LEFT JOIN public.post_reactions pr ON p.id = pr.post_id
GROUP BY p.id, p.title, p.author_id, p.status, p.published_at, p.views_count;

REVOKE ALL ON public.user_engagement_stats, public.leaderboard, public.content_performance FROM anon, authenticated;
GRANT SELECT ON public.user_engagement_stats, public.leaderboard, public.content_performance TO service_role;

-- 4. Fix mutable search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 5. Revoke EXECUTE on SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_circle_moderator(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.mark_all_notifications_read(uuid) FROM anon, public;

-- 6. Remove public bucket listing policies
DROP POLICY IF EXISTS "Anyone can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view videos" ON storage.objects;
