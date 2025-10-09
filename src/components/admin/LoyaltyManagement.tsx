import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, Award, Gift, Plus, Minus, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts";

interface LoyaltyUser {
  id: string;
  user_id: string;
  points: number;
  tier: string;
  total_earned: number;
  total_spent: number;
  updated_at: string;
  profiles?: {
    user_id: string;
    full_name: string | null;
  } | null;
}

interface Transaction {
  id: string;
  user_id: string;
  points: number;
  transaction_type: string;
  description: string | null;
  created_at: string;
}

export function LoyaltyManagement() {
  const [loyaltyUsers, setLoyaltyUsers] = useState<LoyaltyUser[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({ total: 0, totalEarned: 0, totalSpent: 0, transactionCount: 0 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<LoyaltyUser | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    userId: "",
    points: "",
    type: "earn" as "earn" | "spend",
    description: "",
  });

  useEffect(() => {
    fetchLoyaltyData();
    fetchTransactions();
  }, []);

  const fetchLoyaltyData = async () => {
    const { data, error } = await supabase
      .from("loyalty_points")
      .select("*")
      .order("points", { ascending: false });

    if (error) {
      toast.error("Failed to fetch loyalty data");
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
      profiles: profiles?.find(p => p.user_id === item.user_id) || null
    })) || [];

    const totalPoints = data?.reduce((sum, item) => sum + (item.points || 0), 0) || 0;
    const totalEarned = data?.reduce((sum, item) => sum + (item.total_earned || 0), 0) || 0;
    const totalSpent = data?.reduce((sum, item) => sum + (item.total_spent || 0), 0) || 0;

    setStats({ 
      total: totalPoints, 
      totalEarned, 
      totalSpent, 
      transactionCount: transactions.length 
    });
    setLoyaltyUsers(mergedData);
  };

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from("loyalty_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      toast.error("Failed to fetch transactions");
      return;
    }

    setTransactions(data || []);
    setStats(prev => ({ ...prev, transactionCount: data?.length || 0 }));
  };

  const handleAddPoints = async () => {
    if (!formData.userId || !formData.points) {
      toast.error("Please fill in all required fields");
      return;
    }

    const pointsValue = parseInt(formData.points);
    const actualPoints = formData.type === "spend" ? -pointsValue : pointsValue;

    // Insert transaction
    const { error: txError } = await supabase.from("loyalty_transactions").insert([
      {
        user_id: formData.userId,
        points: actualPoints,
        transaction_type: formData.type,
        description: formData.description || null,
      },
    ]);

    if (txError) {
      toast.error("Failed to create transaction");
      return;
    }

    // Update user points
    const currentUser = loyaltyUsers.find(u => u.user_id === formData.userId);
    if (currentUser) {
      const newPoints = currentUser.points + actualPoints;
      const { error: updateError } = await supabase
        .from("loyalty_points")
        .update({
          points: Math.max(0, newPoints),
          total_earned: formData.type === "earn" ? currentUser.total_earned + pointsValue : currentUser.total_earned,
          total_spent: formData.type === "spend" ? currentUser.total_spent + pointsValue : currentUser.total_spent,
        })
        .eq("user_id", formData.userId);

      if (updateError) {
        toast.error("Failed to update points");
        return;
      }
    }

    toast.success(`Points ${formData.type === "earn" ? "added" : "deducted"} successfully`);
    setIsDialogOpen(false);
    setFormData({ userId: "", points: "", type: "earn", description: "" });
    fetchLoyaltyData();
    fetchTransactions();
  };

  const getTierColor = (tier: string) => {
    const colors = {
      bronze: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      silver: "bg-gray-400/10 text-gray-400 border-gray-400/20",
      gold: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      platinum: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    };
    return colors[tier as keyof typeof colors] || colors.bronze;
  };

  const getTierProgress = (points: number) => {
    if (points >= 10000) return 100;
    if (points >= 5000) return ((points - 5000) / 5000) * 100;
    if (points >= 1000) return ((points - 1000) / 4000) * 100;
    return (points / 1000) * 100;
  };

  const getNextTier = (tier: string, points: number) => {
    const tiers = { bronze: 1000, silver: 5000, gold: 10000, platinum: Infinity };
    const tierOrder = ["bronze", "silver", "gold", "platinum"];
    const currentIndex = tierOrder.indexOf(tier);
    const nextTierName = tierOrder[currentIndex + 1];
    if (!nextTierName) return null;
    return { name: nextTierName, pointsNeeded: tiers[nextTierName as keyof typeof tiers] - points };
  };

  const filteredUsers = loyaltyUsers.filter(user => {
    const matchesSearch = user.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === "all" || user.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const chartData = [
    { name: "Mon", earned: 120, spent: 50 },
    { name: "Tue", earned: 200, spent: 80 },
    { name: "Wed", earned: 150, spent: 60 },
    { name: "Thu", earned: 280, spent: 120 },
    { name: "Fri", earned: 350, spent: 150 },
    { name: "Sat", earned: 400, spent: 180 },
    { name: "Sun", earned: 300, spent: 140 },
  ];

  const tierDistribution = [
    { tier: "Bronze", count: loyaltyUsers.filter(u => u.tier === "bronze").length },
    { tier: "Silver", count: loyaltyUsers.filter(u => u.tier === "silver").length },
    { tier: "Gold", count: loyaltyUsers.filter(u => u.tier === "gold").length },
    { tier: "Platinum", count: loyaltyUsers.filter(u => u.tier === "platinum").length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-cta bg-clip-text text-transparent">
            Loyalty Points System
          </h1>
          <p className="text-muted-foreground mt-1">Reward your users and track engagement</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient shadow-hover">
              <Gift className="h-4 w-4 mr-2" />
              Manage Points
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add/Deduct Loyalty Points</DialogTitle>
              <DialogDescription>Manage user loyalty points and rewards</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="userId">User</Label>
                <Select value={formData.userId} onValueChange={(value) => setFormData({ ...formData, userId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {loyaltyUsers.map((user) => (
                      <SelectItem key={user.user_id} value={user.user_id}>
                        {user.profiles?.full_name || user.user_id.slice(0, 8)} - {user.points} pts
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Transaction Type</Label>
                <Select value={formData.type} onValueChange={(value: "earn" | "spend") => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="earn">
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-green-500" />
                        Add Points
                      </div>
                    </SelectItem>
                    <SelectItem value="spend">
                      <div className="flex items-center gap-2">
                        <Minus className="h-4 w-4 text-red-500" />
                        Deduct Points
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="points">Points Amount</Label>
                <Input
                  id="points"
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                  placeholder="Enter points"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Reason for transaction..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="btn-gradient" onClick={handleAddPoints}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover-lift glass-effect border-border/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Points</CardTitle>
            <Trophy className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">+18%</span>
              <span className="ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift glass-effect border-border/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earned</CardTitle>
            <Plus className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalEarned.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-2">Points awarded</p>
          </CardContent>
        </Card>

        <Card className="hover-lift glass-effect border-border/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
            <Minus className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-2">Points redeemed</p>
          </CardContent>
        </Card>

        <Card className="hover-lift glass-effect border-border/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
            <Award className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.transactionCount}</div>
            <p className="text-xs text-muted-foreground mt-2">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-effect border-border/50">
          <CardHeader>
            <CardTitle>Points Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                earned: { label: "Earned", color: "hsl(var(--chart-1))" },
                spent: { label: "Spent", color: "hsl(var(--chart-2))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip />
                  <Area type="monotone" dataKey="earned" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="spent" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="glass-effect border-border/50">
          <CardHeader>
            <CardTitle>Tier Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: { label: "Users", color: "hsl(var(--primary))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tierDistribution}>
                  <XAxis dataKey="tier" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card className="glass-effect border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              User Loyalty Points
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="bronze">Bronze</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
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
                <TableHead>Points</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Earned</TableHead>
                <TableHead>Spent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const nextTier = getNextTier(user.tier, user.points);
                return (
                  <TableRow key={user.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedUser(user)}>
                    <TableCell className="font-medium">
                      {user.profiles?.full_name || user.user_id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="font-bold">{user.points.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTierColor(user.tier)} variant="outline">
                        {user.tier.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="min-w-[200px]">
                      <div className="space-y-1">
                        <Progress value={getTierProgress(user.points)} className="h-2" />
                        {nextTier && (
                          <p className="text-xs text-muted-foreground">
                            {nextTier.pointsNeeded} pts to {nextTier.name}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-green-600">+{user.total_earned.toLocaleString()}</TableCell>
                    <TableCell className="text-red-600">-{user.total_spent.toLocaleString()}</TableCell>
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
                <TableHead>User</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.slice(0, 10).map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.user_id.slice(0, 8)}...</TableCell>
                  <TableCell>
                    <span className={transaction.points > 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                      {transaction.points > 0 ? "+" : ""}{transaction.points}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={transaction.transaction_type === "earn" ? "default" : "secondary"}>
                      {transaction.transaction_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{transaction.description || "—"}</TableCell>
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
