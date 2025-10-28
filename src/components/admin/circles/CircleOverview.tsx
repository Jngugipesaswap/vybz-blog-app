import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Users, Activity, Flag, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface CircleMetrics {
  id: string;
  name: string;
  description: string;
  member_count: number;
  post_count: number;
  flagged_count: number;
  is_live: boolean;
  privacy_level: string;
  created_at: string;
  active_24h?: number;
  engagement_rate?: number;
}

export function CircleOverview() {
  const [circles, setCircles] = useState<CircleMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"created" | "members" | "activity">("created");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCircles();
  }, []);

  const fetchCircles = async () => {
    try {
      const { data: circlesData, error } = await supabase
        .from("circles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch analytics for each circle
      const circlesWithMetrics = await Promise.all(
        (circlesData || []).map(async (circle) => {
          const { data: analytics } = await supabase
            .from("circle_analytics")
            .select("active_users_24h, engagement_rate")
            .eq("circle_id", circle.id)
            .order("date", { ascending: false })
            .limit(1)
            .single();

          return {
            ...circle,
            active_24h: analytics?.active_users_24h || 0,
            engagement_rate: analytics?.engagement_rate || 0,
          };
        })
      );

      setCircles(circlesWithMetrics);
    } catch (error) {
      console.error("Error fetching circles:", error);
      toast.error("Failed to load circles");
    } finally {
      setLoading(false);
    }
  };

  const filteredCircles = circles
    .filter((circle) =>
      circle.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "members":
          return b.member_count - a.member_count;
        case "activity":
          return (b.active_24h || 0) - (a.active_24h || 0);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const totalStats = {
    totalCircles: circles.length,
    totalMembers: circles.reduce((sum, c) => sum + c.member_count, 0),
    totalPosts: circles.reduce((sum, c) => sum + c.post_count, 0),
    flaggedContent: circles.reduce((sum, c) => sum + c.flagged_count, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Circle Management</h1>
          <p className="text-muted-foreground mt-1">
            Oversee all circles and community activity
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Circle
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-effect border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Circles</p>
                <p className="text-2xl font-bold">{totalStats.totalCircles}</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">{totalStats.totalMembers}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold">{totalStats.totalPosts}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Flagged Content</p>
                <p className="text-2xl font-bold">{totalStats.flaggedContent}</p>
              </div>
              <Flag className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="glass-effect">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search circles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={sortBy === "created" ? "default" : "outline"}
                onClick={() => setSortBy("created")}
                size="sm"
              >
                Created
              </Button>
              <Button
                variant={sortBy === "members" ? "default" : "outline"}
                onClick={() => setSortBy("members")}
                size="sm"
              >
                Members
              </Button>
              <Button
                variant={sortBy === "activity" ? "default" : "outline"}
                onClick={() => setSortBy("activity")}
                size="sm"
              >
                Activity
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Circles List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCircles.map((circle) => (
          <Card key={circle.id} className="glass-effect hover:border-primary/40 transition-all cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle>{circle.name}</CardTitle>
                    {circle.is_live && (
                      <Badge variant="destructive" className="animate-pulse">
                        LIVE
                      </Badge>
                    )}
                    <Badge variant="outline">{circle.privacy_level}</Badge>
                  </div>
                  <CardDescription className="mt-1">{circle.description}</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Members</p>
                  <p className="font-semibold">{circle.member_count}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Posts</p>
                  <p className="font-semibold">{circle.post_count}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Active (24h)</p>
                  <p className="font-semibold">{circle.active_24h || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Engagement</p>
                  <p className="font-semibold">{circle.engagement_rate?.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Flagged</p>
                  <p className={`font-semibold ${circle.flagged_count > 0 ? 'text-destructive' : ''}`}>
                    {circle.flagged_count}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
