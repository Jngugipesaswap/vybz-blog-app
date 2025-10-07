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
    <section className="py-8 bg-background/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-4">
            Choose Your <span className="text-gradient">Vibe</span>
          </h3>
          <p className="text-muted-foreground">
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
                className={`relative group p-6 rounded-2xl transition-all hover-lift ${
                  isActive 
                    ? 'ring-2 ring-primary shadow-hover' 
                    : 'bg-card shadow-card hover:shadow-hover'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center mb-3 mx-auto transition-transform group-hover:scale-110`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <h4 className="font-bold text-sm mb-1">{category.name}</h4>
                {category.description && (
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                )}
                
                {isActive && (
                  <Badge className="absolute -top-2 -right-2 bg-primary text-white">
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