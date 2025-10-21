import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, TrendingUp, Eye, Heart, MessageSquare,
  PlusCircle, Edit, Trash2, BarChart3, ArrowLeft, LogOut
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreatePostDialog } from "./CreatePostDialog";
import { EditPostDialog } from "./EditPostDialog";
import { ContentAnalytics } from "./ContentAnalytics";

interface ContentStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  totalReactions: number;
  totalComments: number;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  status: string;
  views_count: number;
  published_at: string | null;
  created_at: string;
  featured_image: string | null;
  meta_title: string | null;
  meta_description: string | null;
}

export function ContentCreatorDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast: toastHook } = useToast();
  const [stats, setStats] = useState<ContentStats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0,
    totalReactions: 0,
    totalComments: 0
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toastHook({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toastHook({
        title: "Signed Out",
        description: "You've been successfully signed out.",
      });
      navigate("/");
    }
  };

  useEffect(() => {
    if (user) {
      fetchContentData();
    }
  }, [user]);

  const fetchContentData = async () => {
    try {
      setLoading(true);

      // Fetch all posts by the content creator
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("*")
        .eq("author_id", user!.id)
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;
      setPosts(postsData || []);

      // Calculate stats
      const published = postsData?.filter(p => p.status === 'published').length || 0;
      const draft = postsData?.filter(p => p.status === 'draft').length || 0;
      const totalViews = postsData?.reduce((sum, p) => sum + (p.views_count || 0), 0) || 0;

      // Fetch reactions count
      const postIds = postsData?.map(p => p.id) || [];
      let totalReactions = 0;
      let totalComments = 0;

      if (postIds.length > 0) {
        const { count: reactionsCount } = await supabase
          .from("post_reactions")
          .select("*", { count: "exact", head: true })
          .in("post_id", postIds);

        const { count: commentsCount } = await supabase
          .from("comments")
          .select("*", { count: "exact", head: true })
          .in("post_id", postIds);

        totalReactions = reactionsCount || 0;
        totalComments = commentsCount || 0;
      }

      setStats({
        totalPosts: postsData?.length || 0,
        publishedPosts: published,
        draftPosts: draft,
        totalViews,
        totalReactions,
        totalComments
      });

      // Generate performance data (last 7 days)
      const mockPerformance = Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views: Math.floor(Math.random() * 100) + 50,
        reactions: Math.floor(Math.random() * 30) + 10,
        comments: Math.floor(Math.random() * 15) + 5
      }));
      setPerformanceData(mockPerformance);

    } catch (error) {
      console.error("Error fetching content data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500';
      case 'draft': return 'bg-yellow-500';
      case 'scheduled': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const handleEditPost = (post: Post) => {
    setSelectedPost(post);
    setEditDialogOpen(true);
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      toast.success("Post deleted successfully");
      fetchContentData();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your content dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg cta-gradient flex items-center justify-center">
                <span className="text-white font-bold">V</span>
              </div>
              <span className="font-bold">Content Dashboard</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="p-6 space-y-6">{/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Content Creator Hub
          </h1>
          <p className="text-muted-foreground mt-2">Manage your content and track performance</p>
        </div>
        <Button className="gap-2" onClick={() => setCreateDialogOpen(true)}>
          <PlusCircle className="h-4 w-4" />
          Create New Post
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="relative overflow-hidden group hover:shadow-xl transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Total Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{stats.totalPosts}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-xl transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Published
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stats.publishedPosts}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-xl transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Edit className="h-4 w-4 text-yellow-500" />
              Drafts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">{stats.draftPosts}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-xl transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-500" />
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-500">{stats.totalViews}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-xl transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              Reactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-500">{stats.totalReactions}</div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-xl transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-cyan-500" />
              Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-500">{stats.totalComments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="posts">My Posts</TabsTrigger>
          <TabsTrigger value="analytics">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Posts Tab */}
        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Content</CardTitle>
              <CardDescription>Manage all your posts in one place</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(post.status)}>
                          {post.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{post.views_count || 0}</TableCell>
                      <TableCell>
                        {new Date(post.published_at || post.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleEditPost(post)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Content Performance
              </CardTitle>
              <CardDescription>Track your content metrics over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))' 
                    }} 
                  />
                  <Line type="monotone" dataKey="views" stroke="#8b5cf6" strokeWidth={2} name="Views" />
                  <Line type="monotone" dataKey="reactions" stroke="#ec4899" strokeWidth={2} name="Reactions" />
                  <Line type="monotone" dataKey="comments" stroke="#06b6d4" strokeWidth={2} name="Comments" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <ContentAnalytics />
        </TabsContent>

        {/* Old Performance Tab for backwards compatibility */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Engagement Metrics
              </CardTitle>
              <CardDescription>Compare engagement across different metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))' 
                    }} 
                  />
                  <Bar dataKey="views" fill="#8b5cf6" name="Views" />
                  <Bar dataKey="reactions" fill="#ec4899" name="Reactions" />
                  <Bar dataKey="comments" fill="#06b6d4" name="Comments" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>

      {/* Dialogs */}
      {user && (
        <>
          <CreatePostDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            userId={user.id}
            onSuccess={fetchContentData}
          />
          <EditPostDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            post={selectedPost}
            onSuccess={fetchContentData}
          />
        </>
      )}
    </div>
  );
}