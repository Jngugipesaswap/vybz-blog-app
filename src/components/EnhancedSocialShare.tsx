import { Link2, QrCode, Zap, Settings2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useShareTracking } from "@/hooks/useShareTracking";
import { useAuth } from "@/hooks/useAuth";
import { buildUTMUrl, getPlatformSource } from "@/lib/utm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface EnhancedSocialShareProps {
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  contentType?: 'event' | 'venue' | 'post';
  contentId?: string;
  campaign?: string;
}

const EnhancedSocialShare = ({ 
  title, 
  description = "", 
  url, 
  imageUrl, 
  contentType, 
  contentId,
  campaign = "organic_share"
}: EnhancedSocialShareProps) => {
  const { user } = useAuth();
  const { createShareLink, trackEvent } = useShareTracking();
  const { toast } = useToast();
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [crossPostDialogOpen, setCrossPostDialogOpen] = useState(false);
  const [utmDialogOpen, setUtmDialogOpen] = useState(false);
  const [customCampaign, setCustomCampaign] = useState(campaign);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  
  const baseUrl = url || window.location.href;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const trackingCode = urlParams.get('ref');
    if (trackingCode) {
      trackEvent(trackingCode, 'view');
    }
  }, []);

  const buildTrackedUrl = async (platform: string): Promise<string> => {
    let trackedUrl = baseUrl;

    // Add tracking code if user is logged in
    if (user && contentType && contentId) {
      const trackingCode = await createShareLink({
        contentType,
        contentId,
        sharePlatform: platform,
        userId: user.id
      });

      if (trackingCode) {
        trackedUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}ref=${trackingCode}`;
      }
    }

    // Add UTM parameters
    const utmUrl = buildUTMUrl(trackedUrl, {
      source: getPlatformSource(platform),
      medium: 'social',
      campaign: customCampaign,
      content: contentId || undefined
    });

    return utmUrl;
  };

  const handleShare = async (platform: string, platformUrl: string) => {
    const trackedUrl = await buildTrackedUrl(platform);
    const encodedUrl = encodeURIComponent(trackedUrl);
    const encodedTitle = encodeURIComponent(title);
    const shareText = encodeURIComponent(`${title}${description ? ' - ' + description : ''}`);
    
    let finalUrl = platformUrl;
    
    // Build platform-specific URLs
    if (platform === 'whatsapp') {
      finalUrl = `${platformUrl}${shareText}%20${encodedUrl}`;
    } else if (platform === 'twitter') {
      finalUrl = `${platformUrl}${encodedUrl}&text=${encodedTitle}`;
    } else if (platform === 'linkedin') {
      finalUrl = `${platformUrl}${encodedUrl}`;
    } else {
      finalUrl = `${platformUrl}${encodedUrl}`;
    }
    
    window.open(finalUrl, "_blank", "width=600,height=400");
    
    toast({
      title: "Shared!",
      description: `Shared to ${platform} with UTM tracking`,
    });
  };

  const handleCrossPost = async () => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: "No platforms selected",
        description: "Please select at least one platform",
        variant: "destructive"
      });
      return;
    }

    const promises = selectedPlatforms.map(async (platformKey) => {
      const platform = platforms.find(p => p.platform === platformKey);
      if (platform) {
        await handleShare(platform.platform, platform.url);
      }
    });

    await Promise.all(promises);
    
    toast({
      title: "Cross-posted!",
      description: `Shared to ${selectedPlatforms.length} platforms with UTM tracking`,
    });
    
    setSelectedPlatforms([]);
    setCrossPostDialogOpen(false);
  };

  const platforms = [
    {
      name: "WhatsApp",
      icon: "💬",
      url: `https://wa.me/?text=`,
      platform: "whatsapp"
    },
    {
      name: "X (Twitter)",
      icon: "𝕏",
      url: `https://twitter.com/intent/tweet?url=`,
      platform: "twitter"
    },
    {
      name: "LinkedIn",
      icon: "💼",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=`,
      platform: "linkedin"
    },
    {
      name: "Facebook",
      icon: "📘",
      url: `https://www.facebook.com/sharer/sharer.php?u=`,
      platform: "facebook"
    },
    {
      name: "Instagram",
      icon: "📷",
      url: `https://www.instagram.com/`,
      platform: "instagram"
    },
  ];

  const handleCopyLink = async () => {
    const trackedUrl = await buildTrackedUrl('copy_link');
    navigator.clipboard.writeText(trackedUrl);
    toast({
      title: "Link Copied!",
      description: "The tracked link has been copied with UTM parameters.",
    });
  };

  const handleDownloadQR = async () => {
    const trackedUrl = await buildTrackedUrl('qr_code');
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `${title.replace(/\s+/g, "-")}-qr-code.png`;
      downloadLink.href = pngFile;
      downloadLink.click();

      toast({
        title: "QR Code Downloaded!",
        description: "The QR code has been saved with tracking enabled.",
      });
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="space-y-4">
      {/* Main Share Buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        {platforms.map((platformData) => (
          <button
            key={platformData.name}
            onClick={(e) => {
              e.stopPropagation();
              handleShare(platformData.platform, platformData.url);
            }}
            className="text-2xl text-foreground hover:scale-125 transition-transform duration-200"
            aria-label={`Share on ${platformData.name}`}
            title={`Share on ${platformData.name}`}
          >
            {platformData.icon}
          </button>
        ))}
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCopyLink();
          }}
          className="text-foreground hover:scale-125 transition-transform duration-200"
          aria-label="Copy Link"
          title="Copy Link with UTM"
        >
          <Link2 className="w-6 h-6" />
        </button>

        <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
          <DialogTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="text-foreground hover:scale-125 transition-transform duration-200"
              aria-label="Generate QR Code"
              title="Generate QR Code"
            >
              <QrCode className="w-6 h-6" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>QR Code - {title}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={baseUrl}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Scan this QR code to access: {title}
              </p>
              <Button onClick={handleDownloadQR} className="w-full">
                Download QR Code
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      {/* Advanced Options */}
      <div className="flex gap-2">
        <Dialog open={crossPostDialogOpen} onOpenChange={setCrossPostDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Zap className="w-4 h-4" />
              Cross-Post
            </Button>
          </DialogTrigger>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>Cross-Post to Multiple Platforms</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Select platforms to share to all at once with UTM tracking
              </p>
              {platforms.map((platform) => (
                <div key={platform.platform} className="flex items-center space-x-2">
                  <Checkbox
                    id={platform.platform}
                    checked={selectedPlatforms.includes(platform.platform)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedPlatforms([...selectedPlatforms, platform.platform]);
                      } else {
                        setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform.platform));
                      }
                    }}
                  />
                  <label
                    htmlFor={platform.platform}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                  >
                    <span>{platform.icon}</span>
                    {platform.name}
                  </label>
                </div>
              ))}
              <Button onClick={handleCrossPost} className="w-full">
                Share to {selectedPlatforms.length} Platform{selectedPlatforms.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={utmDialogOpen} onOpenChange={setUtmDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings2 className="w-4 h-4" />
              UTM Settings
            </Button>
          </DialogTrigger>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>UTM Campaign Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="campaign">Campaign Name</Label>
                <Input
                  id="campaign"
                  value={customCampaign}
                  onChange={(e) => setCustomCampaign(e.target.value)}
                  placeholder="e.g., summer_promo"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Used to track the effectiveness of different campaigns
                </p>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Auto-configured:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>utm_source: Platform name (facebook, twitter, etc.)</li>
                  <li>utm_medium: social</li>
                  <li>utm_content: Content ID</li>
                </ul>
              </div>
              <Button onClick={() => setUtmDialogOpen(false)} className="w-full">
                Save Settings
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EnhancedSocialShare;
