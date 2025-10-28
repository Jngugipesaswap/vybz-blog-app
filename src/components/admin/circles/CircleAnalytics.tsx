import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, MessageSquare, Heart, Image, TrendingUp, Activity } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface AnalyticsData {
  date: string;
  active_users_24h: number;
  new_members: number;
  total_posts: number;
  total_reactions: number;
  total_comments: number;
  media_uploads: number;
  engagement_rate: number;
}

export function CircleAnalytics() {
  const [circles, setCircles] = useState<any[]>([]);
  const [selectedCircle, setSelectedCircle] = useState<string>("");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    fetchCircles();
  }, []);

  useEffect(() => {
    if (selectedCircle) {
      fetchAnalytics();
    }
  }, [selectedCircle, timeRange]);

  const fetchCircles = async () => {
    try {
      const { data, error } = await supabase
        .from("circles")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setCircles(data || []);
      if (data && data.length > 0) {
        setSelectedCircle(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching circles:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from("circle_analytics")
        .select("*")
        .eq("circle_id", selectedCircle)
        .gte("date", startDate.toISOString().split("T")[0])
        .order("date", { ascending: true });

      if (error) throw error;
      setAnalyticsData(data || []);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const latestData = analyticsData[analyticsData.length - 1];
  const totalStats = analyticsData.reduce(
    (acc, day) => ({
      activeUsers: acc.activeUsers + day.active_users_24h,
      newMembers: acc.newMembers + day.new_members,
      totalPosts: acc.totalPosts + day.total_posts,
      totalReactions: acc.totalReactions + day.total_reactions,
      totalComments: acc.totalComments + day.total_comments,
      mediaUploads: acc.mediaUploads + day.media_uploads,
    }),
    { activeUsers: 0, newMembers: 0, totalPosts: 0, totalReactions: 0, totalComments: 0, mediaUploads: 0 }
  );

  const chartData = analyticsData.map((day) => ({
    date: new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    "Active Users": day.active_users_24h,
    "New Members": day.new_members,
    Posts: day.total_posts,
    Reactions: day.total_reactions,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Circle Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track engagement, growth, and performance metrics
        </p>
      </div>

      {/* Filters */}
      <Card className="glass-effect">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={selectedCircle} onValueChange={setSelectedCircle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a circle" />
                </SelectTrigger>
                <SelectContent>
                  {circles.map((circle) => (
                    <SelectItem key={circle.id} value={circle.id}>
                      {circle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="glass-effect border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Active Users</p>
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">{latestData?.active_users_24h || 0}</p>
              <p className="text-xs text-muted-foreground">Last 24h</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">New Members</p>
                <Users className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">{totalStats.newMembers}</p>
              <p className="text-xs text-muted-foreground">{timeRange}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Total Posts</p>
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">{totalStats.totalPosts}</p>
              <p className="text-xs text-muted-foreground">{timeRange}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Reactions</p>
                <Heart className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">{totalStats.totalReactions}</p>
              <p className="text-xs text-muted-foreground">{timeRange}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Comments</p>
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">{totalStats.totalComments}</p>
              <p className="text-xs text-muted-foreground">{timeRange}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Media Uploads</p>
                <Image className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">{totalStats.mediaUploads}</p>
              <p className="text-xs text-muted-foreground">{timeRange}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Activity Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="Active Users" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="Posts" stroke="hsl(var(--chart-2))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Engagement Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Legend />
                <Bar dataKey="Reactions" fill="hsl(var(--chart-1))" />
                <Bar dataKey="Posts" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
