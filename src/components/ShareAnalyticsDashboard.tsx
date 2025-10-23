import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useShareTracking } from "@/hooks/useShareTracking";
import { useAuth } from "@/hooks/useAuth";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, MousePointerClick, Eye } from "lucide-react";

interface ShareData {
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

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

export const ShareAnalyticsDashboard = () => {
  const { user } = useAuth();
  const { getShareAnalytics } = useShareTracking();
  const [analytics, setAnalytics] = useState<ShareData[]>([]);
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
    setAnalytics(data as ShareData[]);
    setLoading(false);
  };

  // Calculate statistics
  const totalShares = analytics.length;
  const totalViews = analytics.reduce((sum, item) => 
    sum + item.share_analytics.filter(a => a.event_type === 'view').length, 0
  );
  const totalClicks = analytics.reduce((sum, item) => 
    sum + item.share_analytics.filter(a => a.event_type === 'click').length, 0
  );
  const totalConversions = analytics.reduce((sum, item) => 
    sum + item.share_analytics.filter(a => a.event_type === 'conversion').length, 0
  );

  // Platform breakdown
  const platformData = analytics.reduce((acc, item) => {
    const platform = item.share_platform;
    if (!acc[platform]) {
      acc[platform] = { name: platform, shares: 0, views: 0, clicks: 0 };
    }
    acc[platform].shares += 1;
    acc[platform].views += item.share_analytics.filter(a => a.event_type === 'view').length;
    acc[platform].clicks += item.share_analytics.filter(a => a.event_type === 'click').length;
    return acc;
  }, {} as Record<string, { name: string; shares: number; views: number; clicks: number }>);

  const platformChartData = Object.values(platformData);
  const platformPieData = platformChartData.map(item => ({
    name: item.name,
    value: item.shares
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShares}</div>
            <p className="text-xs text-muted-foreground">
              Across all platforms
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground">
              Content impressions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks}</div>
            <p className="text-xs text-muted-foreground">
              Link engagements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversions}</div>
            <p className="text-xs text-muted-foreground">
              {totalShares > 0 ? `${((totalConversions / totalShares) * 100).toFixed(1)}% rate` : 'No data'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Platform Performance</CardTitle>
            <CardDescription>Shares, views, and clicks by platform</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="shares" fill="#8b5cf6" name="Shares" />
                <Bar dataKey="views" fill="#ec4899" name="Views" />
                <Bar dataKey="clicks" fill="#f59e0b" name="Clicks" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Share Distribution</CardTitle>
            <CardDescription>Breakdown by platform</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={platformPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {platformPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {analytics.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">No sharing data yet</p>
              <p className="text-sm text-muted-foreground">
                Start sharing content to see analytics here
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
