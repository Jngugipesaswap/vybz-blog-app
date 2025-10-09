import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, FileText, MapPin } from "lucide-react";

interface CategoryFilterProps {
  onCategoryChange: (category: string) => void;
  activeCategory: string;
}

const CategoryFilter = ({ onCategoryChange, activeCategory }: CategoryFilterProps) => {
  const categories = [
    {
      id: 'all',
      name: 'All Categories',
      icon: Calendar,
      color: 'cta-gradient'
    },
    {
      id: '+18',
      name: '+18 Events',
      icon: Calendar,
      color: 'cta-gradient',
      description: 'Clubs, bars, adult entertainment'
    },
    {
      id: 'family',
      name: 'Family Fun',
      icon: Users,
      color: 'bg-accent',
      description: 'Kid-friendly activities'
    },
    {
      id: 'conferences',
      name: 'Conferences',
      icon: FileText,
      color: 'bg-primary',
      description: 'Business, tech, networking'
    },
    {
      id: 'venues',
      name: 'Venues',
      icon: MapPin,
      color: 'cta-gradient',
      description: 'Discover spaces'
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tight text-foreground">
            Choose Your <span className="text-primary">Vibe</span>
          </h3>
          <p className="text-lg text-muted-foreground uppercase tracking-wide">
            Filter events by category to find exactly what you're looking for
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`relative group p-6 rounded-2xl transition-all ${
                  isActive 
                    ? 'bg-card border-2 border-primary' 
                    : 'bg-card border-2 border-primary/30 hover:border-primary'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/20 border-2 border-primary flex items-center justify-center mb-3 mx-auto transition-transform group-hover:scale-110">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                
                <h4 className="font-black text-sm mb-1 uppercase tracking-wide">{category.name}</h4>
                {category.description && (
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                )}
                
                {isActive && (
                  <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground font-bold uppercase">
                    Active
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryFilter;