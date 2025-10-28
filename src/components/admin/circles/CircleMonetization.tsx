import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, TrendingUp, Eye, MousePointerClick, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function CircleMonetization() {
  // Pre-structured for future monetization features
  const monetizationFeatures = [
    {
      title: "Ad Placements",
      description: "Native advertising within circle feeds",
      status: "Coming Soon",
      icon: Eye,
    },
    {
      title: "Brand Partnerships",
      description: "Sponsored content and collaborations",
      status: "Coming Soon",
      icon: Award,
    },
    {
      title: "Sponsored Posts",
      description: "Highlighted promotional content",
      status: "Coming Soon",
      icon: MousePointerClick,
    },
    {
      title: "Revenue Analytics",
      description: "Track earnings and performance",
      status: "Coming Soon",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Monetization & Sponsorship</h1>
        <p className="text-muted-foreground mt-1">
          Revenue opportunities and brand partnerships (Coming Soon)
        </p>
      </div>

      {/* Future Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-effect border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">$0.00</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ad Views</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <Eye className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Click Rate</p>
                <p className="text-2xl font-bold">0%</p>
              </div>
              <MousePointerClick className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Partnerships</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <Award className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monetization Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {monetizationFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="glass-effect">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">{feature.status}</Badge>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="glass-effect border-primary/20">
        <CardHeader>
          <CardTitle>Monetization Roadmap</CardTitle>
          <CardDescription>
            Future revenue streams are being structured for circle owners and the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Circle Owner Revenue Share</p>
              <p className="text-sm text-muted-foreground">
                Event organizers and circle creators will earn from their community's engagement
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Award className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Brand Partnership Program</p>
              <p className="text-sm text-muted-foreground">
                Connect brands with engaged communities for authentic sponsorships
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Performance Analytics</p>
              <p className="text-sm text-muted-foreground">
                Comprehensive dashboards to track ROI and optimize campaigns
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
