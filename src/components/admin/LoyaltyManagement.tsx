import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export function LoyaltyManagement() {
  const [stats, setStats] = useState({ total: 0, transactions: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [points, transactions] = await Promise.all([
      supabase.from("loyalty_points").select("points"),
      supabase.from("loyalty_transactions").select("id", { count: "exact", head: true }),
    ]);

    const total = points.data?.reduce((sum, item) => sum + (item.points || 0), 0) || 0;

    setStats({
      total,
      transactions: transactions.count || 0,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Loyalty Points</h1>
        <p className="text-muted-foreground mt-1">Manage loyalty rewards</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-effect border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Total Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-border/50">
          <CardHeader>
            <CardTitle>Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.transactions}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
