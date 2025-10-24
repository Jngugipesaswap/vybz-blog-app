import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Type, Image as ImageIcon, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const CreatePostDialog = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreatePost = async () => {
    if (!user) {
      toast.error("Please sign in to create a post");
      return;
    }

    if (!content.trim()) {
      toast.error("Please enter some content");
      return;
    }

    setLoading(true);
    try {
      // This is a placeholder - you'll need to implement actual post creation
      // based on which circle the user is in or wants to post to
      toast.success("Post created! (Implementation pending)");
      setContent("");
      setOpen(false);
    } catch (error: any) {
      toast.error("Failed to create post");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-gradient gap-2">
          <Plus className="w-4 h-4" />
          New Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text" className="gap-2">
              <Type className="w-4 h-4" />
              Text
            </TabsTrigger>
            <TabsTrigger value="media" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              Media
            </TabsTrigger>
            <TabsTrigger value="poll" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Poll
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Label>What's on your mind?</Label>
              <Textarea
                placeholder="Share your thoughts with the community..."
                className="min-h-[150px] resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use @mentions and #hashtags to connect
              </p>
            </div>
            <Button 
              onClick={handleCreatePost} 
              disabled={loading || !content.trim()}
              className="w-full btn-gradient"
            >
              {loading ? "Posting..." : "Post"}
            </Button>
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop media files or click to browse
              </p>
              <Button variant="outline">Choose Files</Button>
              <p className="text-xs text-muted-foreground mt-2">
                Supports images, videos (60s max), and audio clips
              </p>
            </div>
          </TabsContent>

          <TabsContent value="poll" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Poll Question</Label>
                <Input placeholder="What's your question?" />
              </div>
              <div className="space-y-2">
                <Label>Options</Label>
                <Input placeholder="Option 1" />
                <Input placeholder="Option 2" />
                <Button variant="outline" size="sm" className="w-full">
                  + Add Option
                </Button>
              </div>
              <Button className="w-full btn-gradient">Create Poll</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
