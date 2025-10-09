import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EventCard from "./EventCard";
import CategoryFilter from "./CategoryFilter";
import { ArrowRight, TrendingUp } from "lucide-react";
import concertVenue from "@/assets/concert-venue.jpg";
import outdoorVenue from "@/assets/outdoor-venue.jpg";
import { useState } from "react";

const trendingEvents = [
  {
    id: "1",
    title: "Club Noir Saturday Night",
    image: concertVenue,
    venue: "Westlands",
    date: "Dec 15, 2024",
    time: "11:00 PM",
    price: "KSH 1,500",
    category: "+18 Events",
    ticketsLeft: 5,
    featured: true,
  },
  {
    id: "2",
    title: "Kids Carnival & Fun Day",
    image: outdoorVenue,
    venue: "Uhuru Gardens",
    date: "Dec 20, 2024",
    time: "10:00 AM",
    price: "KSH 800",
    category: "Family Fun",
    ticketsLeft: 25,
  },
];

const TrendingEvents = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <section className="py-24 bg-black border-t-2 border-primary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-black border-2 border-primary text-primary px-6 py-3 text-sm font-bold uppercase tracking-widest">
            Trending Now
          </Badge>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 uppercase tracking-tight text-white">
            Hot Events
          </h2>
          <p className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto uppercase tracking-wide">
            Don't miss out on the most popular events happening in Nairobi
          </p>
        </div>

        <CategoryFilter onCategoryChange={setActiveCategory} activeCategory={activeCategory} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {trendingEvents.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>

        <div className="text-center mt-16">
          <Button size="lg" className="bg-primary hover:bg-primary/80 text-black text-lg px-12 py-6 font-black uppercase tracking-wider">
            View All Events
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TrendingEvents;
