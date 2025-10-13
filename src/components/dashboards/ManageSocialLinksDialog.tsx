import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Share2, Loader2, Plus, X } from "lucide-react";
import { z } from "zod";

interface SocialLink {
  id?: string;
  platform: string;
  username: string;
  url: string;
}

const urlSchema = z.string().url("Please enter a valid URL");
const usernameSchema = z.string().min(1, "Username is required").max(50, "Username too long");

const ManageSocialLinksDialog = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const { toast } = useToast();

  const platforms = [
    { value: "instagram", label: "Instagram", placeholder: "yourhandle" },
    { value: "twitter", label: "X (Twitter)", placeholder: "yourhandle" },
    { value: "snapchat", label: "Snapchat", placeholder: "yourhandle" },
    { value: "youtube", label: "YouTube", placeholder: "@yourchannel" },
    { value: "tiktok", label: "TikTok", placeholder: "@yourhandle" },
    { value: "facebook", label: "Facebook", placeholder: "yourprofile" },
  ];

  useEffect(() => {
    if (open) {
      loadSocialLinks();
    }
  }, [open]);

  const loadSocialLinks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("social_links")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      setSocialLinks(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load social links",
        variant: "destructive",
      });
    }
  };

  const handleAddLink = (platform: string) => {
    if (socialLinks.some(link => link.platform === platform)) {
      toast({
        title: "Already Added",
        description: `You already have a ${platform} link`,
        variant: "destructive",
      });
      return;
    }

    setSocialLinks([...socialLinks, { platform, username: "", url: "" }]);
  };

  const handleRemoveLink = async (platform: string, id?: string) => {
    if (id) {
      try {
        const { error } = await supabase
          .from("social_links")
          .delete()
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Removed",
          description: "Social link removed successfully",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to remove social link",
          variant: "destructive",
        });
      }
    }

    setSocialLinks(socialLinks.filter(link => link.platform !== platform));
  };

  const handleUpdateLink = (platform: string, field: "username" | "url", value: string) => {
    setSocialLinks(socialLinks.map(link => 
      link.platform === platform ? { ...link, [field]: value } : link
    ));
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Validate all links
      for (const link of socialLinks) {
        if (link.username || link.url) {
          usernameSchema.parse(link.username);
          urlSchema.parse(link.url);
        }
      }

      // Filter out empty links
      const validLinks = socialLinks.filter(link => link.username && link.url);

      // Upsert all links
      for (const link of validLinks) {
        const { error } = await supabase
          .from("social_links")
          .upsert({
            id: link.id,
            user_id: user.id,
            platform: link.platform,
            username: link.username,
            url: link.url,
          }, {
            onConflict: "user_id,platform"
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Social links updated successfully",
      });

      setOpen(false);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to save social links",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          Manage Social Links
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Your Social Media Links</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {socialLinks.map((link) => {
            const platformInfo = platforms.find(p => p.value === link.platform);
            return (
              <div key={link.platform} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{platformInfo?.label}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveLink(link.platform, link.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    placeholder={platformInfo?.placeholder}
                    value={link.username}
                    onChange={(e) => handleUpdateLink(link.platform, "username", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Profile URL</Label>
                  <Input
                    placeholder="https://..."
                    value={link.url}
                    onChange={(e) => handleUpdateLink(link.platform, "url", e.target.value)}
                  />
                </div>
              </div>
            );
          })}

          {socialLinks.length < platforms.length && (
            <div className="border-2 border-dashed rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-3">Add a platform:</p>
              <div className="flex flex-wrap gap-2">
                {platforms
                  .filter(p => !socialLinks.some(link => link.platform === p.value))
                  .map((platform) => (
                    <Button
                      key={platform.value}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddLink(platform.value)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      {platform.label}
                    </Button>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageSocialLinksDialog;
