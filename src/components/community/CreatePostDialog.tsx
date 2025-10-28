import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Type, Image as ImageIcon, BarChart3, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface CreatePostDialogProps {
  circleId?: string;
  onPostCreated?: () => void;
  children?: ReactNode;
}

export const CreatePostDialog = ({ circleId, onPostCreated, children }: CreatePostDialogProps) => {
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

    if (!circleId) {
      toast.error("Circle ID is required");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("circle_posts" as any)
        .insert({
          circle_id: circleId,
          user_id: user.id,
          content: content.trim(),
        });

      if (error) throw error;

      toast.success("Post created successfully!", {
        description: "Your post is now live in the circle",
      });
      setContent("");
      setOpen(false);
      
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error: any) {
      toast.error("Failed to create post");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button className="btn-gradient gap-2">
            <Plus className="w-4 h-4" />
            New Post
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold">Create Post</SheetTitle>
        </SheetHeader>
        
        <Tabs defaultValue="text" className="w-full h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 bg-muted">
            <TabsTrigger value="text" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Type className="w-4 h-4" />
              Text
            </TabsTrigger>
            <TabsTrigger value="media" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ImageIcon className="w-4 h-4" />
              Media
            </TabsTrigger>
            <TabsTrigger value="poll" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="w-4 h-4" />
              Poll
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="flex-1 flex flex-col space-y-4 mt-6">
            <div className="flex-1 space-y-2">
              <Label className="text-base font-semibold">What's on your mind?</Label>
              <Textarea
                placeholder="Share your thoughts with the community... 💭"
                className="min-h-[200px] resize-none text-base"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Use @mentions and #hashtags to connect • Max 500 characters
              </p>
            </div>
            <Button 
              onClick={handleCreatePost} 
              disabled={loading || !content.trim()}
              size="lg"
              className="w-full btn-gradient shadow-glow text-base font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post to Circle"
              )}
            </Button>
          </TabsContent>

          <TabsContent value="media" className="flex-1 flex flex-col space-y-4 mt-6">
            <div className="flex-1 border-2 border-dashed border-border rounded-2xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-base text-foreground mb-2 font-medium">
                Drag and drop media files
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse
              </p>
              <Button variant="outline" size="lg">Choose Files</Button>
              <p className="text-xs text-muted-foreground mt-4">
                Supports images, videos (60s max), and audio clips
              </p>
            </div>
          </TabsContent>

          <TabsContent value="poll" className="flex-1 flex flex-col space-y-4 mt-6">
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Poll Question</Label>
                <Input 
                  placeholder="What's your question?" 
                  className="text-base"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-base font-semibold">Options</Label>
                <Input placeholder="Option 1" className="text-base" />
                <Input placeholder="Option 2" className="text-base" />
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </div>
            <Button size="lg" className="w-full btn-gradient shadow-glow text-base font-semibold">
              Create Poll
            </Button>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
