import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import VenueSpotlight from "./VenueSpotlight";
import { ArrowRight, MapPin } from "lucide-react";
import concertVenue from "@/assets/concert-venue.jpg";
import outdoorVenue from "@/assets/outdoor-venue.jpg";

const featuredVenues = [
  {
    name: "Carnivore Grounds",
    image: outdoorVenue,
    location: "Lang'ata Road, Nairobi",
    rating: 4.8,
    category: "Outdoor Venue",
    description: "Nairobi's premier outdoor entertainment venue, perfect for large-scale concerts, festivals, and corporate events.",
    capacity: "15,000 people",
    contact: "+254 700 123 456",
    website: "carnivore.co.ke",
    upcomingEvents: 8
  },
  {
    name: "KICC Amphitheatre",
    image: concertVenue,
    location: "City Square, CBD",
    rating: 4.6,
    category: "Conference Center",
    description: "Modern amphitheatre in the heart of Nairobi, ideal for conferences, comedy shows, and intimate concerts.",
    capacity: "2,500 people",
    contact: "+254 700 234 567",
    website: "kicc.co.ke",
    upcomingEvents: 12
  },
  {
    name: "Uhuru Gardens",
    image: outdoorVenue,
    location: "Lang'ata, Nairobi",
    rating: 4.7,
    category: "Public Park",
    description: "Historic venue hosting major national events, festivals, and large gatherings with beautiful outdoor spaces.",
    capacity: "50,000+ people",
    contact: "+254 700 345 678",
    upcomingEvents: 5
  }
];

const VenueShowcase = () => {
  return (
    <section id="venues" className="py-24 bg-black">
      {/* Animated repeating text divider - Kaleidoscope style */}
      <div className="overflow-hidden py-8 border-y border-primary/20">
        <div className="flex animate-scroll-text">
          <div className="repeating-text text-[8rem] md:text-[12rem] font-black text-primary/10 uppercase tracking-tighter">
            PREMIER VENUES • PREMIER VENUES • PREMIER VENUES • PREMIER VENUES • 
          </div>
          <div className="repeating-text text-[8rem] md:text-[12rem] font-black text-primary/10 uppercase tracking-tighter">
            PREMIER VENUES • PREMIER VENUES • PREMIER VENUES • PREMIER VENUES • 
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pt-16">
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-black border-2 border-primary text-primary px-6 py-3 text-sm font-bold uppercase tracking-widest">
            Venue Spotlight
          </Badge>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 uppercase tracking-tight text-white">
            Premier Venues
          </h2>
          <p className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto uppercase tracking-wide mb-8">
            Discover the best entertainment venues across the city
          </p>
          <div className="hidden md:block">
            <Button className="bg-black/80 hover:bg-primary/20 text-white border-2 border-primary/40 hover:border-primary px-8 py-4 font-black uppercase tracking-wider">
              Explore All Venues
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredVenues.map((venue, index) => (
            <VenueSpotlight
              key={index}
              {...venue}
            />
          ))}
        </div>

        <div className="text-center mt-12 md:hidden">
          <Button className="bg-black/80 hover:bg-primary/20 text-white border-2 border-primary/40 hover:border-primary px-8 py-4 font-black uppercase tracking-wider w-full">
            Explore All Venues
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default VenueShowcase;