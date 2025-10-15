import { useState, useEffect } from "react";
import { Flame, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Streak {
  id: string;
  streak_type: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

export const StreakTracker = () => {
  const { user } = useAuth();
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStreaks();
    }
  }, [user]);

  const fetchStreaks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      setStreaks(data || []);
    } catch (error) {
      console.error('Error fetching streaks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStreakLabel = (type: string) => {
    switch (type) {
      case 'daily_login': return 'Daily Login';
      case 'content_upload': return 'Content Upload';
      case 'review_writing': return 'Review Writing';
      default: return type;
    }
  };

  const getStreakIcon = (type: string) => {
    switch (type) {
      case 'daily_login': return '🎯';
      case 'content_upload': return '📸';
      case 'review_writing': return '✍️';
      default: return '🔥';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Loading streaks...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="w-5 h-5 text-orange-500" />
          Your Streaks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {streaks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Start your first streak today!
          </p>
        ) : (
          streaks.map((streak) => (
            <div
              key={streak.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getStreakIcon(streak.streak_type)}</span>
                <div>
                  <p className="font-medium text-sm">{getStreakLabel(streak.streak_type)}</p>
                  <p className="text-xs text-muted-foreground">
                    Best: {streak.longest_streak} days
                  </p>
                </div>
              </div>
              <Badge
                variant={streak.current_streak > 0 ? "default" : "secondary"}
                className="gap-1"
              >
                <Flame className="w-3 h-3" />
                {streak.current_streak}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
