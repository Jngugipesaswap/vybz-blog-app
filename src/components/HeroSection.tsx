import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Ticket, Music, Zap, Flame, TrendingUp, Users, Star, Upload, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-nairobi-events.jpg";
import futuristicBg from "@/assets/hero-futuristic-bg.jpg";
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
    <section className="relative h-screen flex flex-col justify-between overflow-hidden bg-black">
      {/* Minimalist Dark Background with subtle effects */}
      <div className="absolute inset-0">
        <div className="relative w-full h-full bg-black">
          {backgroundVideo ? (
            <video
              src={backgroundVideo}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-20"
            />
          ) : (
            <img
              src={futuristicBg}
              alt="Futuristic Entertainment Hub"
              className="w-full h-full object-cover opacity-20 animate-[scale_20s_ease-in-out_infinite]"
              style={{
                animation: 'scale 20s ease-in-out infinite alternate',
                transformOrigin: 'center'
              }}
            />
          )}
        </div>

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black"></div>
        
        {/* Large centered geometric shape - Kaleidoscope inspired */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-30">
          <div className="relative w-full h-full">
            {/* Multiple overlapping circles creating kaleidoscope effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/40 to-transparent blur-2xl animate-pulse"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-secondary/40 to-transparent blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-bl from-accent/40 to-transparent blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>

        {/* Subtle scan lines */}
        <div className="scan-lines opacity-30"></div>
      </div>

      <Button
        onClick={() => setShowVideoUpload(!showVideoUpload)}
        className="absolute top-24 right-4 z-30 bg-black/60 border-primary/40 text-white hover:bg-primary/20 hover:border-primary"
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

      {/* Minimal floating icons - Kaleidoscope style */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-32 left-16 animate-float-slow">
          <Ticket className="w-8 h-8 text-primary rotate-12" />
        </div>
        <div className="absolute top-48 right-24 animate-float">
          <Music className="w-7 h-7 text-secondary rotate-45" />
        </div>
        <div className="absolute bottom-64 left-32 animate-float-slow">
          <Zap className="w-9 h-9 text-accent -rotate-12" />
        </div>
        <div className="absolute top-56 right-48 animate-float">
          <Star className="w-6 h-6 text-primary rotate-45" />
        </div>
      </div>

      <div className="relative z-10 pt-32 pb-8">
        <div className="text-center animate-fade-up px-4">
          {/* Large bold heading - Kaleidoscope style */}
          <div className="mb-16">
            <h1 className="text-[10rem] md:text-[15rem] lg:text-[20rem] font-black text-white leading-none tracking-tighter opacity-10 select-none pointer-events-none overflow-hidden">
              VYBZ
            </h1>
          </div>
          
          <h2 className="text-5xl md:text-7xl lg:text-9xl font-black text-white mb-8 leading-none tracking-tight uppercase">
            The Vybz Circle
          </h2>
          
          <p className="text-xl md:text-2xl lg:text-3xl text-primary/90 font-bold mb-4 tracking-widest uppercase">
            Kenya's Ultimate Entertainment Hub
          </p>
          
          <p className="text-base md:text-lg text-white/60 max-w-2xl mx-auto font-light mb-16 tracking-wide">
            From nightlife to family fun, conferences to cultural events
          </p>

          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-3 border-2 border-primary/30 hover:border-primary/60 transition-all duration-300">
              <div className="flex items-center">
                <Search className="w-6 h-6 text-primary ml-4" />
                <Input
                  placeholder="Search events, venues, experiences..."
                  className="bg-transparent border-none text-white placeholder:text-white/50 text-lg py-5 px-4 focus:ring-0 flex-1 font-light"
                />
                <Button
                  className="bg-primary hover:bg-primary/80 text-black px-8 py-4 m-1 font-bold text-base uppercase tracking-wide transition-all"
                  onClick={() => document.getElementById('trending-events')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Search
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {categoryFilters.map((category, index) => (
                <Button
                  key={category}
                  variant="outline"
                  size="sm"
                  className="bg-black/60 text-white border border-primary/40 hover:bg-primary/20 hover:border-primary px-6 py-2 text-sm font-medium uppercase tracking-wide transition-all"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 mt-8">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/80 text-black text-lg px-10 py-8 font-black uppercase tracking-wider transition-all border-2 border-transparent hover:border-primary hover:bg-black hover:text-primary"
              onClick={() => document.getElementById('adult-events')?.scrollIntoView({ behavior: 'smooth' })}
            >
              +18 Events
            </Button>
            <Button
              size="lg"
              className="bg-black/80 hover:bg-primary/20 text-white text-lg px-10 py-8 font-black uppercase tracking-wider transition-all border-2 border-primary/40 hover:border-primary"
              onClick={() => document.getElementById('family-events')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Family Fun
            </Button>
            <Button
              size="lg"
              className="bg-black/80 hover:bg-primary/20 text-white text-lg px-10 py-8 font-black uppercase tracking-wider transition-all border-2 border-primary/40 hover:border-primary"
              onClick={() => document.getElementById('conferences')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Conferences
            </Button>
          </div>
        </div>
      </div>

      {/* Minimalist ticker - Kaleidoscope style */}
      <div className="relative z-20 border-t-2 border-primary/30">
        <div className="bg-black py-4 overflow-hidden">
          <div className="flex animate-ticker">
            <div className="flex items-center whitespace-nowrap text-white/70 font-medium space-x-12 text-base uppercase tracking-widest">
              <span className="flex items-center">
                <Flame className="w-5 h-5 mr-2 text-primary" />
                1,200 tickets sold today
              </span>
              <span className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                8 events trending
              </span>
              <span className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                20 venues
              </span>
              <span className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary" />
                500+ browsing
              </span>
            </div>
            <div className="flex items-center whitespace-nowrap text-white/70 font-medium space-x-12 text-base uppercase tracking-widest ml-12">
              <span className="flex items-center">
                <Flame className="w-5 h-5 mr-2 text-primary" />
                1,200 tickets sold today
              </span>
              <span className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                8 events trending
              </span>
              <span className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                20 venues
              </span>
              <span className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary" />
                500+ browsing
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-30">
        <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex justify-center pt-2">
          <div className="w-1 h-3 bg-primary/70 rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
