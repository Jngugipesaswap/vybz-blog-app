import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Sparkles, Crown, Bot, ShoppingCart } from "lucide-react";

const PatatixCTA = () => {
  const features = [
    {
      icon: Bot,
      title: "AI Event Planner",
      description: "Personalized event recommendations powered by artificial intelligence"
    },
    {
      icon: Crown,
      title: "Loyalty Circle",
      description: "Earn points, unlock tiers, and get exclusive rewards with every event"
    },
    {
      icon: ShoppingCart,
      title: "Vendor Marketplace",
      description: "Order food, drinks & merch directly through your Vybz Wallet"
    },
    {
      icon: Sparkles,
      title: "Multi-Category Hub",
      description: "+18 events, family fun, and conferences all in one platform"
    }
  ];

  return (
    <section id="platform-features" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 hero-gradient opacity-10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 text-base">
            Join The Vybz Circle
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Ready to Experience
            <span className="block text-gradient">Entertainment Differently?</span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
            From nightlife to family fun, conferences to cultural events - discover, plan, and enjoy
            Kenya's entertainment like never before.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              className="cta-gradient text-lg px-8 py-4 hover-lift group text-white"
              onClick={() => document.getElementById('trending-events')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Your Circle Journey
              <ExternalLink className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 hover:bg-primary hover:text-white"
            >
              Learn More About The Platform
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover-lift border-0 shadow-soft card-gradient">
              <CardContent className="p-6">
                <div className="w-16 h-16 rounded-full cta-gradient flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">25K+</div>
            <div className="text-lg text-muted-foreground">Circle Members</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">750K+</div>
            <div className="text-lg text-muted-foreground">Events Discovered</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">5K+</div>
            <div className="text-lg text-muted-foreground">Loyalty Points Redeemed</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PatatixCTA;