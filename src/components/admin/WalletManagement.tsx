import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet as WalletIcon, DollarSign, TrendingUp, ArrowUpCircle, ArrowDownCircle, Search, Filter, CreditCard, Send } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from "recharts";

interface Wallet {
  id: string;
  user_id: string;
  balance: string;
  currency: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    user_id: string;
    full_name: string | null;
  } | null;
}

interface WalletTransaction {
  id: string;
  wallet_id: string;
  amount: string;
  transaction_type: string;
  status: string;
  description: string | null;
  reference_id: string | null;
  created_at: string;
}

export function WalletManagement() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [stats, setStats] = useState({ 
    totalBalance: 0, 
    totalDeposits: 0, 
    totalWithdrawals: 0, 
    activeWallets: 0,
    pendingTransactions: 0
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    walletId: "",
    amount: "",
    type: "deposit" as "deposit" | "withdrawal",
    description: "",
  });

  useEffect(() => {
    fetchWallets();
    fetchTransactions();
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

    // Fetch profiles separately
    const userIds = data?.map(item => item.user_id) || [];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .in("user_id", userIds);

    // Merge data
    const mergedData = data?.map(item => ({
      ...item,
      balance: item.balance.toString(), // Keep as string
      profiles: profiles?.find(p => p.user_id === item.user_id) || null
    })) || [];

    const totalBalance = data?.reduce((sum, item) => sum + Number(item.balance || 0), 0) || 0;
    const activeWallets = data?.filter(w => Number(w.balance) > 0).length || 0;

    setStats(prev => ({ 
      ...prev,
      totalBalance, 
      activeWallets 
    }));
    setWallets(mergedData);
  };

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from("wallet_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      toast.error("Failed to fetch transactions");
      return;
    }

    const totalDeposits = data?.filter(t => t.transaction_type === "deposit" && t.status === "completed")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0;
    const totalWithdrawals = data?.filter(t => t.transaction_type === "withdrawal" && t.status === "completed")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0;
    const pendingTransactions = data?.filter(t => t.status === "pending").length || 0;

    setStats(prev => ({
      ...prev,
      totalDeposits: Number(totalDeposits.toFixed(2)),
      totalWithdrawals: Number(totalWithdrawals.toFixed(2)),
      pendingTransactions
    }));
    
    // Ensure amounts are strings
    const mappedTransactions = data?.map(t => ({
      ...t,
      amount: t.amount?.toString() || "0"
    })) || [];
    
    setTransactions(mappedTransactions);
  };

  const handleTransaction = async () => {
    if (!formData.walletId || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amountValue = parseFloat(formData.amount);
    const actualAmount = formData.type === "withdrawal" ? -amountValue : amountValue;

    // Insert transaction
    const { error: txError } = await supabase.from("wallet_transactions").insert([
      {
        wallet_id: formData.walletId,
        amount: Math.abs(amountValue),
        transaction_type: formData.type,
        status: "completed",
        description: formData.description || null,
      },
    ]);

    if (txError) {
      toast.error("Failed to create transaction");
      return;
    }

    // Update wallet balance
    const currentWallet = wallets.find(w => w.id === formData.walletId);
    if (currentWallet) {
      const newBalance = Number(currentWallet.balance) + actualAmount;
      if (newBalance < 0) {
        toast.error("Insufficient balance");
        return;
      }

      const { error: updateError } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("id", formData.walletId);

      if (updateError) {
        toast.error("Failed to update balance");
        return;
      }
    }

    toast.success(`${formData.type === "deposit" ? "Deposit" : "Withdrawal"} completed successfully`);
    setIsDialogOpen(false);
    setFormData({ walletId: "", amount: "", type: "deposit", description: "" });
    fetchWallets();
    fetchTransactions();
  };

  const getStatusColor = (status: string) => {
    const colors = {
      completed: "bg-green-500/10 text-green-500 border-green-500/20",
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      failed: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const filteredWallets = wallets.filter(wallet => {
    const matchesSearch = wallet.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         wallet.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCurrency = currencyFilter === "all" || wallet.currency === currencyFilter;
    return matchesSearch && matchesCurrency;
  });

  const chartData = [
    { name: "Mon", deposits: 1200, withdrawals: 400 },
    { name: "Tue", deposits: 1900, withdrawals: 800 },
    { name: "Wed", deposits: 1500, withdrawals: 600 },
    { name: "Thu", deposits: 2200, withdrawals: 1000 },
    { name: "Fri", deposits: 2800, withdrawals: 1200 },
    { name: "Sat", deposits: 3200, withdrawals: 1500 },
    { name: "Sun", deposits: 2500, withdrawals: 1100 },
  ];

  const balanceTrend = [
    { date: "Week 1", balance: 15000 },
    { date: "Week 2", balance: 18000 },
    { date: "Week 3", balance: 22000 },
    { date: "Week 4", balance: 25000 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-cta bg-clip-text text-transparent">
            Wallet Management System
          </h1>
          <p className="text-muted-foreground mt-1">Manage user wallets and transactions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient shadow-hover">
              <Send className="h-4 w-4 mr-2" />
              New Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Process Wallet Transaction</DialogTitle>
              <DialogDescription>Add or withdraw funds from user wallet</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="walletId">Wallet</Label>
                <Select value={formData.walletId} onValueChange={(value) => setFormData({ ...formData, walletId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.profiles?.full_name || wallet.user_id.slice(0, 8)} - ${Number(wallet.balance).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Transaction Type</Label>
                <Select value={formData.type} onValueChange={(value: "deposit" | "withdrawal") => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">
                      <div className="flex items-center gap-2">
                        <ArrowDownCircle className="h-4 w-4 text-green-500" />
                        Deposit
                      </div>
                    </SelectItem>
                    <SelectItem value="withdrawal">
                      <div className="flex items-center gap-2">
                        <ArrowUpCircle className="h-4 w-4 text-red-500" />
                        Withdrawal
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Transaction details..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="btn-gradient" onClick={handleTransaction}>
                Process Transaction
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="hover-lift glass-effect border-border/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${stats.totalBalance.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">+15%</span>
              <span className="ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift glass-effect border-border/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Deposits</CardTitle>
            <ArrowDownCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${stats.totalDeposits.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-2">Total deposited</p>
          </CardContent>
        </Card>

        <Card className="hover-lift glass-effect border-border/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Withdrawals</CardTitle>
            <ArrowUpCircle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${stats.totalWithdrawals.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-2">Total withdrawn</p>
          </CardContent>
        </Card>

        <Card className="hover-lift glass-effect border-border/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Wallets</CardTitle>
            <WalletIcon className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeWallets}</div>
            <p className="text-xs text-muted-foreground mt-2">With balance</p>
          </CardContent>
        </Card>

        <Card className="hover-lift glass-effect border-border/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <CreditCard className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingTransactions}</div>
            <p className="text-xs text-muted-foreground mt-2">Transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-effect border-border/50">
          <CardHeader>
            <CardTitle>Transaction Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                deposits: { label: "Deposits", color: "hsl(var(--chart-1))" },
                withdrawals: { label: "Withdrawals", color: "hsl(var(--chart-2))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip />
                  <Area type="monotone" dataKey="deposits" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="withdrawals" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="glass-effect border-border/50">
          <CardHeader>
            <CardTitle>Balance Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                balance: { label: "Total Balance", color: "hsl(var(--primary))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={balanceTrend}>
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip />
                  <Line type="monotone" dataKey="balance" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: "hsl(var(--primary))", r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Wallet List */}
      <Card className="glass-effect border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <WalletIcon className="h-5 w-5 text-primary" />
              User Wallets
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search wallets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Currency</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWallets.map((wallet) => {
                const balance = Number(wallet.balance);
                return (
                  <TableRow key={wallet.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {wallet.profiles?.full_name || wallet.user_id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                        <span className="font-bold text-lg">${balance.toFixed(2)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{wallet.currency}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={balance > 0 ? "bg-green-500/10 text-green-500" : "bg-gray-500/10 text-gray-500"} variant="outline">
                        {balance > 0 ? "Active" : "Empty"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(wallet.updated_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="glass-effect border-border/50">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Wallet</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.slice(0, 15).map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.wallet_id.slice(0, 8)}...</TableCell>
                  <TableCell>
                    <span className={transaction.transaction_type === "deposit" ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                      {transaction.transaction_type === "deposit" ? "+" : "-"}${Number(transaction.amount).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={transaction.transaction_type === "deposit" ? "default" : "secondary"}>
                      {transaction.transaction_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(transaction.status)} variant="outline">
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {transaction.description || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
