import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, MessageSquare, Eye, TrendingUp, Trophy, Wallet as WalletIcon } from "lucide-react";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from "recharts";

export function DashboardOverview() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    totalComments: 0,
    totalViews: 0,
    totalLoyaltyPoints: 0,
    totalWalletBalance: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [posts, users, comments, analytics, loyalty, wallets] = await Promise.all([
      supabase.from("posts").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("comments").select("id", { count: "exact", head: true }),
      supabase.from("post_analytics").select("views"),
      supabase.from("loyalty_points").select("points"),
      supabase.from("wallets").select("balance"),
    ]);

    const totalViews = analytics.data?.reduce((sum, item) => sum + (item.views || 0), 0) || 0;
    const totalLoyaltyPoints = loyalty.data?.reduce((sum, item) => sum + (item.points || 0), 0) || 0;
    const totalWalletBalance = wallets.data?.reduce((sum, item) => sum + Number(item.balance || 0), 0) || 0;

    setStats({
      totalPosts: posts.count || 0,
      totalUsers: users.count || 0,
      totalComments: comments.count || 0,
      totalViews,
      totalLoyaltyPoints,
      totalWalletBalance,
    });
  };

  const recentActivityData = [
    { name: "Mon", posts: 12, users: 8 },
    { name: "Tue", posts: 19, users: 12 },
    { name: "Wed", posts: 15, users: 10 },
    { name: "Thu", posts: 22, users: 15 },
    { name: "Fri", posts: 28, users: 20 },
    { name: "Sat", posts: 25, users: 18 },
    { name: "Sun", posts: 20, users: 14 },
  ];

  const statCards = [
    { title: "Total Posts", value: stats.totalPosts, icon: FileText, color: "text-blue-500", bgColor: "bg-blue-500/10" },
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "text-purple-500", bgColor: "bg-purple-500/10" },
    { title: "Total Comments", value: stats.totalComments, icon: MessageSquare, color: "text-green-500", bgColor: "bg-green-500/10" },
    { title: "Total Views", value: stats.totalViews, icon: Eye, color: "text-orange-500", bgColor: "bg-orange-500/10" },
    { title: "Loyalty Points", value: stats.totalLoyaltyPoints, icon: Trophy, color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
    { title: "Wallet Balance", value: `$${stats.totalWalletBalance.toFixed(2)}`, icon: WalletIcon, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover-lift glass-effect border-border/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-2">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500">+12%</span>
                  <span className="ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-effect border-border/50">
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                posts: { label: "Posts", color: "hsl(var(--chart-1))" },
                users: { label: "Users", color: "hsl(var(--chart-2))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={recentActivityData}>
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip />
                  <Bar dataKey="posts" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="users" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="glass-effect border-border/50">
          <CardHeader>
            <CardTitle>Engagement Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: "Engagement", color: "hsl(var(--primary))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={recentActivityData}>
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip />
                  <Line type="monotone" dataKey="posts" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: "hsl(var(--primary))" }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
