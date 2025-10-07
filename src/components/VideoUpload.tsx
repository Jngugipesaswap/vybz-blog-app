import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Link as LinkIcon } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface VideoUploadProps {
  onVideoSelect: (url: string) => void;
  currentVideo?: string;
}

const VideoUpload = ({ onVideoSelect, currentVideo }: VideoUploadProps) => {
  const [videoUrl, setVideoUrl] = useState("");
  const { toast } = useToast();

  const handleUrlSubmit = () => {
    if (videoUrl.trim()) {
      onVideoSelect(videoUrl);
      toast({
        title: "Video background updated",
        description: "Your hero section now has a custom video background",
      });
      setVideoUrl("");
    }
  };

  const handleRemoveVideo = () => {
    onVideoSelect("");
    toast({
      title: "Video removed",
      description: "Hero section returned to image background",
    });
  };

  return (
    <Card className="w-80 shadow-hover">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Video URL</label>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleUrlSubmit} size="icon">
                <LinkIcon className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Paste a direct video URL (MP4, WebM)
            </p>
          </div>

          {currentVideo && (
            <div>
              <p className="text-sm font-medium mb-2">Current Video</p>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <p className="text-xs truncate flex-1">{currentVideo}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveVideo}
                  className="ml-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoUpload;