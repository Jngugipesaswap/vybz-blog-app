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
  Share2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreatePostDialog } from "@/components/community/CreatePostDialog";

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
      <div className="min-h-screen flex flex-col bg-[#0E0E0E]">
        <Navigation />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </main>
      </div>
    );
  }

  if (!circle) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0E0E0E]">
        <Navigation />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Circle not found</h2>
            <Button onClick={() => navigate("/community")}>
              Back to Community
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0E0E0E]">
      <Navigation />
      
      <main className="flex-1 pt-20 pb-12">
        {/* Hero Header */}
        <div className="relative h-[300px] overflow-hidden">
          {circle.cover_image ? (
            <img
              src={circle.cover_image}
              alt={circle.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary via-purple-500 to-pink-500" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0E] via-[#0E0E0E]/60 to-transparent" />
          
          <div className="absolute top-4 left-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/community")}
              className="bg-black/50 backdrop-blur-sm hover:bg-black/70"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          {circle.is_live && (
            <Badge className="absolute top-4 right-4 bg-red-500 animate-pulse text-lg px-4 py-2">
              <Radio className="w-4 h-4 mr-2" />
              LIVE NOW
            </Badge>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <div className="flex items-end justify-between">
                <div className="flex-1">
                  <h1 className="text-4xl font-black text-white mb-2">{circle.name}</h1>
                  <p className="text-white/80 mb-4 max-w-2xl">{circle.description}</p>
                  <div className="flex items-center gap-4 text-white/60 text-sm">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {circle.member_count || 0} members
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {circle.post_count || 0} posts
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-black/50 backdrop-blur-sm border-white/20"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleJoinLeave}
                    className={isMember ? "bg-white/20 backdrop-blur-sm" : "btn-gradient"}
                  >
                    {isMember ? (
                      <>Joined</>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
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
            <div className="flex items-center justify-between">
              <TabsList className="bg-card/50 backdrop-blur-sm">
                <TabsTrigger value="feed">Feed</TabsTrigger>
                <TabsTrigger value="chat">
                  Live Chat
                  {circle.is_live && (
                    <Badge className="ml-2 bg-red-500 text-xs px-1.5 py-0.5">
                      Live
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="moments">Moments</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
              </TabsList>
              
              {isMember && <CreatePostDialog />}
            </div>

            <TabsContent value="feed" className="space-y-4">
              {posts.length === 0 ? (
                <div className="text-center py-12 bg-card/30 rounded-xl border border-border/50">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-bold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to share something in this circle!
                  </p>
                  {isMember && <CreatePostDialog />}
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-6 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={post.profiles?.avatar_url} />
                          <AvatarFallback>
                            {post.profiles?.full_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">
                              {post.profiles?.full_name || "Anonymous"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                          {post.media_urls && post.media_urls.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 gap-2">
                              {post.media_urls.map((url: string, idx: number) => (
                                <img
                                  key={idx}
                                  src={url}
                                  alt=""
                                  className="rounded-lg object-cover w-full h-48"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="chat">
              <div className="bg-card/30 rounded-xl border border-border/50 p-8 text-center">
                <Radio className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold mb-2">Live Chat</h3>
                <p className="text-muted-foreground">
                  Real-time chat will be available here during live events
                </p>
              </div>
            </TabsContent>

            <TabsContent value="moments">
              <div className="bg-card/30 rounded-xl border border-border/50 p-8 text-center">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold mb-2">Moments</h3>
                <p className="text-muted-foreground">
                  Highlight reels and top posts will appear here
                </p>
              </div>
            </TabsContent>

            <TabsContent value="members">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-4 text-center hover:border-primary/50 transition-colors"
                  >
                    <Avatar className="w-16 h-16 mx-auto mb-3">
                      <AvatarImage src={member.profiles?.avatar_url} />
                      <AvatarFallback>
                        {member.profiles?.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <h4 className="font-semibold text-sm mb-1">
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
      </main>
      
      <Footer />
    </div>
  );
};

export default CircleDetail;
