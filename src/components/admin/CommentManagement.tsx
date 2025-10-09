import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  status: string;
  created_at: string;
}

export function CommentManagement() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchComments();
    fetchProfiles();
  }, []);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch comments");
      return;
    }

    setComments(data || []);
  };

  const fetchProfiles = async () => {
    const { data } = await supabase.from("profiles").select("user_id, full_name");
    const profilesMap: Record<string, string> = {};
    data?.forEach((profile) => {
      profilesMap[profile.user_id] = profile.full_name || "Unknown User";
    });
    setProfiles(profilesMap);
  };

  const updateCommentStatus = async (commentId: string, status: string) => {
    const { error } = await supabase
      .from("comments")
      .update({ status })
      .eq("id", commentId);

    if (error) {
      toast.error("Failed to update comment status");
      return;
    }

    toast.success(`Comment ${status}`);
    fetchComments();
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      toast.error("Failed to delete comment");
      return;
    }

    toast.success("Comment deleted");
    fetchComments();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comment Moderation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comments.map((comment) => (
              <TableRow key={comment.id}>
                <TableCell className="font-medium">
                  {profiles[comment.user_id] || "Loading..."}
                </TableCell>
                <TableCell className="max-w-md truncate">{comment.content}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      comment.status === "approved"
                        ? "default"
                        : comment.status === "spam"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {comment.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(comment.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {comment.status !== "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCommentStatus(comment.id, "approved")}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    {comment.status !== "spam" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCommentStatus(comment.id, "spam")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteComment(comment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
