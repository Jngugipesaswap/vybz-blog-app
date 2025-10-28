import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, MessageSquare, Flag, Activity, Settings, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CircleDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  circleId: string | null;
}

export function CircleDetailDialog({ open, onOpenChange, circleId }: CircleDetailDialogProps) {
  const [circle, setCircle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [flaggedContent, setFlaggedContent] = useState<any[]>([]);

  useEffect(() => {
    if (circleId && open) {
      fetchCircleDetails();
    }
  }, [circleId, open]);

  const fetchCircleDetails = async () => {
    if (!circleId) return;

    try {
      setLoading(true);

      // Fetch circle details
      const { data: circleData, error: circleError } = await supabase
        .from("circles")
        .select("*")
        .eq("id", circleId)
        .single();

      if (circleError) throw circleError;
      setCircle(circleData);

      // Fetch members
      const { data: membersData } = await supabase
        .from("circle_members")
        .select("*, profiles(full_name, avatar_url)")
        .eq("circle_id", circleId)
        .order("joined_at", { ascending: false })
        .limit(10);

      setMembers(membersData || []);

      // Fetch recent posts
      const { data: postsData } = await supabase
        .from("circle_posts")
        .select("*, profiles(full_name)")
        .eq("circle_id", circleId)
        .order("created_at", { ascending: false })
        .limit(10);

      setPosts(postsData || []);

      // Fetch flagged content
      const { data: flaggedData } = await supabase
        .from("flagged_content")
        .select("*")
        .eq("circle_id", circleId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      setFlaggedContent(flaggedData || []);
    } catch (error: any) {
      console.error("Error fetching circle details:", error);
      toast.error("Failed to load circle details");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLiveMode = async () => {
    if (!circle) return;

    try {
      const { error } = await supabase
        .from("circles")
        .update({ is_live_mode: !circle.is_live_mode })
        .eq("id", circleId);

      if (error) throw error;

      toast.success(`Live mode ${!circle.is_live_mode ? "enabled" : "disabled"}`);
      fetchCircleDetails();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (!circle) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle>{circle.name}</DialogTitle>
              {circle.is_live_mode && (
                <Badge variant="destructive" className="animate-pulse">
                  LIVE
                </Badge>
              )}
              <Badge variant="outline">{circle.privacy_level}</Badge>
            </div>
            <Button onClick={handleToggleLiveMode} variant="outline" size="sm">
              {circle.is_live_mode ? "End Live" : "Go Live"}
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <Activity className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="members">
              <Users className="h-4 w-4 mr-2" />
              Members
            </TabsTrigger>
            <TabsTrigger value="posts">
              <MessageSquare className="h-4 w-4 mr-2" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="moderation">
              <Flag className="h-4 w-4 mr-2" />
              Moderation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{circle.member_count}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{circle.post_count}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Flagged</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{circle.flagged_count}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={circle.status === 'active' ? 'default' : 'secondary'}>
                    {circle.status}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{circle.description || "No description"}</p>
              </CardContent>
            </Card>

            {circle.rules && (
              <Card>
                <CardHeader>
                  <CardTitle>Community Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{circle.rules}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {member.profiles?.avatar_url ? (
                        <img src={member.profiles.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <Users className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{member.profiles?.full_name || "Unknown User"}</p>
                      <p className="text-sm text-muted-foreground">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{member.role}</Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="posts" className="space-y-4">
            <div className="space-y-2">
              {posts.map((post) => (
                <div key={post.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{post.profiles?.full_name || "Unknown User"}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm">{post.content}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{post.reaction_count} reactions</span>
                    <span>{post.comment_count} comments</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-4">
            <div className="space-y-2">
              {flaggedContent.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No pending flags</p>
              ) : (
                flaggedContent.map((flag) => (
                  <div key={flag.id} className="p-3 border border-destructive/50 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="destructive">{flag.reason}</Badge>
                      <p className="text-sm text-muted-foreground">
                        {new Date(flag.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm">{flag.content_type} flagged</p>
                    {flag.notes && <p className="text-sm text-muted-foreground">{flag.notes}</p>}
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
