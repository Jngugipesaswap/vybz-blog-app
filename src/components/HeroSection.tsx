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
    <section className="relative h-screen flex flex-col justify-between overflow-hidden">
      {/* Background with futuristic effects */}
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
              src={futuristicBg}
              alt="Futuristic Entertainment Hub"
              className="w-full h-full object-cover animate-[scale_20s_ease-in-out_infinite]"
              style={{
                animation: 'scale 20s ease-in-out infinite alternate',
                transformOrigin: 'center'
              }}
            />
          )}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Cyber Effects Layers */}
        <div className="scan-lines"></div>
        <div className="digital-grid"></div>
        <div className="hex-pattern"></div>
        <div className="holographic-particles"></div>
        
        {/* Animated mesh gradient background */}
        <div className="absolute inset-0 mesh-gradient"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60"></div>
        
        {/* Enhanced Animated blobs with more vibrant colors */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-secondary/30 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-[450px] h-[450px] bg-accent/30 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-primary/20 rounded-full blur-2xl animate-blob" style={{ animationDelay: '6s' }}></div>
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

      {/* Enhanced floating icons with glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-16 animate-float opacity-50">
          <div className="hover-glow">
            <Ticket className="w-12 h-12 text-primary rotate-12 drop-shadow-[0_0_15px_rgba(56,189,179,0.8)]" />
          </div>
        </div>
        <div className="absolute top-48 right-24 animate-float-slow opacity-45">
          <div className="hover-glow">
            <Music className="w-10 h-10 text-secondary rotate-45 drop-shadow-[0_0_15px_rgba(186,230,253,0.8)]" />
          </div>
        </div>
        <div className="absolute bottom-64 left-32 animate-float opacity-40">
          <div className="hover-glow">
            <Zap className="w-14 h-14 text-accent -rotate-12 drop-shadow-[0_0_20px_rgba(0,150,136,0.8)]" />
          </div>
        </div>
        <div className="absolute top-56 right-48 animate-float-slow opacity-50">
          <div className="hover-glow">
            <Star className="w-8 h-8 text-primary rotate-45 drop-shadow-[0_0_15px_rgba(56,189,179,0.8)]" />
          </div>
        </div>
        <div className="absolute bottom-80 right-16 animate-float opacity-45">
          <div className="hover-glow">
            <Users className="w-10 h-10 text-secondary -rotate-45 drop-shadow-[0_0_15px_rgba(186,230,253,0.8)]" />
          </div>
        </div>
        <div className="absolute top-40 left-1/3 animate-float opacity-35">
          <div className="hover-glow">
            <Flame className="w-9 h-9 text-accent rotate-12 drop-shadow-[0_0_15px_rgba(0,150,136,0.8)]" />
          </div>
        </div>
      </div>

      <div className="relative z-10 pt-24 pb-8">
        <div className="text-center animate-fade-up px-4">
          {/* Pulse rings behind title */}
          <div className="absolute top-32 left-1/2 transform -translate-x-1/2 w-32 h-32">
            <div className="pulse-ring w-full h-full"></div>
            <div className="pulse-ring w-full h-full" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold text-white mb-6 leading-tight relative">
            Welcome to
            <span className="block text-gradient-animated neon-glow mt-2 relative">
              The Vybz Circle
              <span className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 blur-2xl -z-10"></span>
            </span>
          </h1>
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-light text-white/95 mb-10 tracking-wide relative">
            Kenya's Ultimate Entertainment Hub
            <span className="absolute inset-0 text-primary/20 blur-sm">Kenya's Ultimate Entertainment Hub</span>
          </h2>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-light mb-12 leading-relaxed">
            From nightlife to family fun, conferences to cultural events — discover it all in one place.
          </p>

          <div className="max-w-3xl mx-auto mb-8">
            <div className="glass-effect-strong rounded-3xl p-4 mb-6 hover-lift neon-border relative overflow-hidden">
              {/* Cyber scan line */}
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-[scan_3s_ease-in-out_infinite]"></div>
              
              <div className="flex items-center relative z-10">
                <Search className="w-7 h-7 text-primary/90 ml-5 drop-shadow-[0_0_10px_rgba(56,189,179,0.8)]" />
                <Input
                  placeholder="Search nightlife, family events, conferences..."
                  className="bg-transparent border-none text-white placeholder:text-white/70 text-xl py-6 px-5 focus:ring-0 flex-1"
                />
                <Button
                  className="cta-gradient text-white px-10 py-4 m-1 font-bold text-lg hover-scale hover-glow cyber-button relative overflow-hidden"
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
                  className="glass-effect-strong text-white border-white/40 hover:bg-primary/30 hover-lift interactive-badge px-6 py-2 text-base font-medium cyber-button neon-border relative"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="relative z-10">{category}</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 opacity-0 hover:opacity-100 transition-opacity"></span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4">
        <div className="max-w-5xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <Button
              size="lg"
              className="cta-gradient text-xl px-12 py-7 text-white font-bold hover-lift hover-glow transition-spring shadow-hover cyber-button neon-border relative overflow-hidden group"
              onClick={() => document.getElementById('adult-events')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Zap className="w-6 h-6 mr-3 relative z-10 group-hover:animate-pulse" />
              <span className="relative z-10">+18 Events</span>
              <span className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/30 to-accent/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
            </Button>
            <Button
              size="lg"
              className="glass-effect-strong text-xl px-12 py-7 text-white hover:bg-primary/40 hover-lift transition-spring border-primary/50 font-bold hover-glow cyber-button neon-border relative overflow-hidden group"
              onClick={() => document.getElementById('family-events')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Users className="w-6 h-6 mr-3 relative z-10 group-hover:animate-pulse" />
              <span className="relative z-10">Family Fun</span>
              <span className="absolute inset-0 bg-gradient-to-r from-secondary/0 via-secondary/30 to-secondary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
            </Button>
            <Button
              size="lg"
              className="glass-effect-strong text-xl px-12 py-7 text-white hover:bg-primary/40 hover-lift transition-spring border-primary/50 font-bold hover-glow cyber-button neon-border relative overflow-hidden group"
              onClick={() => document.getElementById('conferences')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Star className="w-6 h-6 mr-3 relative z-10 group-hover:animate-pulse" />
              <span className="relative z-10">Conferences</span>
              <span className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/30 to-accent/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced ticker with glow */}
      <div className="relative z-20">
        <div className="bg-gradient-to-r from-primary via-accent to-secondary py-4 overflow-hidden shadow-[0_0_40px_rgba(56,189,179,0.4)]">
          <div className="flex animate-ticker">
            <div className="flex items-center whitespace-nowrap text-white font-bold space-x-16 text-xl">
              <span className="flex items-center">
                <Flame className="w-6 h-6 mr-3 animate-pulse" />
                🔥 1,200 tickets sold today
              </span>
              <span className="flex items-center">
                <TrendingUp className="w-6 h-6 mr-3" />
                8 events trending right now
              </span>
              <span className="flex items-center">
                <MapPin className="w-6 h-6 mr-3" />
                20 venues spotlighted
              </span>
              <span className="flex items-center">
                <Users className="w-6 h-6 mr-3" />
                500+ people browsing now
              </span>
            </div>
            <div className="flex items-center whitespace-nowrap text-white font-bold space-x-16 text-xl ml-16">
              <span className="flex items-center">
                <Flame className="w-6 h-6 mr-3 animate-pulse" />
                🔥 1,200 tickets sold today
              </span>
              <span className="flex items-center">
                <TrendingUp className="w-6 h-6 mr-3" />
                8 events trending right now
              </span>
              <span className="flex items-center">
                <MapPin className="w-6 h-6 mr-3" />
                20 venues spotlighted
              </span>
              <span className="flex items-center">
                <Users className="w-6 h-6 mr-3" />
                500+ people browsing now
              </span>
            </div>
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
