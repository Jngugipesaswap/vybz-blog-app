import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Calendar, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-nairobi-events.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src={heroImage} alt="Nairobi Events" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 to-foreground/60" />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <Badge className="mb-4 bg-primary text-white px-4 py-2">
          Kenya's #1 Event Discovery Platform
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold text-background mb-6">
          Discover Amazing <span className="text-gradient">Events</span> in Nairobi
        </h1>
        <p className="text-xl text-background/90 mb-8 max-w-2xl mx-auto">
          From exclusive +18 nightlife to family-friendly activities. Find your perfect vibe.
        </p>

        <div className="max-w-3xl mx-auto bg-background/95 backdrop-blur-md p-4 rounded-2xl shadow-hover">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input placeholder="Search events..." className="border-0 bg-transparent" />
            </div>
            <Button className="btn-gradient text-white px-8">
              <Calendar className="w-4 h-4 mr-2" />
              Find Events
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
