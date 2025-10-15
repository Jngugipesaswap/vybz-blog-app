import { useState, useEffect } from "react";
import { Award, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  badge_type: string;
  points_value: number;
  is_secret: boolean;
  unlocked_at?: string;
}

export const AchievementsList = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAchievements();
    }
  }, [user]);

  const fetchAchievements = async () => {
    if (!user) return;

    try {
      // Fetch all achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('badge_type', { ascending: true });

      if (achievementsError) throw achievementsError;

      // Fetch user's unlocked achievements
      const { data: unlockedData, error: unlockedError } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', user.id);

      if (unlockedError) throw unlockedError;

      // Create a map of unlocked achievements
      const unlockedMap = new Map(
        unlockedData?.map(ua => [ua.achievement_id, ua.unlocked_at]) || []
      );

      // Merge data
      const achievementsWithStatus = achievementsData.map(achievement => ({
        ...achievement,
        unlocked_at: unlockedMap.get(achievement.id)
      }));

      setAchievements(achievementsWithStatus);
      setUnlockedIds(new Set(unlockedMap.keys()));
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'bronze': return 'bg-amber-700 text-white';
      case 'silver': return 'bg-gray-400 text-gray-900';
      case 'gold': return 'bg-yellow-400 text-yellow-900';
      case 'platinum': return 'bg-cyan-300 text-cyan-900';
      case 'special': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      default: return 'bg-muted';
    }
  };

  const unlocked = achievements.filter(a => unlockedIds.has(a.id));
  const locked = achievements.filter(a => !unlockedIds.has(a.id) && !a.is_secret);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          Loading achievements...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Achievements ({unlocked.length}/{achievements.filter(a => !a.is_secret).length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="unlocked">
          <TabsList className="w-full">
            <TabsTrigger value="unlocked" className="flex-1">
              Unlocked ({unlocked.length})
            </TabsTrigger>
            <TabsTrigger value="locked" className="flex-1">
              Locked ({locked.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unlocked" className="space-y-3 mt-4">
            {unlocked.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No achievements unlocked yet. Complete challenges to earn badges!
              </p>
            ) : (
              unlocked.map((achievement) => (
                <Card key={achievement.id} className="bg-gradient-to-r from-primary/5 to-transparent">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{achievement.icon || '🏆'}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold">{achievement.name}</h4>
                          <Badge className={getBadgeColor(achievement.badge_type)}>
                            {achievement.badge_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {achievement.description}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Unlocked {format(new Date(achievement.unlocked_at!), 'MMM d, yyyy')}
                          </span>
                          <span className="font-medium text-primary">
                            +{achievement.points_value} points
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="locked" className="space-y-3 mt-4">
            {locked.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                You've unlocked all available achievements! 🎉
              </p>
            ) : (
              locked.map((achievement) => (
                <Card key={achievement.id} className="opacity-60">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl grayscale">
                        <Lock className="w-10 h-10" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold">{achievement.name}</h4>
                          <Badge variant="outline" className={getBadgeColor(achievement.badge_type)}>
                            {achievement.badge_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {achievement.description}
                        </p>
                        <span className="text-xs font-medium text-muted-foreground">
                          Reward: {achievement.points_value} points
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
