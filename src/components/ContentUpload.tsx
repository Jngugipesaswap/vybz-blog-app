import { useState } from "react";
import { Upload, X, Image, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ContentUploadProps {
  referenceType: 'event' | 'venue' | 'post';
  referenceId: string;
  onUploadComplete?: () => void;
}

export const ContentUpload = ({ referenceType, referenceId, onUploadComplete }: ContentUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [contentType, setContentType] = useState<'photo' | 'video'>('photo');
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const isVideo = selectedFile.type.startsWith('video/');
    const isImage = selectedFile.type.startsWith('image/');

    if (contentType === 'video' && !isVideo) {
      toast({
        title: "Invalid file type",
        description: "Please select a video file (MP4, MOV, AVI)",
        variant: "destructive"
      });
      return;
    }

    if (contentType === 'photo' && !isImage) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, WEBP, GIF)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size
    const maxSize = contentType === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB for video, 10MB for photos
    if (selectedFile.size > maxSize) {
      toast({
        title: "File too large",
        description: `File must be smaller than ${contentType === 'video' ? '50MB' : '10MB'}`,
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleUpload = async () => {
    if (!user || !file || !title.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a title and select a file",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const bucket = contentType === 'video' ? 'user-videos' : 'user-photos';
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase
        .from('user_content')
        .insert({
          user_id: user.id,
          content_type: contentType,
          content_url: publicUrl,
          title: title.trim(),
          description: description.trim() || null,
          content_reference_type: referenceType,
          content_reference_id: referenceId,
          status: 'pending'
        });

      if (dbError) throw dbError;

      toast({
        title: "Upload successful!",
        description: "Your content has been submitted for review"
      });

      // Reset form
      setFile(null);
      setPreview(null);
      setTitle("");
      setDescription("");
      setOpen(false);
      onUploadComplete?.();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload content",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="w-4 h-4" />
          Share Your Content
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Content</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Content Type</label>
            <Select value={contentType} onValueChange={(value: 'photo' | 'video') => {
              setContentType(value);
              setFile(null);
              setPreview(null);
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="photo">
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Photo
                  </div>
                </SelectItem>
                <SelectItem value="video">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Video
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <Input
              placeholder="Give your content a title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Add a description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {contentType === 'video' ? 'Video File (max 50MB)' : 'Photo File (max 10MB)'}
            </label>
            {preview ? (
              <div className="relative">
                {contentType === 'photo' ? (
                  <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                ) : (
                  <video src={preview} controls className="w-full h-48 rounded-lg" />
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Input
                  type="file"
                  accept={contentType === 'video' ? 'video/*' : 'image/*'}
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to select a {contentType}
                  </p>
                </label>
              </div>
            )}
          </div>

          <Button
            onClick={handleUpload}
            disabled={uploading || !file || !title.trim()}
            className="w-full"
          >
            {uploading ? "Uploading..." : "Upload Content"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Your content will be reviewed before appearing publicly
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
