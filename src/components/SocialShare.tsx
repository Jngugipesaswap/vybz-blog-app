import { Facebook, Share2 } from "lucide-react";

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
    </div>
  );
};

export default SocialShare;
