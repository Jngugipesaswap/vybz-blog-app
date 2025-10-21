import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Eye, TrendingUp, MessageSquare, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PostPerformance {
  id: string;
  title: string;
  views_count: number;
  total_tracked_views: number;
  total_shares: number;
  comment_count: number;
  reaction_count: number;
}

export const ContentAnalytics = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('content_performance')
        .select('*')
        .eq('author_id', user?.id)
        .limit(10);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalViews = posts.reduce((sum, post) => sum + (post.views_count || 0), 0);
  const totalShares = posts.reduce((sum, post) => sum + (post.total_shares || 0), 0);
  const totalComments = posts.reduce((sum, post) => sum + (post.comment_count || 0), 0);
  const totalReactions = posts.reduce((sum, post) => sum + (post.reaction_count || 0), 0);

  const chartData = posts.map(post => ({
    name: post.title.length > 20 ? post.title.substring(0, 20) + '...' : post.title,
    views: post.views_count,
    engagement: post.comment_count + post.reaction_count
  }));

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
        <h2 className="text-2xl font-bold tracking-tight">Content Analytics</h2>
        <p className="text-muted-foreground">
          Track your content performance and engagement
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground">Across all posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShares}</div>
            <p className="text-xs text-muted-foreground">Social shares</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalComments}</div>
            <p className="text-xs text-muted-foreground">User comments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reactions</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReactions}</div>
            <p className="text-xs text-muted-foreground">Likes & reactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Post Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No posts published yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#8884d8" name="Views" />
                <Bar dataKey="engagement" fill="#82ca9d" name="Engagement" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Top Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {posts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No posts published yet
              </p>
            ) : (
              posts.slice(0, 5).map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{post.title}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.views_count} views
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {post.comment_count} comments
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {post.reaction_count} reactions
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
