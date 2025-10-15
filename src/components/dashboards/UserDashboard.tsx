import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  User, Heart, MessageSquare, TrendingUp, Award, 
  Calendar, BarChart3, Coins, Wallet, Trophy, ArrowLeft, LogOut
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import { WalletDialog } from "./WalletDialog";
import { RedeemPointsDialog } from "./RedeemPointsDialog";
import { EditProfileDialog } from "./EditProfileDialog";
import ManageSocialLinksDialog from "./ManageSocialLinksDialog";
import SocialLinksDisplay from "@/components/SocialLinksDisplay";
import { ChallengesWidget } from "@/components/gamification/ChallengesWidget";
import { AchievementsList } from "@/components/gamification/AchievementsList";
import { LeaderboardView } from "@/components/gamification/LeaderboardView";
import { StreakTracker } from "@/components/gamification/StreakTracker";

interface UserStats {
  commentsCount: number;
  reactionsCount: number;
  loyaltyPoints: number;
  walletBalance: number;
  tier: string;
  joinedDays: number;
}

interface ActivityData {
  date: string;
  comments: number;
  reactions: number;
}

export function UserDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast: toastHook } = useToast();
  const [stats, setStats] = useState<UserStats>({
    commentsCount: 0,
    reactionsCount: 0,
    loyaltyPoints: 0,
    walletBalance: 0,
    tier: 'bronze',
    joinedDays: 0
  });
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [redeemPointsDialogOpen, setRedeemPointsDialogOpen] = useState(false);
  const [editProfileDialogOpen, setEditProfileDialogOpen] = useState(false);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toastHook({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toastHook({
        title: "Signed Out",
        description: "You've been successfully signed out.",
      });
      navigate("/");
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      setProfile(profileData);

      // Fetch comments count
      const { count: commentsCount } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);

      // Fetch reactions count
      const { count: reactionsCount } = await supabase
        .from("post_reactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);

      // Fetch loyalty points
      const { data: loyaltyData } = await supabase
        .from("loyalty_points")
        .select("points, tier")
        .eq("user_id", user!.id)
        .single();

      // Fetch wallet balance
      const { data: walletData } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user!.id)
        .single();

      // Fetch social links
      const { data: socialLinksData } = await supabase
        .from("social_links")
        .select("*")
        .eq("user_id", user!.id);
      
      setSocialLinks(socialLinksData || []);

      // Calculate days since joining
      const joinDate = new Date(profileData?.created_at || Date.now());
      const joinedDays = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));

      setStats({
        commentsCount: commentsCount || 0,
        reactionsCount: reactionsCount || 0,
        loyaltyPoints: loyaltyData?.points || 0,
        walletBalance: parseFloat(String(walletData?.balance || 0)),
        tier: loyaltyData?.tier || 'bronze',
        joinedDays
      });

      // Generate mock activity data for the last 7 days
      const mockActivity = Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        comments: Math.floor(Math.random() * 5),
        reactions: Math.floor(Math.random() * 10)
      }));
      setActivityData(mockActivity);

    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'platinum': return 'from-slate-400 to-slate-600';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'silver': return 'from-gray-300 to-gray-500';
      default: return 'from-orange-400 to-orange-600';
    }
  };

  const tierProgress = () => {
    const tiers = ['bronze', 'silver', 'gold', 'platinum'];
    const currentIndex = tiers.indexOf(stats.tier.toLowerCase());
    return ((currentIndex + 1) / tiers.length) * 100;
  };

  const engagementData = [
    { name: 'Comments', value: stats.commentsCount, color: '#3b82f6' },
    { name: 'Reactions', value: stats.reactionsCount, color: '#ec4899' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg cta-gradient flex items-center justify-center">
                <span className="text-white font-bold">V</span>
              </div>
              <span className="font-bold">User Dashboard</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="p-6 space-y-6">{/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome Back, {profile?.full_name || 'User'}!
          </h1>
          <p className="text-muted-foreground mt-2">Track your engagement and rewards</p>
        </div>
        <Avatar className="h-16 w-16 ring-2 ring-primary/20">
          <AvatarImage src={profile?.avatar_url} />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
            <User className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Comments Posted</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{stats.commentsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Your contributions</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reactions Given</CardTitle>
            <Heart className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-500">{stats.reactionsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Content you loved</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
            <Coins className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">{stats.loyaltyPoints}</div>
            <p className="text-xs text-muted-foreground mt-1">Rewards earned</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">${stats.walletBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Available funds</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList className="grid w-full max-w-3xl grid-cols-5">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Your Activity Trends
              </CardTitle>
              <CardDescription>Last 7 days engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))' 
                    }} 
                  />
                  <Line type="monotone" dataKey="comments" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="reactions" stroke="#ec4899" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Engagement Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={engagementData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {engagementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-4">
          <Card className={`relative overflow-hidden bg-gradient-to-br ${getTierColor(stats.tier)}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="h-6 w-6" />
                    {stats.tier.toUpperCase()} Member
                  </CardTitle>
                  <CardDescription className="text-white/80 mt-2">
                    Your current tier level
                  </CardDescription>
                </div>
                <Award className="h-16 w-16 text-white/20" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-white text-sm">
                  <span>Tier Progress</span>
                  <span>{tierProgress().toFixed(0)}%</span>
                </div>
                <Progress value={tierProgress()} className="bg-white/20" />
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-amber-500" />
                  Loyalty Points
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold text-amber-500">{stats.loyaltyPoints}</div>
                <Button 
                  className="w-full" 
                  onClick={() => setRedeemPointsDialogOpen(true)}
                  disabled={stats.loyaltyPoints < 100}
                >
                  Redeem Points
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-green-500" />
                  Wallet Balance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold text-green-500">${stats.walletBalance.toFixed(2)}</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setDepositDialogOpen(true)}
                  >
                    Deposit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setWithdrawDialogOpen(true)}
                    disabled={stats.walletBalance === 0}
                  >
                    Withdraw
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <ChallengesWidget />
            <div className="space-y-4">
              <StreakTracker />
              <AchievementsList />
            </div>
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <LeaderboardView />
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 ring-4 ring-primary/20">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold">{profile?.full_name || 'User'}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <Badge className={`bg-gradient-to-r ${getTierColor(stats.tier)}`}>
                    {stats.tier.toUpperCase()} Tier
                  </Badge>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Member for</span>
                  </div>
                  <p className="font-semibold">{stats.joinedDays} days</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Total Engagement</span>
                  </div>
                  <p className="font-semibold">{stats.commentsCount + stats.reactionsCount} actions</p>
                </div>
              </div>

              {socialLinks.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Social Media</p>
                  <SocialLinksDisplay socialLinks={socialLinks} size="md" />
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <Button className="flex-1" onClick={() => setEditProfileDialogOpen(true)}>
                  Edit Profile
                </Button>
                <ManageSocialLinksDialog />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>

      {/* Dialogs */}
      <WalletDialog
        open={depositDialogOpen}
        onOpenChange={setDepositDialogOpen}
        type="deposit"
        currentBalance={stats.walletBalance}
        userId={user!.id}
        onSuccess={fetchUserData}
      />

      <WalletDialog
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
        type="withdraw"
        currentBalance={stats.walletBalance}
        userId={user!.id}
        onSuccess={fetchUserData}
      />

      <RedeemPointsDialog
        open={redeemPointsDialogOpen}
        onOpenChange={setRedeemPointsDialogOpen}
        currentPoints={stats.loyaltyPoints}
        userId={user!.id}
        onSuccess={fetchUserData}
      />

      <EditProfileDialog
        open={editProfileDialogOpen}
        onOpenChange={setEditProfileDialogOpen}
        userId={user!.id}
        currentName={profile?.full_name}
        currentAvatarUrl={profile?.avatar_url}
        onSuccess={fetchUserData}
      />
    </div>
  );
}