import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Crown, Star, Trophy, Gift, Zap, TrendingUp } from "lucide-react";

const LoyaltySystem = () => {
  const tiers = [
    {
      name: "Bronze",
      icon: Star,
      points: "0-999",
      color: "from-orange-700 to-amber-600",
      benefits: ["5% discount on events", "Early access to new events"]
    },
    {
      name: "Silver",
      icon: Zap,
      points: "1,000-4,999",
      color: "from-gray-400 to-gray-300",
      benefits: ["10% discount", "Priority support", "Free event upgrades"]
    },
    {
      name: "Gold",
      icon: Trophy,
      points: "5,000-9,999",
      color: "from-yellow-500 to-yellow-400",
      benefits: ["15% discount", "VIP lounge access", "Birthday rewards"]
    },
    {
      name: "Platinum",
      icon: Crown,
      points: "10,000+",
      color: "from-purple-500 to-pink-500",
      benefits: ["20% discount", "Free tickets monthly", "Exclusive events"]
    }
  ];

  const currentPoints = 3250;
  const currentTier = "Silver";
  const nextTierPoints = 5000;
  const progress = (currentPoints / nextTierPoints) * 100;

  return (
    <section id="loyalty" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 cta-gradient text-white px-6 py-2 text-base">
            <Trophy className="w-4 h-4 mr-2" />
            The Circle Rewards
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Loyalty <span className="text-gradient">Circle</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Earn points with every event, unlock exclusive tiers, and enjoy amazing rewards
          </p>
        </div>

        <Card className="max-w-2xl mx-auto mb-12 shadow-hover hover-lift">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full cta-gradient flex items-center justify-center">
                <Zap className="w-10 h-10 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">Your Current Status</h3>
            <Badge className="bg-gradient-to-r from-gray-400 to-gray-300 text-white text-lg px-6 py-2">
              {currentTier} Member
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-5xl font-bold text-primary mb-2">{currentPoints.toLocaleString()}</p>
              <p className="text-muted-foreground">Circle Points</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress to Gold</span>
                <span className="font-semibold">{nextTierPoints - currentPoints} points to go</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">12</div>
                <div className="text-xs text-muted-foreground">Events Attended</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">5</div>
                <div className="text-xs text-muted-foreground">Rewards Claimed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">10%</div>
                <div className="text-xs text-muted-foreground">Current Discount</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {tiers.map((tier, index) => {
            const Icon = tier.icon;
            const isCurrentTier = tier.name === currentTier;
            
            return (
              <Card 
                key={tier.name} 
                className={`text-center hover-lift ${
                  isCurrentTier ? 'ring-2 ring-primary shadow-hover' : 'shadow-card'
                }`}
              >
                <CardContent className="p-6">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{tier.points} points</p>
                  
                  {isCurrentTier && (
                    <Badge className="mb-4 bg-primary text-white">
                      Current Tier
                    </Badge>
                  )}
                  
                  <ul className="text-left space-y-2 text-sm">
                    {tier.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start">
                        <Star className="w-4 h-4 mr-2 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-gradient-to-r from-primary to-accent text-white">
          <CardContent className="p-8 text-center">
            <Gift className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">How to Earn Points</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div>
                <div className="text-3xl font-bold mb-2">100</div>
                <p className="text-sm opacity-90">Points per event ticket</p>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">50</div>
                <p className="text-sm opacity-90">Bonus for early bookings</p>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">200</div>
                <p className="text-sm opacity-90">Refer a friend reward</p>
              </div>
            </div>
            <Button 
              size="lg" 
              className="mt-8 bg-white text-primary hover:bg-white/90"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Start Earning Points
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default LoyaltySystem;