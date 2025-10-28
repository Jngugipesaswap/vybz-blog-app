import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Radio, Zap, MapPin, Calendar, Activity } from "lucide-react";
import { toast } from "sonner";

interface Circle {
  id: string;
  name: string;
  description: string;
  is_live_mode: boolean;
  event_id: string | null;
  member_count: number;
}

export function CircleLiveEvents() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCircles();
  }, []);

  const fetchCircles = async () => {
    try {
      const { data, error } = await supabase
        .from("circles")
        .select("*")
        .order("is_live_mode", { ascending: false });

      if (error) throw error;
      setCircles(data || []);
    } catch (error) {
      console.error("Error fetching circles:", error);
      toast.error("Failed to load circles");
    } finally {
      setLoading(false);
    }
  };

  const toggleLiveMode = async (circleId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from("circles")
        .update({ is_live_mode: !currentState })
        .eq("id", circleId);

      if (error) throw error;

      toast.success(!currentState ? "Live mode activated" : "Live mode deactivated");
      fetchCircles();

      // If activating live mode, could trigger automation
      if (!currentState) {
        // Send notification to all members
        const { data: members } = await supabase
          .from("circle_members")
          .select("user_id")
          .eq("circle_id", circleId);

        if (members) {
          const notifications = members.map((member) => ({
            user_id: member.user_id,
            type: "event_live",
            title: "Event is Live!",
            message: "Join the live circle now to share the moment",
            action_url: `/community/circle/${circleId}`,
          }));

          await supabase.from("notifications").insert(notifications);
        }
      }
    } catch (error) {
      console.error("Error toggling live mode:", error);
      toast.error("Failed to toggle live mode");
    }
  };

  const liveCircles = circles.filter((c) => c.is_live_mode);
  const upcomingCircles = circles.filter((c) => !c.is_live_mode && c.event_id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Live Event Integration</h1>
        <p className="text-muted-foreground mt-1">
          Manage live circles and event connections
        </p>
      </div>

      {/* Live Now Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Radio className="h-5 w-5 text-destructive animate-pulse" />
          <h2 className="text-xl font-semibold">Live Now ({liveCircles.length})</h2>
        </div>

        {liveCircles.length === 0 ? (
          <Card className="glass-effect">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No circles are currently live</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {liveCircles.map((circle) => (
              <Card key={circle.id} className="glass-effect border-destructive/40 bg-destructive/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle>{circle.name}</CardTitle>
                        <Badge variant="destructive" className="animate-pulse">
                          <Radio className="h-3 w-3 mr-1" />
                          LIVE
                        </Badge>
                      </div>
                      <CardDescription className="mt-1">{circle.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Active Members</p>
                        <p className="text-2xl font-bold">{circle.member_count}</p>
                      </div>
                      <Switch
                        checked={circle.is_live_mode}
                        onCheckedChange={() => toggleLiveMode(circle.id, circle.is_live_mode)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      View Location
                    </Button>
                    <Button variant="outline" size="sm">
                      <Zap className="h-4 w-4 mr-2" />
                      Boost Visibility
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Events Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Event-Linked Circles ({upcomingCircles.length})</h2>
        </div>

        {upcomingCircles.length === 0 ? (
          <Card className="glass-effect">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No upcoming event circles</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {upcomingCircles.map((circle) => (
              <Card key={circle.id} className="glass-effect">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle>{circle.name}</CardTitle>
                        <Badge variant="outline">Event Linked</Badge>
                      </div>
                      <CardDescription className="mt-1">{circle.description}</CardDescription>
                      {circle.event_id && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Event ID: {circle.event_id}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Members</p>
                        <p className="text-xl font-bold">{circle.member_count}</p>
                      </div>
                      <Button
                        onClick={() => toggleLiveMode(circle.id, circle.is_live_mode)}
                      >
                        <Radio className="h-4 w-4 mr-2" />
                        Go Live
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Features Info */}
      <Card className="glass-effect border-primary/20">
        <CardHeader>
          <CardTitle>Live Mode Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Real-time Chat</p>
              <p className="text-sm text-muted-foreground">
                Enable instant messaging and live content posting
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Location Tagging</p>
              <p className="text-sm text-muted-foreground">
                Posts can be tagged with venue location during live events
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Activity className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Auto-Generated Recaps</p>
              <p className="text-sm text-muted-foreground">
                System creates highlight reels from top posts and reactions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
