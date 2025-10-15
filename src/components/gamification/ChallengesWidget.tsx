import { useState, useEffect } from "react";
import { Trophy, Target, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_count: number;
  points_reward: number;
  badge_reward: string | null;
  end_date: string | null;
  user_progress?: {
    progress: number;
    completed: boolean;
    completed_at: string | null;
  };
}

export const ChallengesWidget = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchChallenges();
    }
  }, [user]);

  const fetchChallenges = async () => {
    if (!user) return;

    try {
      // Fetch active challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (challengesError) throw challengesError;

      // Fetch user progress
      const { data: progressData } = await supabase
        .from('user_challenges')
        .select('challenge_id, progress, completed, completed_at')
        .eq('user_id', user.id);

      // Merge progress with challenges
      const challengesWithProgress = challengesData.map(challenge => ({
        ...challenge,
        user_progress: progressData?.find(p => p.challenge_id === challenge.id) || {
          progress: 0,
          completed: false,
          completed_at: null
        }
      }));

      setChallenges(challengesWithProgress);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const startChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_challenges')
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          progress: 0,
          completed: false
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already started",
            description: "You've already started this challenge!"
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Challenge accepted!",
        description: "Good luck on your journey!"
      });

      fetchChallenges();
    } catch (error: any) {
      console.error('Error starting challenge:', error);
      toast({
        title: "Error",
        description: "Failed to start challenge",
        variant: "destructive"
      });
    }
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'share': return '📱';
      case 'upload': return '📸';
      case 'review': return '✍️';
      case 'attendance': return '🎟️';
      case 'referral': return '👥';
      case 'streak': return '🔥';
      default: return '🎯';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          Loading challenges...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Active Challenges
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {challenges.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No active challenges at the moment
          </p>
        ) : (
          challenges.map((challenge) => {
            const progress = challenge.user_progress?.progress || 0;
            const progressPercent = (progress / challenge.target_count) * 100;
            const isStarted = challenge.user_progress && challenge.user_progress.progress !== undefined;
            const isCompleted = challenge.user_progress?.completed;

            return (
              <Card key={challenge.id} className={isCompleted ? "bg-muted/50" : ""}>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3 flex-1">
                      <span className="text-3xl">{getChallengeIcon(challenge.challenge_type)}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold flex items-center gap-2">
                          {challenge.title}
                          {isCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
                        </h4>
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <Trophy className="w-3 h-3" />
                      {challenge.points_reward}
                    </Badge>
                  </div>

                  {isStarted && !isCompleted && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {progress} / {challenge.target_count}
                        </span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                    </div>
                  )}

                  {isCompleted && challenge.user_progress?.completed_at && (
                    <div className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Completed {format(new Date(challenge.user_progress.completed_at), 'MMM d, yyyy')}
                    </div>
                  )}

                  {challenge.end_date && !isCompleted && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      Ends {format(new Date(challenge.end_date), 'MMM d, yyyy')}
                    </div>
                  )}

                  {!isStarted && !isCompleted && (
                    <Button
                      size="sm"
                      onClick={() => startChallenge(challenge.id)}
                      className="w-full"
                    >
                      Start Challenge
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
