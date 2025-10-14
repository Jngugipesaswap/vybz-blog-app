-- Create tracking tables for social shares and analytics

-- Table for tracking share links
CREATE TABLE IF NOT EXISTS public.share_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content_type text NOT NULL, -- 'event', 'venue', 'post'
  content_id text NOT NULL,
  share_platform text NOT NULL, -- 'whatsapp', 'instagram', 'x', 'facebook', etc.
  tracking_code text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone
);

-- Table for tracking engagement
CREATE TABLE IF NOT EXISTS public.share_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_link_id uuid REFERENCES public.share_links(id) ON DELETE CASCADE,
  event_type text NOT NULL, -- 'view', 'click', 'conversion'
  ip_address text,
  user_agent text,
  referrer text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for share_links
CREATE POLICY "Users can view own share links"
ON public.share_links FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create own share links"
ON public.share_links FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for share_analytics
CREATE POLICY "Analytics viewable by link owner"
ON public.share_analytics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.share_links
    WHERE share_links.id = share_analytics.share_link_id
    AND (share_links.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Anyone can create analytics events"
ON public.share_analytics FOR INSERT
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_share_links_user_id ON public.share_links(user_id);
CREATE INDEX IF NOT EXISTS idx_share_links_tracking_code ON public.share_links(tracking_code);
CREATE INDEX IF NOT EXISTS idx_share_analytics_share_link_id ON public.share_analytics(share_link_id);
CREATE INDEX IF NOT EXISTS idx_share_analytics_created_at ON public.share_analytics(created_at);