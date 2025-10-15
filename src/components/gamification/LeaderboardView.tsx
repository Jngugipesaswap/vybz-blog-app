import { useState, useEffect } from "react";
import { Trophy, Medal, Crown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface LeaderboardEntry {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  points: number;
  tier: string;
  total_earned: number;
  achievement_count: number;
  rank: number;
}

export const LeaderboardView = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const fetchLeaderboard = async () => {
    try {
      // Fetch from leaderboard view
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .limit(100);

      if (error) throw error;

      setLeaderboard(data || []);

      // Find current user's rank
      if (user) {
        const currentUser = data?.find(entry => entry.user_id === user.id);
        setUserRank(currentUser || null);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-700" />;
      default:
        return <span className="text-muted-foreground">#{rank}</span>;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-amber-700 text-white';
      case 'silver': return 'bg-gray-400 text-gray-900';
      case 'gold': return 'bg-yellow-400 text-yellow-900';
      case 'platinum': return 'bg-cyan-300 text-cyan-900';
      default: return 'bg-muted';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          Loading leaderboard...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* User's Current Rank Card */}
      {userRank && (
        <Card className="bg-gradient-to-r from-primary/10 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold">{getRankIcon(userRank.rank)}</div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Rank</p>
                  <p className="text-2xl font-bold">#{userRank.rank}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Points</p>
                <p className="text-2xl font-bold text-primary">{userRank.points}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={(v) => setTimeframe(v as any)}>
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">All Time</TabsTrigger>
              <TabsTrigger value="month" className="flex-1">This Month</TabsTrigger>
              <TabsTrigger value="week" className="flex-1">This Week</TabsTrigger>
            </TabsList>

            <TabsContent value={timeframe} className="space-y-2 mt-4">
              {leaderboard.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No leaderboard data yet
                </p>
              ) : (
                <>
                  {/* Top 3 */}
                  {leaderboard.slice(0, 3).map((entry) => (
                    <Card
                      key={entry.user_id}
                      className={`${
                        entry.user_id === user?.id
                          ? 'ring-2 ring-primary'
                          : entry.rank === 1
                          ? 'bg-gradient-to-r from-yellow-500/10 to-transparent'
                          : entry.rank === 2
                          ? 'bg-gradient-to-r from-gray-400/10 to-transparent'
                          : 'bg-gradient-to-r from-amber-700/10 to-transparent'
                      }`}
                    >
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-xl font-bold w-8">
                              {getRankIcon(entry.rank)}
                            </div>
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={entry.avatar_url || undefined} />
                              <AvatarFallback>
                                {entry.full_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">
                                {entry.full_name || 'Anonymous User'}
                                {entry.user_id === user?.id && (
                                  <Badge variant="outline" className="ml-2">You</Badge>
                                )}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Badge className={getTierColor(entry.tier)}>
                                  {entry.tier}
                                </Badge>
                                <span>•</span>
                                <span>{entry.achievement_count} achievements</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-primary">{entry.points}</p>
                            <p className="text-xs text-muted-foreground">points</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Rest of leaderboard */}
                  <div className="space-y-1 mt-4">
                    {leaderboard.slice(3).map((entry) => (
                      <div
                        key={entry.user_id}
                        className={`flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors ${
                          entry.user_id === user?.id ? 'bg-primary/5 ring-1 ring-primary' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground w-8">#{entry.rank}</span>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={entry.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {entry.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {entry.full_name || 'Anonymous User'}
                              {entry.user_id === user?.id && (
                                <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className={getTierColor(entry.tier)}>
                            {entry.tier}
                          </Badge>
                          <span className="text-sm font-semibold">{entry.points}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
