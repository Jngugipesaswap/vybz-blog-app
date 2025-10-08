import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Calendar, MapPin, Clock, Ticket, Heart } from "lucide-react";
import { useState } from "react";
import ShareButton from "@/components/ShareButton";

interface EventCardProps {
  id: string;
  title: string;
  image: string;
  venue: string;
  date: string;
  time: string;
  price: string;
  category: string;
  ticketsLeft?: number;
  featured?: boolean;
}

const EventCard = ({
  id,
  title,
  image,
  venue,
  date,
  time,
  price,
  category,
  ticketsLeft,
  featured = false
}: EventCardProps) => {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <Card className={`group cursor-pointer hover-lift overflow-hidden ${
      featured ? 'ring-2 ring-primary shadow-hover' : 'shadow-card'
    }`}>
      <CardHeader className="p-0 relative">
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {featured && (
            <Badge className="absolute top-3 left-3 bg-primary text-white">
              Featured
            </Badge>
          )}
          {ticketsLeft && ticketsLeft < 10 && (
            <Badge className="absolute top-3 right-3 bg-destructive text-white">
              Only {ticketsLeft} left!
            </Badge>
          )}
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              className={`w-9 h-9 rounded-full transition-all ${
                isLiked ? 'bg-primary text-white' : 'bg-background/80 backdrop-blur-sm'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-xs">
            {category}
          </Badge>
        </div>
        
        <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors">
          {title}
        </h3>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2 text-primary" />
            <span>{date}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="w-4 h-4 mr-2 text-primary" />
            <span>{time}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2 text-primary" />
            <span>{venue}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Starting from</span>
          <span className="text-xl font-bold text-primary">{price}</span>
        </div>
        <div className="flex gap-2">
          <Button className="btn-gradient text-white">
            <Ticket className="w-4 h-4 mr-2" />
            Get Tickets
          </Button>
          <ShareButton 
            title={title}
            description={`${category} event at ${venue} on ${date}`}
          />
        </div>
      </CardFooter>
    </Card>
  );
};

export default EventCard;