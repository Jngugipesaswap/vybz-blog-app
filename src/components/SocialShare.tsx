import { Link2, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface SocialShareProps {
  title: string;
  description?: string;
  url?: string;
}

const SocialShare = ({ title, description = "", url }: SocialShareProps) => {
  const shareUrl = url || window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const shareText = encodeURIComponent(`${title} - ${description}`);
  const { toast } = useToast();
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  const platforms = [
    {
      name: "WhatsApp",
      icon: "💬",
      url: `https://wa.me/?text=${shareText}%20${encodedUrl}`,
    },
    {
      name: "Instagram",
      icon: "📷",
      url: `https://www.instagram.com/`, // Instagram doesn't support direct web sharing
    },
    {
      name: "X",
      icon: "𝕏",
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: "Snapchat",
      icon: "👻",
      url: `https://www.snapchat.com/scan?attachmentUrl=${encodedUrl}`,
    },
    {
      name: "Facebook",
      icon: "📘",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
  ];

  const handleShare = (platformUrl: string) => {
    window.open(platformUrl, "_blank", "width=600,height=400");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
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
    <div className="flex items-center gap-3">
      {platforms.map((platform) => (
        <button
          key={platform.name}
          onClick={(e) => {
            e.stopPropagation();
            handleShare(platform.url);
          }}
          className="text-xl text-foreground hover:scale-125 transition-transform duration-200"
          aria-label={`Share on ${platform.name}`}
          title={`Share on ${platform.name}`}
        >
          {platform.icon}
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
                value={shareUrl}
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
  );
};

export default SocialShare;
