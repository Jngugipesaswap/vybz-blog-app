import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus } from "lucide-react";
import { toast } from "sonner";

const Community = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [circles, setCircles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCircles();
  }, []);

  const fetchCircles = async () => {
    try {
      const { data, error } = await supabase
        .from("circles" as any)
        .select("*, circle_members(count)")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCircles(data || []);
    } catch (error: any) {
      toast.error("Failed to load circles");
    } finally {
      setLoading(false);
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
      navigate(`/community/${circleId}`);
    } catch (error: any) {
      toast.error("Failed to join circle");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-black mb-2">Community Circles</h1>
              <p className="text-muted-foreground">
                Join circles to connect with fans and artists
              </p>
            </div>
            {user && (
              <Button onClick={() => navigate("/community/create")}>
                <Plus className="w-4 h-4 mr-2" />
                Create Circle
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {circles.map((circle) => (
              <Card key={circle.id} className="hover-lift cursor-pointer">
                <CardHeader className="p-0">
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-lg relative overflow-hidden">
                    {circle.cover_image && (
                      <img
                        src={circle.cover_image}
                        alt={circle.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {circle.is_live && (
                      <Badge className="absolute top-3 right-3 bg-destructive">
                        🔴 LIVE
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">{circle.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {circle.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-1" />
                      {circle.member_count} members
                    </div>
                    <Button
                      size="sm"
                      onClick={() => joinCircle(circle.id)}
                    >
                      Join Circle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Community;
