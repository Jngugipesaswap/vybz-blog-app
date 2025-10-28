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

      const { data: postsData } = await supabase
        .from("circle_posts" as any)
        .select("*, profiles(*)")
        .eq("circle_id", circleId)
        .order("created_at", { ascending: false })
        .limit(20);

      setPosts(postsData || []);

      const { data: membersData } = await supabase
        .from("circle_members" as any)
        .select("*, profiles(*)")
        .eq("circle_id", circleId)
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
        {/* Hero Header */}
        <div className="relative h-[320px] overflow-hidden">
          {circle.cover_image ? (
            <img
              src={circle.cover_image}
              alt={circle.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/30 to-accent/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          
          <div className="absolute top-4 left-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/community")}
              className="bg-background/50 backdrop-blur-sm hover:bg-background/70"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          {circle.is_live && (
            <Badge className="absolute top-4 right-4 bg-destructive border-0 animate-pulse text-base px-4 py-2 shadow-glow">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
                <Radio className="w-4 h-4" />
                LIVE NOW
              </span>
            </Badge>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <div className="flex items-end justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-black text-foreground">{circle.name}</h1>
                    <Badge variant="secondary" className="text-sm">
                      {circle.circle_type}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-4 max-w-2xl text-base">
                    {circle.description}
                  </p>
                  <div className="flex items-center gap-6 text-muted-foreground text-sm">
                    <span className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      <span className="font-semibold">{circle.member_count || 0}</span> members
                    </span>
                    <span className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-semibold">{circle.post_count || 0}</span> posts
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 backdrop-blur-sm"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={handleJoinLeave}
                    size="lg"
                    className={cn(
                      "px-8 transition-all duration-300",
                      isMember 
                        ? "bg-muted hover:bg-muted/80" 
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

        {/* Content Tabs */}
        <div className="container mx-auto px-4 mt-8">
          <Tabs defaultValue="feed" className="space-y-6">
            <TabsList className="bg-card backdrop-blur-sm border border-border">
              <TabsTrigger value="feed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Feed
              </TabsTrigger>
              <TabsTrigger value="live" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <div className="flex items-center gap-2">
                  Live
                  {circle.is_live && (
                    <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  )}
                </div>
              </TabsTrigger>
              <TabsTrigger value="moments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Moments
              </TabsTrigger>
              <TabsTrigger value="members" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Members
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="space-y-4">
              {posts.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-2xl border border-border">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-bold mb-2 text-foreground">No posts yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to share something in this circle!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-card backdrop-blur-sm rounded-2xl border border-border p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-glow"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                          <AvatarImage src={post.profiles?.avatar_url} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {post.profiles?.full_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-foreground">
                              {post.profiles?.full_name || "Anonymous"}
                            </span>
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
                                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-1 mt-4 pt-4 border-t border-border">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 hover:text-destructive hover:bg-destructive/10"
                        >
                          <Heart className="w-5 h-5" />
                          <span className="font-semibold">{post.reaction_count || 0}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 hover:text-primary hover:bg-primary/10"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span className="font-semibold">{post.comment_count || 0}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 hover:text-accent hover:bg-accent/10"
                        >
                          <Repeat2 className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 ml-auto hover:text-primary hover:bg-primary/10"
                        >
                          <Send className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="live">
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-6 text-center border-b border-border">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Radio className="w-6 h-6 text-foreground animate-pulse" />
                    <h3 className="text-xl font-bold text-foreground">Live Discussion</h3>
                  </div>
                  <p className="text-muted-foreground">
                    {circle.is_live ? "Join the conversation happening now!" : "Live chat activates during events"}
                  </p>
                </div>
                <div className="p-8 text-center min-h-[400px] flex items-center justify-center">
                  <div className="text-muted-foreground">
                    Real-time chat will appear here during live events
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="moments">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.filter(p => p.media_urls?.length > 0).slice(0, 6).map((post) => (
                  <div
                    key={post.id}
                    className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={post.media_urls[0]}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-sm text-foreground font-medium line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" /> {post.reaction_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" /> {post.comment_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {posts.filter(p => p.media_urls?.length > 0).length === 0 && (
                  <div className="col-span-full text-center py-12 bg-card rounded-2xl border border-border">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-bold mb-2 text-foreground">No Moments Yet</h3>
                    <p className="text-muted-foreground">
                      Highlight posts with media will appear here
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="members">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {members.map((member, idx) => (
                  <div
                    key={member.id}
                    className="bg-card backdrop-blur-sm rounded-2xl border border-border p-6 text-center hover:border-primary/50 transition-all duration-300 hover:shadow-glow group"
                  >
                    <div className="relative inline-block mb-4">
                      <Avatar className="w-20 h-20 ring-2 ring-primary/20 transition-all duration-300 group-hover:ring-primary/50">
                        <AvatarImage src={member.profiles?.avatar_url} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xl">
                          {member.profiles?.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {idx < 3 && (
                        <div className="absolute -top-1 -right-1 bg-accent rounded-full p-1">
                          <Crown className="w-3 h-3 text-accent-foreground" />
                        </div>
                      )}
                      <div className={cn(
                        "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card",
                        idx % 3 === 0 ? "bg-green-500" : "bg-muted"
                      )} />
                    </div>
                    <h4 className="font-bold text-sm mb-2 text-foreground">
                      {member.profiles?.full_name || "Anonymous"}
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      {member.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
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
