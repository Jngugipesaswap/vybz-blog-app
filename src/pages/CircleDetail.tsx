import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Users, 
  MessageCircle, 
  Radio, 
  Sparkles,
  UserPlus,
  Share2,
  Heart,
  Repeat2,
  Send,
  Plus,
  CheckCircle2,
  Crown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreatePostDialog } from "@/components/community/CreatePostDialog";
import { cn } from "@/lib/utils";

const CircleDetail = () => {
  const { circleId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [circle, setCircle] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    if (circleId) {
      fetchCircleData();
      checkMembership();
    }
  }, [circleId, user]);

  const fetchCircleData = async () => {
    try {
      const { data: circleData, error: circleError } = await supabase
        .from("circles" as any)
        .select("*")
        .eq("id", circleId)
        .single();

      if (circleError) throw circleError;
      setCircle(circleData);

      // Fetch posts
      const { data: postsData } = await supabase
        .from("circle_posts" as any)
        .select("*, profiles(*)")
        .eq("circle_id", circleId)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(20);

      // Check which posts user has reacted to
      let userReactions: string[] = [];
      if (user) {
        const { data: reactions } = await supabase
          .from("circle_post_reactions" as any)
          .select("post_id")
          .eq("user_id", user.id);
        
        userReactions = reactions?.map((r: any) => r.post_id) || [];
      }

      // Add hasReacted flag to each post
      const postsWithReactions = (postsData || []).map((post: any) => ({
        ...post,
        hasReacted: userReactions.includes(post.id)
      }));

      setPosts(postsWithReactions);

      const { data: membersData } = await supabase
        .from("circle_members" as any)
        .select("*, profiles(*)")
        .eq("circle_id", circleId)
        .order("joined_at", { ascending: false })
        .limit(50);

      setMembers(membersData || []);
    } catch (error: any) {
      toast.error("Failed to load circle");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkMembership = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("circle_members" as any)
      .select("id")
      .eq("circle_id", circleId)
      .eq("user_id", user.id)
      .single();

    setIsMember(!!data);
  };

  const handleJoinLeave = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      if (isMember) {
        await supabase
          .from("circle_members" as any)
          .delete()
          .eq("circle_id", circleId)
          .eq("user_id", user.id);
        
        setIsMember(false);
        toast.success("Left circle");
      } else {
        await supabase
          .from("circle_members" as any)
          .insert({ circle_id: circleId, user_id: user.id });
        
        setIsMember(true);
        toast.success("Joined circle!");
      }
      fetchCircleData();
    } catch (error: any) {
      toast.error("Failed to update membership");
    }
  };

  const handleReaction = async (postId: string, currentCount: number, hasReacted: boolean) => {
    if (!user) {
      toast.error("Please login to react");
      return;
    }

    try {
      if (hasReacted) {
        // Remove reaction
        await supabase
          .from("circle_post_reactions" as any)
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        // Update post reaction count
        await supabase
          .from("circle_posts" as any)
          .update({ reaction_count: Math.max(0, currentCount - 1) })
          .eq("id", postId);
      } else {
        // Add reaction
        await supabase
          .from("circle_post_reactions" as any)
          .insert({ post_id: postId, user_id: user.id, reaction_type: "like" });

        // Update post reaction count
        await supabase
          .from("circle_posts" as any)
          .update({ reaction_count: currentCount + 1 })
          .eq("id", postId);
      }

      // Refresh posts
      fetchCircleData();
    } catch (error: any) {
      toast.error("Failed to update reaction");
    }
  };

  const handleShare = async (postId: string) => {
    const shareUrl = `${window.location.origin}/community/circle/${circleId}?post=${postId}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </main>
      </div>
    );
  }

  if (!circle) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2 text-foreground">Circle not found</h2>
            <Button onClick={() => navigate("/community")}>
              Back to Community
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1 pt-20 pb-12 relative">
        {/* Dynamic Top Banner */}
        <div className="relative h-[400px] overflow-hidden">
          {circle.cover_image ? (
            <img
              src={circle.cover_image}
              alt={circle.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/30 to-accent/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/20" />
          
          <div className="absolute top-4 left-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/community")}
              className="bg-background/50 backdrop-blur-sm hover:bg-background/70 border border-border/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          {/* Status Badge */}
          {circle.is_live ? (
            <Badge className="absolute top-4 right-4 bg-destructive border-0 animate-pulse text-base px-4 py-2 shadow-glow">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
                <Radio className="w-4 h-4" />
                LIVE NOW
              </span>
            </Badge>
          ) : (
            <Badge className="absolute top-4 right-4 bg-accent/90 backdrop-blur-sm border-0 px-4 py-2">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {circle.status === 'active' ? 'Active' : 'Recap Mode'}
              </span>
            </Badge>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <div className="flex items-end justify-between gap-4">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-5xl font-black text-foreground">{circle.name}</h1>
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {circle.circle_type}
                    </Badge>
                  </div>
                  
                  {/* About Section */}
                  <div className="bg-card/60 backdrop-blur-md rounded-xl p-4 max-w-3xl border border-border/50">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">About</h3>
                    <p className="text-foreground text-base leading-relaxed">
                      {circle.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 text-muted-foreground text-sm">
                    <span className="flex items-center gap-2 bg-muted/50 backdrop-blur-sm px-4 py-2 rounded-full">
                      <Users className="w-5 h-5" />
                      <span className="font-semibold text-foreground">{circle.member_count || 0}</span> members
                      {members.filter((_, idx) => idx % 3 === 0).length > 0 && (
                        <span className="text-green-500 flex items-center gap-1 ml-2">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          {members.filter((_, idx) => idx % 3 === 0).length} online
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-2 bg-muted/50 backdrop-blur-sm px-4 py-2 rounded-full">
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-semibold text-foreground">{circle.post_count || 0}</span> posts
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-14 w-14 backdrop-blur-sm border-border/50 hover:border-primary/50"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={handleJoinLeave}
                    size="lg"
                    className={cn(
                      "px-10 py-6 text-base transition-all duration-300",
                      isMember 
                        ? "bg-muted hover:bg-muted/80 text-foreground" 
                        : "btn-gradient shadow-glow hover:scale-105"
                    )}
                  >
                    {isMember ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Joined
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5 mr-2" />
                        Join Circle
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Navigation Tabs */}
        <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="feed" className="space-y-6">
              <TabsList className="w-full justify-start h-14 bg-transparent border-0 p-0">
                <TabsTrigger 
                  value="feed" 
                  className="relative h-full px-8 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary data-[state=active]:text-primary"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Feed
                </TabsTrigger>
                <TabsTrigger 
                  value="live" 
                  className="relative h-full px-8 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary data-[state=active]:text-primary"
                >
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4" />
                    Live
                    {circle.is_live && (
                      <span className="w-2 h-2 rounded-full bg-destructive animate-pulse shadow-glow" />
                    )}
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="moments" 
                  className="relative h-full px-8 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary data-[state=active]:text-primary"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Moments
                  {posts.filter(p => p.media_urls?.length > 0).length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 px-2 text-xs">
                      {posts.filter(p => p.media_urls?.length > 0).length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="members" 
                  className="relative h-full px-8 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary data-[state=active]:text-primary"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Members
                  <Badge variant="secondary" className="ml-2 h-5 px-2 text-xs">
                    {members.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <div className="container mx-auto px-4 py-6">
                <TabsContent value="feed" className="space-y-4 mt-0">
                  {posts.length === 0 ? (
                    <div className="text-center py-16 bg-card/50 rounded-2xl border border-border/50 backdrop-blur-sm">
                      <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-bold mb-2 text-foreground">No posts yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Be the first to share something in this circle!
                      </p>
                      {isMember && (
                        <CreatePostDialog circleId={circleId} onPostCreated={fetchCircleData}>
                          <Button className="btn-gradient">
                            <Plus className="w-4 h-4 mr-2" />
                            Create First Post
                          </Button>
                        </CreatePostDialog>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {posts.map((post, idx) => (
                        <div
                          key={post.id}
                          className={cn(
                            "bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-glow animate-fade-in",
                            post.is_pinned && "border-accent/50 bg-accent/5"
                          )}
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          {post.is_pinned && (
                            <Badge className="mb-3 bg-accent/20 text-accent border-accent/50">
                              Pinned Post
                            </Badge>
                          )}
                          <div className="flex items-start gap-4 mb-4">
                            <Avatar className="w-12 h-12 ring-2 ring-primary/20 relative">
                              <AvatarImage src={post.profiles?.avatar_url} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {post.profiles?.full_name?.charAt(0) || "U"}
                              </AvatarFallback>
                              {idx % 3 === 0 && (
                                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card" />
                              )}
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-foreground">
                                  {post.profiles?.full_name || "Anonymous"}
                                </span>
                                {idx < 3 && (
                                  <Badge variant="secondary" className="text-xs px-2 py-0">
                                    <Crown className="w-3 h-3 mr-1 text-accent" />
                                    Top Contributor
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  • {new Date(post.created_at).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                                {post.content}
                              </p>
                            </div>
                          </div>

                          {post.media_urls && post.media_urls.length > 0 && (
                            <div className={cn(
                              "mt-4 gap-2",
                              post.media_urls.length === 1 ? "grid grid-cols-1" : "grid grid-cols-2"
                            )}>
                              {post.media_urls.map((url: string, idx: number) => (
                                <div key={idx} className="relative overflow-hidden rounded-xl group">
                                  <img
                                    src={url}
                                    alt=""
                                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-1 mt-4 pt-4 border-t border-border/50">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReaction(post.id, post.reaction_count || 0, post.hasReacted)}
                              className={cn(
                                "gap-2 transition-all hover:scale-110",
                                post.hasReacted 
                                  ? "text-destructive bg-destructive/10" 
                                  : "hover:text-destructive hover:bg-destructive/10"
                              )}
                            >
                              <Heart 
                                className={cn(
                                  "w-5 h-5 transition-transform",
                                  post.hasReacted && "fill-current"
                                )} 
                              />
                              <span className="font-semibold">{post.reaction_count || 0}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2 hover:text-primary hover:bg-primary/10 transition-all hover:scale-110"
                              onClick={() => toast.info("Comments coming soon!")}
                            >
                              <MessageCircle className="w-5 h-5" />
                              <span className="font-semibold">{post.comment_count || 0}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2 hover:text-accent hover:bg-accent/10 transition-all hover:scale-110"
                              onClick={() => toast.info("Repost feature coming soon!")}
                            >
                              <Repeat2 className="w-5 h-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShare(post.id)}
                              className="gap-2 ml-auto hover:text-primary hover:bg-primary/10 transition-all hover:scale-110"
                            >
                              <Send className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="live" className="mt-0">
                  <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden">
                    <div className={cn(
                      "p-6 text-center border-b border-border/50",
                      circle.is_live 
                        ? "bg-gradient-to-r from-destructive/20 via-primary/20 to-accent/20 animate-pulse" 
                        : "bg-gradient-to-r from-primary/10 to-accent/10"
                    )}>
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <Radio className={cn(
                          "w-6 h-6",
                          circle.is_live && "animate-pulse text-destructive"
                        )} />
                        <h3 className="text-2xl font-bold text-foreground">
                          {circle.is_live ? 'Live Now' : 'Live Space'}
                        </h3>
                        {circle.is_live && (
                          <Badge className="bg-destructive border-0 animate-pulse">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
                              ON AIR
                            </span>
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {circle.is_live 
                          ? `${members.filter((_, idx) => idx % 3 === 0).length} members active now` 
                          : "Live chat activates during events"}
                      </p>
                    </div>
                    <div className="p-8 min-h-[500px] flex flex-col items-center justify-center gap-4">
                      {circle.is_live ? (
                        <>
                          <div className="w-full max-w-2xl space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl animate-fade-in">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-primary/10">U</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="text-sm font-medium">User 1</p>
                                <p className="text-sm text-muted-foreground">This is amazing! 🔥</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-center text-muted-foreground">
                            <Radio className="w-12 h-12 mx-auto mb-2 animate-pulse text-primary" />
                            <p className="text-sm">Real-time chat interface coming soon</p>
                          </div>
                        </>
                      ) : (
                        <div className="text-center">
                          <Radio className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                          <h4 className="text-lg font-semibold mb-2 text-foreground">No Active Session</h4>
                          <p className="text-muted-foreground text-sm max-w-md">
                            Live chat rooms activate automatically during events. Check back when the circle goes live!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="moments" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {posts.filter(p => p.media_urls?.length > 0).slice(0, 12).map((post, idx) => (
                      <div
                        key={post.id}
                        className="group relative bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-glow animate-scale-in"
                        style={{ animationDelay: `${idx * 30}ms` }}
                      >
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={post.media_urls[0]}
                            alt=""
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-5">
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="w-8 h-8 ring-2 ring-primary/50">
                                <AvatarImage src={post.profiles?.avatar_url} />
                                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                  {post.profiles?.full_name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-semibold text-foreground">
                                {post.profiles?.full_name || "Anonymous"}
                              </span>
                            </div>
                            <p className="text-sm text-foreground font-medium line-clamp-2 mb-3">
                              {post.content}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1 bg-background/50 backdrop-blur-sm px-2 py-1 rounded-full">
                                <Heart className="w-3 h-3" /> {post.reaction_count || 0}
                              </span>
                              <span className="flex items-center gap-1 bg-background/50 backdrop-blur-sm px-2 py-1 rounded-full">
                                <MessageCircle className="w-3 h-3" /> {post.comment_count || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                        {post.media_urls.length > 1 && (
                          <Badge className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm border-border/50">
                            +{post.media_urls.length - 1}
                          </Badge>
                        )}
                      </div>
                    ))}
                    {posts.filter(p => p.media_urls?.length > 0).length === 0 && (
                      <div className="col-span-full text-center py-16 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50">
                        <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-bold mb-2 text-foreground">No Moments Yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Share photos and videos to create memorable moments
                        </p>
                        {isMember && (
                          <CreatePostDialog circleId={circleId} onPostCreated={fetchCircleData}>
                            <Button variant="outline">
                              <Plus className="w-4 h-4 mr-2" />
                              Share a Moment
                            </Button>
                          </CreatePostDialog>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="members" className="mt-0">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {members.map((member, idx) => (
                      <div
                        key={member.id}
                        className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-6 text-center hover:border-primary/50 transition-all duration-300 hover:shadow-glow group animate-fade-in"
                        style={{ animationDelay: `${idx * 20}ms` }}
                      >
                        <div className="relative inline-block mb-4">
                          <Avatar className="w-20 h-20 ring-2 ring-primary/20 transition-all duration-300 group-hover:ring-primary/50 group-hover:scale-110">
                            <AvatarImage src={member.profiles?.avatar_url} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xl">
                              {member.profiles?.full_name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          {idx < 3 && (
                            <div className="absolute -top-1 -right-1 bg-accent rounded-full p-1.5 animate-pulse">
                              <Crown className="w-3.5 h-3.5 text-accent-foreground" />
                            </div>
                          )}
                          <div className={cn(
                            "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card transition-all",
                            idx % 3 === 0 ? "bg-green-500 animate-pulse shadow-glow" : "bg-muted"
                          )} />
                        </div>
                        <h4 className="font-bold text-sm mb-2 text-foreground truncate">
                          {member.profiles?.full_name || "Anonymous"}
                        </h4>
                        <div className="space-y-2">
                          <Badge variant="secondary" className="text-xs">
                            {member.role === 'admin' ? '👑 Admin' : member.role === 'moderator' ? '⭐ Mod' : 'Member'}
                          </Badge>
                          {idx < 5 && (
                            <Badge variant="outline" className="text-xs w-full border-accent/50 text-accent">
                              🔥 Top Contributor
                            </Badge>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full mt-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Message
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* Floating Action Button */}
        {isMember && (
          <div className="fixed bottom-8 right-8 z-50">
            <CreatePostDialog circleId={circleId} onPostCreated={fetchCircleData}>
              <Button
                size="lg"
                className="h-16 w-16 rounded-full shadow-glow btn-gradient hover:scale-110 transition-transform duration-300"
              >
                <Plus className="w-8 h-8" />
              </Button>
            </CreatePostDialog>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default CircleDetail;
