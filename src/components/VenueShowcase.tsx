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
    <section id="venues" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-6 h-6 text-primary" />
              <Badge className="bg-accent text-white px-4 py-2">
                Venue Spotlight
              </Badge>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Premier <span className="text-gradient">Venues</span> in Nairobi
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Discover the best entertainment venues across the city. From intimate settings to grand amphitheatres.
            </p>
          </div>
          <div className="hidden md:block">
            <Button variant="outline" className="hover:bg-primary hover:text-white">
              Explore All Venues
              <ArrowRight className="w-4 h-4 ml-2" />
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
          <Button variant="outline" className="hover:bg-primary hover:text-white w-full">
            Explore All Venues
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default VenueShowcase;