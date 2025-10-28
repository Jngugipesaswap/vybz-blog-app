import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, CheckCircle, XCircle, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface FlaggedItem {
  id: string;
  content_type: string;
  content_id: string;
  reason: string;
  status: string;
  created_at: string;
  flagged_by: string;
  circle_id: string;
  content?: any;
  circle?: any;
  flagged_by_profile?: any;
}

export function CircleContentModeration() {
  const [flaggedContent, setFlaggedContent] = useState<FlaggedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<FlaggedItem | null>(null);
  const [notes, setNotes] = useState("");
  const [filter, setFilter] = useState<"pending" | "all">("pending");

  useEffect(() => {
    fetchFlaggedContent();
  }, [filter]);

  const fetchFlaggedContent = async () => {
    try {
      let query = supabase
        .from("flagged_content")
        .select(`
          *,
          circle:circles(name),
          flagged_by_profile:profiles!flagged_content_flagged_by_fkey(full_name)
        `)
        .order("created_at", { ascending: false });

      if (filter === "pending") {
        query = query.eq("status", "pending");
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch actual content for each flagged item
      const enrichedData = await Promise.all(
        (data || []).map(async (item) => {
          let content = null;
          if (item.content_type === "post") {
            const { data: post } = await supabase
              .from("circle_posts")
              .select("*, user:profiles!circle_posts_user_id_fkey(full_name)")
              .eq("id", item.content_id)
              .single();
            content = post;
          } else if (item.content_type === "comment") {
            const { data: comment } = await supabase
              .from("circle_post_comments")
              .select("*, user:profiles!circle_post_comments_user_id_fkey(full_name)")
              .eq("id", item.content_id)
              .single();
            content = comment;
          }
          return { ...item, content };
        })
      );

      setFlaggedContent(enrichedData);
    } catch (error) {
      console.error("Error fetching flagged content:", error);
      toast.error("Failed to load flagged content");
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (itemId: string, action: "approved" | "removed") => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("flagged_content")
        .update({
          status: action === "approved" ? "approved" : "removed",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          notes: notes || null,
        })
        .eq("id", itemId);

      if (error) throw error;

      // If removed, also update the content's moderation status
      if (action === "removed" && selectedItem) {
        const table = selectedItem.content_type === "post" 
          ? "circle_posts" 
          : "circle_post_comments";
        
        await supabase
          .from(table)
          .update({ moderation_status: "removed" })
          .eq("id", selectedItem.content_id);
      }

      toast.success(`Content ${action === "approved" ? "approved" : "removed"}`);
      setSelectedItem(null);
      setNotes("");
      fetchFlaggedContent();
    } catch (error) {
      console.error("Error moderating content:", error);
      toast.error("Failed to moderate content");
    }
  };

  const stats = {
    pending: flaggedContent.filter((i) => i.status === "pending").length,
    reviewed: flaggedContent.filter((i) => i.status !== "pending").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Content Moderation</h1>
        <p className="text-muted-foreground mt-1">
          Review and moderate flagged content across all circles
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass-effect border-destructive/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reviewed</p>
                <p className="text-2xl font-bold">{stats.reviewed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Moderation Queue */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="all">All Content</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4 mt-4">
          {flaggedContent.length === 0 ? (
            <Card className="glass-effect">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No flagged content to review</p>
              </CardContent>
            </Card>
          ) : (
            flaggedContent.map((item) => (
              <Card key={item.id} className="glass-effect">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">
                          {item.content_type === "post" ? "Post" : "Comment"} Flagged
                        </CardTitle>
                        <Badge
                          variant={
                            item.status === "pending"
                              ? "destructive"
                              : item.status === "approved"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Circle: {item.circle?.name} • Reason: {item.reason}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Flagged by {item.flagged_by_profile?.full_name} •{" "}
                        {new Date(item.created_at).toLocaleString()}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedItem(item)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  </div>
                </CardHeader>
                {item.content && (
                  <CardContent>
                    <div className="bg-muted/50 p-4 rounded-md">
                      <p className="text-sm line-clamp-3">
                        {item.content.content || "No content available"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Author: {item.content.user?.full_name}
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Flagged Content</DialogTitle>
            <DialogDescription>
              Decide whether to approve or remove this content
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Content:</p>
                <div className="bg-muted p-4 rounded-md mt-2">
                  <p>{selectedItem.content?.content || "No content available"}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium">Reason for Flag:</p>
                <p className="text-sm text-muted-foreground mt-1">{selectedItem.reason}</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Moderation Notes:</p>
                <Textarea
                  placeholder="Add notes about your decision..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => handleModerate(selectedItem.id, "approved")}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Content
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleModerate(selectedItem.id, "removed")}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Remove Content
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
