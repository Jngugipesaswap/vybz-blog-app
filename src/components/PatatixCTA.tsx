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
    <section id="platform-features" className="py-24 bg-black border-t-2 border-primary/30 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-transparent blur-3xl"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <Badge className="mb-6 bg-black border-2 border-primary text-primary px-6 py-3 text-sm font-bold uppercase tracking-widest">
            Join The Vybz Circle
          </Badge>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 uppercase tracking-tight text-white">
            Experience
            <span className="block text-primary mt-2">Entertainment</span>
          </h2>
          <p className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto mb-12 uppercase tracking-wide">
            Discover, plan, and enjoy Kenya's entertainment like never before
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/80 text-black text-lg px-12 py-6 font-black uppercase tracking-wider"
              onClick={() => document.getElementById('trending-events')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Journey
              <ExternalLink className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              className="bg-black/80 hover:bg-primary/20 text-white border-2 border-primary/40 hover:border-primary text-lg px-12 py-6 font-black uppercase tracking-wider"
            >
              Learn More
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((feature, index) => (
            <Card key={index} className="text-center bg-black/60 border-2 border-primary/30 hover:border-primary transition-all backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-black mb-3 uppercase tracking-wide text-white">{feature.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="border-2 border-primary/30 p-8 bg-black/40 backdrop-blur-sm">
            <div className="text-5xl md:text-6xl font-black text-primary mb-3 uppercase">25K+</div>
            <div className="text-base text-white/70 uppercase tracking-widest">Circle Members</div>
          </div>
          <div className="border-2 border-primary/30 p-8 bg-black/40 backdrop-blur-sm">
            <div className="text-5xl md:text-6xl font-black text-primary mb-3 uppercase">750K+</div>
            <div className="text-base text-white/70 uppercase tracking-widest">Events Discovered</div>
          </div>
          <div className="border-2 border-primary/30 p-8 bg-black/40 backdrop-blur-sm">
            <div className="text-5xl md:text-6xl font-black text-primary mb-3 uppercase">5K+</div>
            <div className="text-base text-white/70 uppercase tracking-widest">Points Redeemed</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PatatixCTA;