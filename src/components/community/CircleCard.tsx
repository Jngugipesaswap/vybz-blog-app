import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Flame, MessageCircle } from "lucide-react";

interface CircleCardProps {
  circle: any;
  onJoin: () => void;
  onClick: () => void;
}

export const CircleCard = ({ circle, onJoin, onClick }: CircleCardProps) => {
  return (
    <Card 
      className="group hover-lift cursor-pointer overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/50"
      onClick={onClick}
    >
      <div className="relative h-48 overflow-hidden">
        {circle.cover_image ? (
          <img
            src={circle.cover_image}
            alt={circle.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/30 to-accent/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {circle.is_live && (
          <Badge className="absolute top-3 right-3 bg-destructive border-0 animate-pulse shadow-glow">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
              LIVE
            </span>
          </Badge>
        )}

        {circle.member_count > 100 && (
          <Badge className="absolute top-3 left-3 bg-accent/90 border-0">
            <Flame className="w-3 h-3 mr-1" />
            Trending
          </Badge>
        )}
      </div>

      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
              {circle.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {circle.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{circle.member_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{circle.post_count || 0}</span>
              </div>
            </div>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onJoin();
              }}
              className="btn-gradient"
            >
              Join
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
