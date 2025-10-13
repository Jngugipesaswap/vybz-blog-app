import { Instagram, Youtube, Music2 } from "lucide-react";
import { Facebook } from "lucide-react";

interface SocialLink {
  platform: string;
  username: string;
  url: string;
}

interface SocialLinksDisplayProps {
  socialLinks: SocialLink[];
  size?: "sm" | "md" | "lg";
}

const SocialLinksDisplay = ({ socialLinks, size = "md" }: SocialLinksDisplayProps) => {
  if (!socialLinks || socialLinks.length === 0) return null;

  const iconSize = size === "sm" ? "w-4 h-4" : size === "md" ? "w-5 h-5" : "w-6 h-6";
  const containerSize = size === "sm" ? "w-8 h-8" : size === "md" ? "w-10 h-10" : "w-12 h-12";

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <Instagram className={iconSize} />;
      case "twitter":
        return <span className="text-lg">𝕏</span>;
      case "snapchat":
        return <span className="text-lg">👻</span>;
      case "youtube":
        return <Youtube className={iconSize} />;
      case "tiktok":
        return <Music2 className={iconSize} />;
      case "facebook":
        return <Facebook className={iconSize} />;
      default:
        return null;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return "hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white";
      case "twitter":
        return "hover:bg-black hover:text-white";
      case "snapchat":
        return "hover:bg-yellow-400 hover:text-black";
      case "youtube":
        return "hover:bg-red-600 hover:text-white";
      case "tiktok":
        return "hover:bg-black hover:text-white";
      case "facebook":
        return "hover:bg-blue-600 hover:text-white";
      default:
        return "hover:bg-primary hover:text-primary-foreground";
    }
  };

  return (
    <div className="flex items-center gap-2">
      {socialLinks.map((link) => (
        <a
          key={link.platform}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${containerSize} rounded-full border border-border flex items-center justify-center transition-all duration-200 ${getPlatformColor(link.platform)}`}
          title={`@${link.username} on ${link.platform}`}
        >
          {getPlatformIcon(link.platform)}
        </a>
      ))}
    </div>
  );
};

export default SocialLinksDisplay;
