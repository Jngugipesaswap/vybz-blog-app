import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateShareLinkParams {
  contentType: 'event' | 'venue' | 'post';
  contentId: string;
  sharePlatform: string;
  userId?: string;
}

export const useShareTracking = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateTrackingCode = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  const createShareLink = async ({
    contentType,
    contentId,
    sharePlatform,
    userId
  }: CreateShareLinkParams) => {
    if (!userId) {
      // If no user is logged in, return regular URL without tracking
      return null;
    }

    setLoading(true);
    try {
      const trackingCode = generateTrackingCode();
      
      const { data, error } = await supabase
        .from('share_links')
        .insert({
          user_id: userId,
          content_type: contentType,
          content_id: contentId,
          share_platform: sharePlatform,
          tracking_code: trackingCode,
        })
        .select()
        .single();

      if (error) throw error;

      return trackingCode;
    } catch (error: any) {
      console.error('Error creating share link:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const trackEvent = async (trackingCode: string, eventType: 'view' | 'click' | 'conversion') => {
    try {
      // Get share link by tracking code
      const { data: shareLink } = await supabase
        .from('share_links')
        .select('id')
        .eq('tracking_code', trackingCode)
        .single();

      if (!shareLink) return;

      // Record analytics event
      await supabase.from('share_analytics').insert({
        share_link_id: shareLink.id,
        event_type: eventType,
        ip_address: null, // Could be populated server-side
        user_agent: navigator.userAgent,
        referrer: document.referrer
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  };

  const getShareAnalytics = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('share_links')
        .select(`
          id,
          content_type,
          content_id,
          share_platform,
          tracking_code,
          created_at,
          share_analytics (
            event_type,
            created_at
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
      return [];
    }
  };

  return {
    createShareLink,
    trackEvent,
    getShareAnalytics,
    loading
  };
};
