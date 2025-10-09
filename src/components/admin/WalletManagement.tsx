import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface WalletData {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  created_at: string;
}

export function WalletManagement() {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchWallets();
    fetchProfiles();
  }, []);

  const fetchWallets = async () => {
    const { data, error } = await supabase
      .from("wallets")
      .select("*")
      .order("balance", { ascending: false });

    if (error) {
      toast.error("Failed to fetch wallets");
      return;
    }

    setWallets(data || []);
  };

  const fetchProfiles = async () => {
    const { data } = await supabase.from("profiles").select("user_id, full_name");
    const profilesMap: Record<string, string> = {};
    data?.forEach((profile) => {
      profilesMap[profile.user_id] = profile.full_name || "Unknown User";
    });
    setProfiles(profilesMap);
  };

  const getTotalBalance = () => {
    return wallets.reduce((sum, wallet) => sum + (typeof wallet.balance === 'number' ? wallet.balance : parseFloat(String(wallet.balance))), 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Management
        </CardTitle>
        <div className="text-2xl font-bold mt-2">
          Total Balance: ${getTotalBalance().toFixed(2)}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wallets.map((wallet) => (
              <TableRow key={wallet.id}>
                <TableCell className="font-medium">
                  {profiles[wallet.user_id] || "Loading..."}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    {(typeof wallet.balance === 'number' ? wallet.balance : parseFloat(String(wallet.balance))).toFixed(2)}
                  </div>
                </TableCell>
                <TableCell>{wallet.currency}</TableCell>
                <TableCell>{new Date(wallet.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
