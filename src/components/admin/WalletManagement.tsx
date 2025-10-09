import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet as WalletIcon, DollarSign } from "lucide-react";

export function WalletManagement() {
  const [stats, setStats] = useState({ total: 0, wallets: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [wallets, count] = await Promise.all([
      supabase.from("wallets").select("balance"),
      supabase.from("wallets").select("id", { count: "exact", head: true }),
    ]);

    const total = wallets.data?.reduce((sum, item) => sum + Number(item.balance || 0), 0) || 0;

    setStats({
      total,
      wallets: count.count || 0,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wallet Management</h1>
        <p className="text-muted-foreground mt-1">Manage user wallets</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-effect border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">${stats.total.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WalletIcon className="h-5 w-5 text-primary" />
              Active Wallets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.wallets}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
