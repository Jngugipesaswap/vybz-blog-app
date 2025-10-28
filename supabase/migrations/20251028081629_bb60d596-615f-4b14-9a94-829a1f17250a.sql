-- Add circle moderation and management features

-- Circle moderators table
CREATE TABLE IF NOT EXISTS public.circle_moderators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(user_id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  permissions JSONB DEFAULT '{"can_delete_posts": true, "can_ban_members": true, "can_pin_posts": true}'::jsonb,
  UNIQUE(circle_id, user_id)
);

-- Flagged content table
CREATE TABLE IF NOT EXISTS public.flagged_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment')),
  content_id UUID NOT NULL,
  circle_id UUID REFERENCES public.circles(id) ON DELETE CASCADE,
  flagged_by UUID REFERENCES public.profiles(user_id),
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'removed')),
  reviewed_by UUID REFERENCES public.profiles(user_id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Circle analytics aggregated data
CREATE TABLE IF NOT EXISTS public.circle_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  active_users_24h INTEGER DEFAULT 0,
  active_users_7d INTEGER DEFAULT 0,
  active_users_30d INTEGER DEFAULT 0,
  new_members INTEGER DEFAULT 0,
  total_posts INTEGER DEFAULT 0,
  total_reactions INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  media_uploads INTEGER DEFAULT 0,
  engagement_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(circle_id, date)
);

-- Automation triggers
CREATE TABLE IF NOT EXISTS public.circle_automation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID REFERENCES public.circles(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('new_member', 'high_activity', 'inactive_member', 'event_live')),
  action_type TEXT NOT NULL CHECK (action_type IN ('send_notification', 'send_message', 'send_email')),
  conditions JSONB DEFAULT '{}'::jsonb,
  message_template TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add additional columns to circles table
ALTER TABLE public.circles 
  ADD COLUMN IF NOT EXISTS privacy_level TEXT DEFAULT 'public' CHECK (privacy_level IN ('public', 'private', 'invite_only')),
  ADD COLUMN IF NOT EXISTS auto_approve_members BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS require_approval_threshold INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rules TEXT,
  ADD COLUMN IF NOT EXISTS event_id TEXT,
  ADD COLUMN IF NOT EXISTS is_live_mode BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS flagged_count INTEGER DEFAULT 0;

-- Add moderation status to circle posts
ALTER TABLE public.circle_posts
  ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'flagged', 'removed')),
  ADD COLUMN IF NOT EXISTS flagged_count INTEGER DEFAULT 0;

-- Add moderation status to circle comments
ALTER TABLE public.circle_post_comments
  ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'flagged', 'removed'));

-- Enable RLS
ALTER TABLE public.circle_moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flagged_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_automation ENABLE ROW LEVEL SECURITY;

-- RLS Policies for circle_moderators
CREATE POLICY "Circle owners and admins can manage moderators"
ON public.circle_moderators
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (
    SELECT 1 FROM public.circles
    WHERE circles.id = circle_moderators.circle_id
    AND circles.created_by = auth.uid()
  )
);

CREATE POLICY "Moderators can view their assignments"
ON public.circle_moderators
FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for flagged_content
CREATE POLICY "Admins and moderators can view flagged content"
ON public.flagged_content
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (
    SELECT 1 FROM public.circle_moderators
    WHERE circle_moderators.circle_id = flagged_content.circle_id
    AND circle_moderators.user_id = auth.uid()
  )
);

CREATE POLICY "Users can flag content"
ON public.flagged_content
FOR INSERT
WITH CHECK (auth.uid() = flagged_by);

CREATE POLICY "Admins and moderators can update flagged content"
ON public.flagged_content
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (
    SELECT 1 FROM public.circle_moderators
    WHERE circle_moderators.circle_id = flagged_content.circle_id
    AND circle_moderators.user_id = auth.uid()
  )
);

-- RLS Policies for circle_analytics
CREATE POLICY "Circle owners, moderators, and admins can view analytics"
ON public.circle_analytics
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (
    SELECT 1 FROM public.circles
    WHERE circles.id = circle_analytics.circle_id
    AND circles.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.circle_moderators
    WHERE circle_moderators.circle_id = circle_analytics.circle_id
    AND circle_moderators.user_id = auth.uid()
  )
);

-- RLS Policies for circle_automation
CREATE POLICY "Circle owners and admins can manage automation"
ON public.circle_automation
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (
    SELECT 1 FROM public.circles
    WHERE circles.id = circle_automation.circle_id
    AND circles.created_by = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_circle_moderators_circle_id ON public.circle_moderators(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_moderators_user_id ON public.circle_moderators(user_id);
CREATE INDEX IF NOT EXISTS idx_flagged_content_circle_id ON public.flagged_content(circle_id);
CREATE INDEX IF NOT EXISTS idx_flagged_content_status ON public.flagged_content(status);
CREATE INDEX IF NOT EXISTS idx_circle_analytics_circle_id ON public.circle_analytics(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_analytics_date ON public.circle_analytics(date);
CREATE INDEX IF NOT EXISTS idx_circle_automation_circle_id ON public.circle_automation(circle_id);

-- Create function to check if user is circle moderator or owner
CREATE OR REPLACE FUNCTION public.is_circle_moderator(_user_id uuid, _circle_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.circles WHERE id = _circle_id AND created_by = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.circle_moderators WHERE circle_id = _circle_id AND user_id = _user_id
  ) OR has_role(_user_id, 'admin'::app_role);
$$;