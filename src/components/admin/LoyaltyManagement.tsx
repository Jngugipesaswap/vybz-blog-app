import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface LoyaltyPoint {
  id: string;
  user_id: string;
  points: number;
  total_earned: number;
  total_spent: number;
  tier: string;
  created_at: string;
}

export function LoyaltyManagement() {
  const [loyaltyPoints, setLoyaltyPoints] = useState<LoyaltyPoint[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchLoyaltyPoints();
    fetchProfiles();
  }, []);

  const fetchLoyaltyPoints = async () => {
    const { data, error } = await supabase
      .from("loyalty_points")
      .select("*")
      .order("points", { ascending: false });

    if (error) {
      toast.error("Failed to fetch loyalty points");
      return;
    }

    setLoyaltyPoints(data || []);
  };

  const fetchProfiles = async () => {
    const { data } = await supabase.from("profiles").select("user_id, full_name");
    const profilesMap: Record<string, string> = {};
    data?.forEach((profile) => {
      profilesMap[profile.user_id] = profile.full_name || "Unknown User";
    });
    setProfiles(profilesMap);
  };

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      bronze: "bg-orange-500",
      silver: "bg-gray-400",
      gold: "bg-yellow-500",
      platinum: "bg-purple-500",
    };
    return colors[tier] || "bg-gray-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Loyalty Points Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Current Points</TableHead>
              <TableHead>Total Earned</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Member Since</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loyaltyPoints.map((lp) => (
              <TableRow key={lp.id}>
                <TableCell className="font-medium">
                  {profiles[lp.user_id] || "Loading..."}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    {lp.points.toLocaleString()}
                  </div>
                </TableCell>
                <TableCell>{lp.total_earned.toLocaleString()}</TableCell>
                <TableCell>{lp.total_spent.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge className={getTierColor(lp.tier)}>
                    {lp.tier.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(lp.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
