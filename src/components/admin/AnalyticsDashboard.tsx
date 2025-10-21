import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, FileText, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ActivityLogger } from "./ActivityLogger";

interface Stats {
  totalPosts: number;
  totalUsers: number;
  totalViews: number;
  totalEngagement: number;
}

export const AnalyticsDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    totalUsers: 0,
    totalViews: 0,
    totalEngagement: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch total posts
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');

      // Fetch total users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch total views
      const { data: viewsData } = await supabase
        .from('post_analytics')
        .select('views');

      const totalViews = viewsData?.reduce((sum, item) => sum + (item.views || 0), 0) || 0;

      // Fetch engagement (comments + reactions)
      const { count: commentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true });

      const { count: reactionsCount } = await supabase
        .from('post_reactions')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalPosts: postsCount || 0,
        totalUsers: usersCount || 0,
        totalViews,
        totalEngagement: (commentsCount || 0) + (reactionsCount || 0)
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sample data for charts
  const trafficData = [
    { name: "Mon", views: 400, users: 240 },
    { name: "Tue", views: 300, users: 139 },
    { name: "Wed", views: 600, users: 280 },
    { name: "Thu", views: 278, users: 139 },
    { name: "Fri", views: 189, users: 239 },
    { name: "Sat", views: 339, users: 349 },
    { name: "Sun", views: 349, users: 200 },
  ];

  const contentData = [
    { name: "Posts", value: 400 },
    { name: "Videos", value: 300 },
    { name: "Photos", value: 200 },
    { name: "Reviews", value: 100 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          Loading analytics...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        <p className="text-muted-foreground">
          Track your platform's performance and engagement metrics
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
            <p className="text-xs text-muted-foreground">Published content</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground">Page views</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEngagement}</div>
            <p className="text-xs text-muted-foreground">Comments & reactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Traffic Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="views" fill="#8884d8" name="Views" />
                <Bar dataKey="users" fill="#82ca9d" name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {contentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity Logger */}
      <ActivityLogger />
    </div>
  );
};
