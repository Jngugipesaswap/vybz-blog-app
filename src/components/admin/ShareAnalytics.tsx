import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useShareTracking } from "@/hooks/useShareTracking";
import { useAuth } from "@/hooks/useAuth";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface ShareLink {
  id: string;
  content_type: string;
  content_id: string;
  share_platform: string;
  tracking_code: string;
  created_at: string;
  share_analytics: Array<{
    event_type: string;
    created_at: string;
  }>;
}

export const ShareAnalytics = () => {
  const { user } = useAuth();
  const { getShareAnalytics } = useShareTracking();
  const [analytics, setAnalytics] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    if (!user) return;
    
    setLoading(true);
    const data = await getShareAnalytics(user.id);
    setAnalytics(data);
    setLoading(false);
  };

  const getPlatformStats = () => {
    const stats: Record<string, { views: number; clicks: number; conversions: number }> = {};

    analytics.forEach(link => {
      if (!stats[link.share_platform]) {
        stats[link.share_platform] = { views: 0, clicks: 0, conversions: 0 };
      }

      link.share_analytics?.forEach(event => {
        if (event.event_type === 'view') stats[link.share_platform].views++;
        if (event.event_type === 'click') stats[link.share_platform].clicks++;
        if (event.event_type === 'conversion') stats[link.share_platform].conversions++;
      });
    });

    return Object.entries(stats).map(([platform, data]) => ({
      platform: platform.charAt(0).toUpperCase() + platform.slice(1),
      ...data
    }));
  };

  const getTotalStats = () => {
    let totalViews = 0;
    let totalClicks = 0;
    let totalConversions = 0;

    analytics.forEach(link => {
      link.share_analytics?.forEach(event => {
        if (event.event_type === 'view') totalViews++;
        if (event.event_type === 'click') totalClicks++;
        if (event.event_type === 'conversion') totalConversions++;
      });
    });

    return { totalViews, totalClicks, totalConversions };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const platformStats = getPlatformStats();
  const { totalViews, totalClicks, totalConversions } = getTotalStats();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground">From tracked shares</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks}</div>
            <p className="text-xs text-muted-foreground">Link interactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversions}</div>
            <p className="text-xs text-muted-foreground">Goal completions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Performance</CardTitle>
          <CardDescription>Engagement metrics by social platform</CardDescription>
        </CardHeader>
        <CardContent>
          {platformStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="views" fill="hsl(var(--primary))" />
                <Bar dataKey="clicks" fill="hsl(var(--secondary))" />
                <Bar dataKey="conversions" fill="hsl(var(--accent))" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No tracking data yet. Start sharing content with tracking enabled!
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Shares</CardTitle>
          <CardDescription>Your latest tracked share links</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.slice(0, 10).map(link => (
              <div key={link.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{link.content_type.toUpperCase()}</p>
                  <p className="text-sm text-muted-foreground">
                    via {link.share_platform} • {link.share_analytics?.length || 0} events
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(link.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
            {analytics.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No shares yet. Share some content to see tracking data here!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
