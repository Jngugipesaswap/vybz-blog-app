import { Link2, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useShareTracking } from "@/hooks/useShareTracking";
import { useAuth } from "@/hooks/useAuth";
import { buildUTMUrl, getPlatformSource } from "@/lib/utm";

interface SocialShareProps {
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  contentType?: 'event' | 'venue' | 'post';
  contentId?: string;
}

const SocialShare = ({ title, description = "", url, imageUrl, contentType, contentId }: SocialShareProps) => {
  const { user } = useAuth();
  const { createShareLink, trackEvent } = useShareTracking();
  const { toast } = useToast();
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [trackedUrls, setTrackedUrls] = useState<Record<string, string>>({});
  
  const baseUrl = url || window.location.href;

  useEffect(() => {
    // Track view event if there's a tracking code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const trackingCode = urlParams.get('ref');
    if (trackingCode) {
      trackEvent(trackingCode, 'view');
    }
  }, []);

  const getTrackedUrl = async (platform: string) => {
    // Return cached URL if already generated
    if (trackedUrls[platform]) {
      return trackedUrls[platform];
    }

    let trackedUrl = baseUrl;

    // If user is logged in and content info is provided, create tracking link
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
      campaign: 'organic_share',
      content: contentId || undefined
    });

    setTrackedUrls(prev => ({ ...prev, [platform]: utmUrl }));
    return utmUrl;
  };

  const handleShare = async (platform: string, platformUrl: string) => {
    const trackedUrl = await getTrackedUrl(platform);
    const encodedUrl = encodeURIComponent(trackedUrl);
    const encodedTitle = encodeURIComponent(title);
    const shareText = encodeURIComponent(`${title} - ${description}`);
    
    // Replace the URL placeholder in platform URL
    const finalUrl = platformUrl
      .replace(encodeURIComponent(baseUrl), encodedUrl)
      .replace(baseUrl, trackedUrl);
    
    window.open(finalUrl, "_blank", "width=600,height=400");
  };

  const platforms = [
    {
      name: "WhatsApp",
      icon: "💬",
      url: `https://wa.me/?text=`,
      platform: "whatsapp"
    },
    {
      name: "Instagram",
      icon: "📷",
      url: `https://www.instagram.com/`,
      platform: "instagram"
    },
    {
      name: "X",
      icon: "𝕏",
      url: `https://twitter.com/intent/tweet?url=`,
      platform: "twitter"
    },
    {
      name: "Snapchat",
      icon: "👻",
      url: `https://www.snapchat.com/scan?attachmentUrl=`,
      platform: "snapchat"
    },
    {
      name: "Facebook",
      icon: "📘",
      url: `https://www.facebook.com/sharer/sharer.php?u=`,
      platform: "facebook"
    },
  ];

  const storyPlatforms = imageUrl ? [
    {
      name: "Instagram Story",
      icon: "📸",
      url: `instagram-stories://share?source_application=&background_image=${encodeURIComponent(imageUrl)}&content_url=`,
      fallback: `https://www.instagram.com/`,
      platform: "instagram_story"
    },
    {
      name: "Snapchat Story",
      icon: "👻",
      url: `https://www.snapchat.com/scan?attachmentUrl=`,
      platform: "snapchat_story"
    },
    {
      name: "Facebook Story",
      icon: "📖",
      url: `https://www.facebook.com/stories/create/?media_url=${encodeURIComponent(imageUrl)}&url=`,
      platform: "facebook_story"
    },
  ] : [];

  const handleCopyLink = async () => {
    const trackedUrl = await getTrackedUrl('copy_link');
    navigator.clipboard.writeText(trackedUrl);
    toast({
      title: "Link Copied!",
      description: "The link has been copied to your clipboard.",
    });
  };

  const handleDownloadQR = () => {
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
        description: "The QR code has been saved to your device.",
      });
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="space-y-2">
      {/* Regular Share Options */}
      <div className="flex items-center gap-3">
        {platforms.map((platformData) => (
          <button
            key={platformData.name}
            onClick={(e) => {
              e.stopPropagation();
              handleShare(platformData.platform, platformData.url);
            }}
            className="text-xl text-foreground hover:scale-125 transition-transform duration-200"
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
          className="text-xl text-foreground hover:scale-125 transition-transform duration-200"
          aria-label="Copy Link"
          title="Copy Link"
        >
          <Link2 className="w-5 h-5" />
        </button>

        <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
          <DialogTrigger asChild>
            <button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="text-xl text-foreground hover:scale-125 transition-transform duration-200"
              aria-label="Generate QR Code"
              title="Generate QR Code"
            >
              <QrCode className="w-5 h-5" />
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

      {/* Story Share Options */}
      {storyPlatforms.length > 0 && (
        <>
          <Separator className="my-2" />
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Stories:</span>
            {storyPlatforms.map((platformData) => (
              <button
                key={platformData.name}
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(platformData.platform, platformData.url);
                  if ('fallback' in platformData) {
                    toast({
                      title: "Tip",
                      description: `Open this link on mobile with Instagram app installed for best results.`,
                    });
                  }
                }}
                className="text-xl text-foreground hover:scale-125 transition-transform duration-200"
                aria-label={`Share to ${platformData.name}`}
                title={`Share to ${platformData.name}`}
              >
                {platformData.icon}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SocialShare;
