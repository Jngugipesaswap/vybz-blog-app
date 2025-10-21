import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAnalytics = () => {
  const trackActivity = useCallback(async (
    activityType: string,
    entityType: string,
    entityId?: string,
    metadata?: Record<string, any>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase
        .from('activity_log')
        .insert({
          user_id: user?.id,
          activity_type: activityType,
          entity_type: entityType,
          entity_id: entityId,
          metadata: metadata || {}
        });
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }, []);

  const trackPageView = useCallback(async (postId: string) => {
    try {
      // Get current post views
      const { data: post } = await supabase
        .from('posts')
        .select('views_count')
        .eq('id', postId)
        .single();

      if (post) {
        // Update post views count
        await supabase
          .from('posts')
          .update({ views_count: (post.views_count || 0) + 1 })
          .eq('id', postId);
      }

      // Track in analytics
      await trackActivity('page_view', 'post', postId);

      // Update daily analytics
      const today = new Date().toISOString().split('T')[0];
      const { data: existing } = await supabase
        .from('post_analytics')
        .select('id, views, unique_views')
        .eq('post_id', postId)
        .eq('date', today)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('post_analytics')
          .update({
            views: existing.views + 1,
            unique_views: existing.unique_views + 1
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('post_analytics')
          .insert({
            post_id: postId,
            date: today,
            views: 1,
            unique_views: 1
          });
      }
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }, [trackActivity]);

  const trackShare = useCallback(async (postId: string, platform: string) => {
    try {
      await trackActivity('share', 'post', postId, { platform });

      // Update daily analytics
      const today = new Date().toISOString().split('T')[0];
      const { data: existing } = await supabase
        .from('post_analytics')
        .select('id, shares')
        .eq('post_id', postId)
        .eq('date', today)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('post_analytics')
          .update({ shares: existing.shares + 1 })
          .eq('id', existing.id);
      }
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  }, [trackActivity]);

  return {
    trackActivity,
    trackPageView,
    trackShare
  };
};
