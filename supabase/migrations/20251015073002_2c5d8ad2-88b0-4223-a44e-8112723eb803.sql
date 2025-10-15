-- Create challenges table
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('share', 'upload', 'review', 'attendance', 'referral', 'streak')),
  target_count INTEGER NOT NULL DEFAULT 1,
  points_reward INTEGER NOT NULL DEFAULT 0,
  badge_reward TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- RLS for challenges
CREATE POLICY "Active challenges viewable by everyone"
ON public.challenges
FOR SELECT
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage challenges"
ON public.challenges
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create user_challenges table
CREATE TABLE public.user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenges"
ON public.user_challenges
FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update own challenge progress"
ON public.user_challenges
FOR ALL
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('bronze', 'silver', 'gold', 'platinum', 'special')),
  unlock_criteria JSONB NOT NULL,
  points_value INTEGER DEFAULT 0,
  is_secret BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements viewable by everyone"
ON public.achievements
FOR SELECT
USING (NOT is_secret OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage achievements"
ON public.achievements
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create user_achievements table
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
ON public.user_achievements
FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can grant achievements"
ON public.user_achievements
FOR INSERT
WITH CHECK (true);

-- Create streaks table
CREATE TABLE public.user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_type TEXT NOT NULL CHECK (streak_type IN ('daily_login', 'content_upload', 'review_writing')),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, streak_type)
);

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streaks"
ON public.user_streaks
FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update own streaks"
ON public.user_streaks
FOR ALL
USING (auth.uid() = user_id);

-- Create leaderboard view
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  lp.user_id,
  p.full_name,
  p.avatar_url,
  lp.points,
  lp.tier,
  lp.total_earned,
  COUNT(DISTINCT ua.achievement_id) as achievement_count,
  ROW_NUMBER() OVER (ORDER BY lp.points DESC) as rank
FROM public.loyalty_points lp
LEFT JOIN public.profiles p ON p.user_id = lp.user_id
LEFT JOIN public.user_achievements ua ON ua.user_id = lp.user_id
GROUP BY lp.user_id, p.full_name, p.avatar_url, lp.points, lp.tier, lp.total_earned
ORDER BY lp.points DESC;

-- Insert sample challenges
INSERT INTO public.challenges (title, description, challenge_type, target_count, points_reward, badge_reward, end_date)
VALUES
  ('Social Butterfly', 'Share 5 events on social media', 'share', 5, 100, 'social_butterfly', now() + interval '30 days'),
  ('Content Creator', 'Upload 3 photos or videos', 'upload', 3, 150, 'content_creator', now() + interval '30 days'),
  ('Critic''s Choice', 'Write 10 reviews', 'review', 10, 200, 'critic', now() + interval '30 days'),
  ('First Timer', 'Attend your first event', 'attendance', 1, 50, 'first_timer', now() + interval '90 days'),
  ('Refer a Friend', 'Invite 3 friends to join', 'referral', 3, 300, 'referrer', now() + interval '60 days');

-- Insert sample achievements
INSERT INTO public.achievements (name, description, icon, badge_type, unlock_criteria, points_value, is_secret)
VALUES
  ('Welcome Aboard', 'Create your account', '👋', 'bronze', '{"action": "signup"}', 10, false),
  ('Social Maven', 'Share 50 events', '📱', 'silver', '{"action": "share", "count": 50}', 250, false),
  ('Rising Star', 'Upload 20 pieces of content', '⭐', 'gold', '{"action": "upload", "count": 20}', 500, false),
  ('Review Master', 'Write 100 reviews', '✍️', 'platinum', '{"action": "review", "count": 100}', 1000, false),
  ('Loyalty Legend', 'Reach Platinum tier', '👑', 'special', '{"tier": "platinum"}', 2000, false),
  ('Secret Keeper', 'Find the hidden event', '🔐', 'special', '{"action": "secret_event"}', 500, true);

-- Create triggers
CREATE TRIGGER update_challenges_updated_at
BEFORE UPDATE ON public.challenges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_streaks_updated_at
BEFORE UPDATE ON public.user_streaks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();