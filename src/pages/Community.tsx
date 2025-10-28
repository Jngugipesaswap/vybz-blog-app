import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Plus, TrendingUp, Clock, MapPin, Music } from "lucide-react";
import { toast } from "sonner";
import { CircleCard } from "@/components/community/CircleCard";
import { CreatePostDialog } from "@/components/community/CreatePostDialog";

const Community = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [circles, setCircles] = useState<any[]>([]);
  const [featuredCircles, setFeaturedCircles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("trending");
  const [activeTab, setActiveTab] = useState("for-you");

  useEffect(() => {
    fetchCircles();
    fetchFeaturedCircles();
  }, [filterType, searchQuery]);

  const fetchCircles = async () => {
    try {
      let query = supabase
        .from("circles" as any)
        .select("*, circle_members(count)")
        .eq("status", "active");

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (filterType === "trending") {
        query = query.order("member_count", { ascending: false });
      } else if (filterType === "new") {
        query = query.order("created_at", { ascending: false });
      } else if (filterType === "live") {
        query = query.eq("is_live", true);
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;
      setCircles(data || []);
    } catch (error: any) {
      toast.error("Failed to load circles");
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedCircles = async () => {
    try {
      const { data, error } = await supabase
        .from("circles" as any)
        .select("*")
        .eq("status", "active")
        .order("member_count", { ascending: false })
        .limit(5);

      if (error) throw error;
      setFeaturedCircles(data || []);
    } catch (error: any) {
      console.error("Failed to load featured circles");
    }
  };

  const joinCircle = async (circleId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      const { error } = await supabase
        .from("circle_members" as any)
        .insert({ circle_id: circleId, user_id: user.id });

      if (error) throw error;
      toast.success("Joined circle!");
      navigate(`/community/circle/${circleId}`);
    } catch (error: any) {
      toast.error("Failed to join circle");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1 pt-20 pb-12">
        {/* Search & Filter Bar */}
        <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Find circles, topics, or people..."
                  className="pl-10 bg-muted/50 border-border/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterType === "trending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("trending")}
                  className="gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  Trending
                </Button>
                <Button
                  variant={filterType === "new" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("new")}
                  className="gap-2"
                >
                  <Clock className="w-4 h-4" />
                  New
                </Button>
                <Button
                  variant={filterType === "live" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("live")}
                  className="gap-2"
                >
                  🔴 Live
                </Button>
              </div>
              {user && <CreatePostDialog />}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-8">
          {/* Featured Circles Carousel */}
          {featuredCircles.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-gradient">Featured Circles</span>
                <Badge variant="secondary" className="animate-pulse">Hot</Badge>
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                {featuredCircles.map((circle) => (
                  <div
                    key={circle.id}
                    className="min-w-[320px] snap-start relative rounded-2xl overflow-hidden group cursor-pointer hover-lift"
                    onClick={() => navigate(`/community/circle/${circle.id}`)}
                  >
                    <div className="h-[200px] relative">
                      {circle.cover_image ? (
                        <img
                          src={circle.cover_image}
                          alt={circle.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/30 to-accent/20" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      {circle.is_live && (
                        <Badge className="absolute top-3 right-3 bg-red-500 animate-pulse">
                          🔴 LIVE
                        </Badge>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-xl font-bold text-primary-foreground mb-2">{circle.name}</h3>
                      <p className="text-sm text-primary-foreground/80 mb-3 line-clamp-2">{circle.description}</p>
                      <Button
                        size="sm"
                        className="w-full btn-gradient"
                        onClick={(e) => {
                          e.stopPropagation();
                          joinCircle(circle.id);
                        }}
                      >
                        Join Circle
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Feed Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="for-you">For You</TabsTrigger>
              <TabsTrigger value="explore">Explore</TabsTrigger>
            </TabsList>

            <TabsContent value="for-you" className="space-y-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-[400px] rounded-xl bg-muted/50 animate-pulse" />
                  ))}
                </div>
              ) : circles.length === 0 ? (
                <div className="text-center py-12">
                  <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-bold mb-2 text-foreground">No circles found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? "Try a different search" : "Be the first to create one!"}
                  </p>
                  {user && !searchQuery && (
                    <Button onClick={() => navigate("/community/create")}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Circle
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {circles.map((circle) => (
                    <CircleCard
                      key={circle.id}
                      circle={circle}
                      onJoin={() => joinCircle(circle.id)}
                      onClick={() => navigate(`/community/circle/${circle.id}`)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="explore" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {circles.map((circle) => (
                  <CircleCard
                    key={circle.id}
                    circle={circle}
                    onJoin={() => joinCircle(circle.id)}
                    onClick={() => navigate(`/community/circle/${circle.id}`)}
                  />
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

export default Community;
