import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Ticket, Music, Zap, Flame, TrendingUp, Users, Star, Upload, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-nairobi-events.jpg";
import VideoUpload from "./VideoUpload";
import { useState, useEffect } from "react";

const HeroSection = () => {
  const [backgroundVideo, setBackgroundVideo] = useState<string>(() => {
    return localStorage.getItem('heroBackgroundVideo') || "";
  });
  const [showVideoUpload, setShowVideoUpload] = useState(false);

  const handleVideoSelect = (url: string) => {
    setBackgroundVideo(url);
    if (url) {
      localStorage.setItem('heroBackgroundVideo', url);
    } else {
      localStorage.removeItem('heroBackgroundVideo');
    }
    setShowVideoUpload(false);
  };

  const categoryFilters = ['+18 Events', 'Family Fun', 'Conferences', 'Venues', 'All Categories'];

  return (
    <section className="relative h-screen flex flex-col justify-between overflow-hidden">
      <div className="absolute inset-0">
        <div className="relative w-full h-full">
          {backgroundVideo ? (
            <video
              src={backgroundVideo}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={heroImage}
              alt="Nairobi Entertainment District"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/25 to-secondary/30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-transparent to-accent/15 animate-pulse"></div>
      </div>

      <Button
        onClick={() => setShowVideoUpload(!showVideoUpload)}
        className="absolute top-24 right-4 z-30 glass-effect border-white/40"
        size="sm"
        variant="outline"
      >
        <Upload className="w-4 h-4 mr-2" />
        {backgroundVideo ? "Change Video" : "Add Video"}
      </Button>

      {showVideoUpload && (
        <div className="absolute top-20 right-4 z-40">
          <VideoUpload
            onVideoSelect={handleVideoSelect}
            currentVideo={backgroundVideo}
          />
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-16 animate-float opacity-40">
          <Ticket className="w-10 h-10 text-primary rotate-12" />
        </div>
        <div className="absolute top-48 right-24 animate-float-slow opacity-35">
          <Music className="w-8 h-8 text-secondary rotate-45" />
        </div>
        <div className="absolute bottom-64 left-32 animate-float opacity-30">
          <Zap className="w-12 h-12 text-accent -rotate-12" />
        </div>
        <div className="absolute top-56 right-48 animate-float-slow opacity-40">
          <Star className="w-6 h-6 text-primary rotate-45" />
        </div>
        <div className="absolute bottom-80 right-16 animate-float opacity-35">
          <Users className="w-8 h-8 text-secondary -rotate-45" />
        </div>
      </div>

      <div className="relative z-10 pt-24 pb-8">
        <div className="text-center animate-fade-up">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
            Welcome to
            <span className="block text-gradient bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
              The Vybz Circle
            </span>
          </h1>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-white/90 mb-8">
            Kenya's Ultimate Entertainment Hub
          </h2>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-light mb-8">
            From nightlife to family fun, conferences to cultural events — discover it all in one place.
          </p>

          <div className="max-w-2xl mx-auto mb-6">
            <div className="glass-effect rounded-2xl p-3 mb-4">
              <div className="flex items-center">
                <Search className="w-6 h-6 text-white/70 ml-4" />
                <Input
                  placeholder="Search nightlife, family events, conferences..."
                  className="bg-transparent border-none text-white placeholder:text-white/60 text-lg py-4 px-4 focus:ring-0 flex-1"
                />
                <Button
                  className="cta-gradient text-white px-8 py-3 m-1 font-semibold"
                  onClick={() => document.getElementById('trending-events')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Search
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {categoryFilters.map(category => (
                <Button
                  key={category}
                  variant="outline"
                  size="sm"
                  className="glass-effect text-white border-white/30 hover:bg-white/20 hover-lift px-4 py-1 text-sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="glass-effect border-primary/40 mb-8" />

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="cta-gradient text-lg px-8 py-4 text-white font-semibold"
              onClick={() => document.getElementById('adult-events')?.scrollIntoView({ behavior: 'smooth' })}
            >
              +18 Events
            </Button>
            <Button
              size="lg"
              className="glass-effect text-lg px-8 py-4 text-white hover:bg-white/20 hover-lift border-white/40"
              onClick={() => document.getElementById('family-events')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Family Fun
            </Button>
            <Button
              size="lg"
              className="glass-effect text-lg px-8 py-4 text-white hover:bg-white/20 hover-lift border-white/40"
              onClick={() => document.getElementById('conferences')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Conferences
            </Button>
          </div>
        </div>
      </div>

      <div className="relative z-20">
        <div className="bg-gradient-to-r from-primary to-accent py-3 overflow-hidden">
          <div className="animate-ticker whitespace-nowrap text-white font-medium flex items-center space-x-12 text-lg">
            <span className="flex items-center">
              <Flame className="w-5 h-5 mr-3" />
              🔥 1,200 tickets sold today
            </span>
            <span className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-3" />
              8 events trending right now
            </span>
            <span className="flex items-center">
              <MapPin className="w-5 h-5 mr-3" />
              20 venues spotlighted
            </span>
            <span className="flex items-center">
              <Users className="w-5 h-5 mr-3" />
              500+ people browsing now
            </span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce z-30">
        <div className="glass-effect w-8 h-12 rounded-full flex justify-center items-center">
          <div className="w-1 h-4 bg-white/70 rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
