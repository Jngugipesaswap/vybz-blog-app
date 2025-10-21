-- Create activity log table
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Admins can view all activity
CREATE POLICY "Admins can view all activity"
  ON public.activity_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Users can view own activity
CREATE POLICY "Users can view own activity"
  ON public.activity_log FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert activity
CREATE POLICY "System can insert activity"
  ON public.activity_log FOR INSERT
  WITH CHECK (true);

-- Create analytics summary view
CREATE OR REPLACE VIEW public.content_performance AS
SELECT 
  p.id,
  p.title,
  p.author_id,
  p.status,
  p.published_at,
  p.views_count,
  COALESCE(SUM(pa.views), 0) as total_tracked_views,
  COALESCE(SUM(pa.shares), 0) as total_shares,
  COALESCE(AVG(pa.avg_read_time), 0) as avg_read_time,
  COUNT(DISTINCT c.id) as comment_count,
  COUNT(DISTINCT pr.id) as reaction_count
FROM public.posts p
LEFT JOIN public.post_analytics pa ON p.id = pa.post_id
LEFT JOIN public.comments c ON p.id = c.post_id AND c.status = 'approved'
LEFT JOIN public.post_reactions pr ON p.id = pr.post_id
GROUP BY p.id, p.title, p.author_id, p.status, p.published_at, p.views_count;

-- Create user engagement view
CREATE OR REPLACE VIEW public.user_engagement_stats AS
SELECT 
  u.id as user_id,
  prof.full_name,
  COUNT(DISTINCT p.id) as posts_count,
  COUNT(DISTINCT c.id) as comments_count,
  COUNT(DISTINCT r.id) as reviews_count,
  COUNT(DISTINCT uc.id) as content_uploads_count,
  COALESCE(lp.points, 0) as loyalty_points,
  COALESCE(lp.tier, 'bronze') as tier
FROM auth.users u
LEFT JOIN public.profiles prof ON u.id = prof.user_id
LEFT JOIN public.posts p ON u.id = p.author_id
LEFT JOIN public.comments c ON u.id = c.user_id
LEFT JOIN public.reviews r ON u.id = r.user_id
LEFT JOIN public.user_content uc ON u.id = uc.user_id
LEFT JOIN public.loyalty_points lp ON u.id = lp.user_id
GROUP BY u.id, prof.full_name, lp.points, lp.tier;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_activity_log_user_created ON public.activity_log(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON public.activity_log(activity_type, created_at);