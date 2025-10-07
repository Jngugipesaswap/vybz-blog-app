import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { MapPin, Star, Users, Phone, Globe, Calendar } from "lucide-react";

interface VenueSpotlightProps {
  name: string;
  image: string;
  location: string;
  rating: number;
  category: string;
  description: string;
  capacity: string;
  contact: string;
  website?: string;
  upcomingEvents: number;
}

const VenueSpotlight = ({
  name,
  image,
  location,
  rating,
  category,
  description,
  capacity,
  contact,
  website,
  upcomingEvents
}: VenueSpotlightProps) => {
  return (
    <Card className="group cursor-pointer hover-lift overflow-hidden shadow-card">
      <div className="relative h-56 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        <div className="absolute top-3 left-3">
          <Badge className="bg-white/90 text-foreground">
            {category}
          </Badge>
        </div>

        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="text-2xl font-bold mb-1">{name}</h3>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold text-foreground">{rating}</span>
        </div>
      </div>

      <CardContent className="p-6">
        <p className="text-muted-foreground mb-4 line-clamp-2">{description}</p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4 text-primary" />
            <span className="font-medium">Capacity:</span>
            <span>{capacity}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="w-4 h-4 text-primary" />
            <span className="font-medium">Contact:</span>
            <span>{contact}</span>
          </div>
          {website && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="w-4 h-4 text-primary" />
              <span className="font-medium">Website:</span>
              <span className="truncate">{website}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex items-center justify-between border-t border-border">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="font-medium">{upcomingEvents} upcoming events</span>
        </div>
        <Button className="btn-gradient text-white">
          View Venue
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VenueSpotlight;