import { useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
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
import { Plus, Type, Image as ImageIcon, BarChart3, Loader2, Upload, X } from "lucide-react";
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
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length + mediaFiles.length > 4) {
      toast.error("Maximum 4 images allowed");
      return;
    }
    
    setMediaFiles(prev => [...prev, ...imageFiles]);
    
    // Create preview URLs
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaUrls(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  const uploadMedia = async () => {
    if (mediaFiles.length === 0) return [];

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of mediaFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user?.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('user-photos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('user-photos')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      return uploadedUrls;
    } catch (error: any) {
      toast.error("Failed to upload media");
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user) {
      toast.error("Please sign in to create a post");
      navigate("/auth");
      return;
    }

    if (!content.trim() && mediaFiles.length === 0) {
      toast.error("Please add content or media");
      return;
    }

    if (!circleId) {
      toast.error("Circle ID is required");
      return;
    }

    setLoading(true);
    try {
      // Upload media files if any
      const uploadedUrls = await uploadMedia();

      const { error } = await supabase
        .from("circle_posts" as any)
        .insert({
          circle_id: circleId,
          user_id: user.id,
          content: content.trim(),
          media_urls: uploadedUrls.length > 0 ? uploadedUrls : null,
          media_type: uploadedUrls.length > 0 ? 'image' : null,
        });

      if (error) throw error;

      toast.success("Post created successfully!", {
        description: "Your post is now live in the circle",
      });
      setContent("");
      setMediaFiles([]);
      setMediaUrls([]);
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
              disabled={loading || uploading || (!content.trim() && mediaFiles.length === 0)}
              size="lg"
              className="w-full btn-gradient shadow-glow text-base font-semibold"
            >
              {loading || uploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {uploading ? "Uploading..." : "Posting..."}
                </>
              ) : (
                "Post to Circle"
              )}
            </Button>
          </TabsContent>

          <TabsContent value="media" className="flex-1 flex flex-col space-y-4 mt-6">
            <div className="flex-1 space-y-4">
              <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={mediaFiles.length >= 4}
                />
                <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-base text-foreground mb-2 font-medium">
                  {mediaFiles.length >= 4 ? "Maximum 4 images reached" : "Click to upload or drag and drop"}
                </p>
                <p className="text-sm text-muted-foreground">
                  PNG, JPG up to 10MB ({mediaFiles.length}/4)
                </p>
              </div>

              {/* Image Previews */}
              {mediaUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {mediaUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeMedia(index)}
                        type="button"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="space-y-2">
                <Label className="text-base font-semibold">Caption (Optional)</Label>
                <Textarea
                  placeholder="Add a caption..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  className="resize-none text-base"
                />
              </div>
            </div>
            
            <Button 
              onClick={handleCreatePost} 
              disabled={loading || uploading || mediaFiles.length === 0}
              size="lg"
              className="w-full btn-gradient shadow-glow text-base font-semibold"
            >
              {loading || uploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {uploading ? "Uploading..." : "Posting..."}
                </>
              ) : (
                "Post Media"
              )}
            </Button>
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
