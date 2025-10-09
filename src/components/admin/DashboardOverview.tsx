import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, MessageSquare, TrendingUp, Wallet, Award } from "lucide-react";

export function DashboardOverview() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    totalUsers: 0,
    totalComments: 0,
    pendingComments: 0,
    totalViews: 0,
    totalLoyaltyPoints: 0,
    totalWalletBalance: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          { count: totalPosts },
          { data: publishedPosts },
          { count: totalUsers },
          { count: totalComments },
          { count: pendingComments },
          { data: posts },
          { data: loyaltyPoints },
          { data: wallets },
        ] = await Promise.all([
          supabase.from("posts").select("*", { count: "exact", head: true }),
          supabase.from("posts").select("id").eq("status", "published"),
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("comments").select("*", { count: "exact", head: true }),
          supabase.from("comments").select("*", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("posts").select("views_count"),
          supabase.from("loyalty_points").select("points"),
          supabase.from("wallets").select("balance"),
        ]);

        const totalViews = posts?.reduce((sum, post) => sum + (post.views_count || 0), 0) || 0;
        const totalLoyalty = loyaltyPoints?.reduce((sum, lp) => sum + (lp.points || 0), 0) || 0;
        const totalWallet = wallets?.reduce((sum, w) => sum + (typeof w.balance === 'number' ? w.balance : parseFloat(String(w.balance) || "0")), 0) || 0;

        setStats({
          totalPosts: totalPosts || 0,
          publishedPosts: publishedPosts?.length || 0,
          totalUsers: totalUsers || 0,
          totalComments: totalComments || 0,
          pendingComments: pendingComments || 0,
          totalViews,
          totalLoyaltyPoints: totalLoyalty,
          totalWalletBalance: totalWallet,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Posts",
      value: stats.totalPosts,
      subtitle: `${stats.publishedPosts} published`,
      icon: FileText,
      color: "text-blue-500",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-green-500",
    },
    {
      title: "Comments",
      value: stats.totalComments,
      subtitle: `${stats.pendingComments} pending`,
      icon: MessageSquare,
      color: "text-orange-500",
    },
    {
      title: "Total Views",
      value: stats.totalViews.toLocaleString(),
      icon: TrendingUp,
      color: "text-purple-500",
    },
    {
      title: "Loyalty Points",
      value: stats.totalLoyaltyPoints.toLocaleString(),
      icon: Award,
      color: "text-yellow-500",
    },
    {
      title: "Wallet Balance",
      value: `$${stats.totalWalletBalance.toFixed(2)}`,
      icon: Wallet,
      color: "text-emerald-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
