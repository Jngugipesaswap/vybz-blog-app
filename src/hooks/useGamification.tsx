import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type ChallengeType = 'share' | 'upload' | 'review' | 'attendance' | 'referral' | 'streak';

export const useGamification = (userId?: string) => {
  const { toast } = useToast();

  const updateChallengeProgress = useCallback(async (
    challengeType: ChallengeType,
    increment: number = 1
  ) => {
    if (!userId) return;

    try {
      // Get active challenges of this type
      const { data: challenges, error: challengesError } = await supabase
        .from('challenges')
        .select('id, target_count, points_reward, badge_reward')
        .eq('challenge_type', challengeType)
        .eq('is_active', true);

      if (challengesError) throw challengesError;
      if (!challenges || challenges.length === 0) return;

      // Update progress for each active challenge
      for (const challenge of challenges) {
        // Get or create user challenge
        const { data: userChallenge, error: fetchError } = await supabase
          .from('user_challenges')
          .select('id, progress, completed')
          .eq('user_id', userId)
          .eq('challenge_id', challenge.id)
          .maybeSingle();

        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

        if (!userChallenge) {
          // Create new user challenge
          await supabase
            .from('user_challenges')
            .insert({
              user_id: userId,
              challenge_id: challenge.id,
              progress: increment,
              completed: increment >= challenge.target_count
            });
        } else if (!userChallenge.completed) {
          // Update existing challenge
          const newProgress = userChallenge.progress + increment;
          const isCompleted = newProgress >= challenge.target_count;

          await supabase
            .from('user_challenges')
            .update({
              progress: newProgress,
              completed: isCompleted,
              completed_at: isCompleted ? new Date().toISOString() : null
            })
            .eq('id', userChallenge.id);

          // If completed, award points
          if (isCompleted && !userChallenge.completed) {
            await awardPoints(challenge.points_reward);
            
            toast({
              title: "Challenge Completed! 🎉",
              description: `You earned ${challenge.points_reward} points!`
            });
          }
        }
      }
    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }
  }, [userId, toast]);

  const awardPoints = useCallback(async (points: number) => {
    if (!userId) return;

    try {
      // Get current loyalty points
      const { data: loyaltyData, error: fetchError } = await supabase
        .from('loyalty_points')
        .select('points, total_earned')
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;

      // Update points
      const newPoints = loyaltyData.points + points;
      const newTotalEarned = loyaltyData.total_earned + points;

      await supabase
        .from('loyalty_points')
        .update({
          points: newPoints,
          total_earned: newTotalEarned
        })
        .eq('user_id', userId);

      // Log transaction
      await supabase
        .from('loyalty_transactions')
        .insert({
          user_id: userId,
          points: points,
          transaction_type: 'earned',
          description: 'Challenge completion reward'
        });
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  }, [userId]);

  const checkAndUnlockAchievement = useCallback(async (
    achievementId: string
  ) => {
    if (!userId) return;

    try {
      // Check if already unlocked
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .maybeSingle();

      if (existing) return;

      // Get achievement details
      const { data: achievement, error: achievementError } = await supabase
        .from('achievements')
        .select('name, points_value')
        .eq('id', achievementId)
        .single();

      if (achievementError) throw achievementError;

      // Unlock achievement
      await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId
        });

      // Award points
      if (achievement.points_value > 0) {
        await awardPoints(achievement.points_value);
      }

      toast({
        title: "Achievement Unlocked! 🏆",
        description: `${achievement.name} - ${achievement.points_value} points!`
      });
    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  }, [userId, awardPoints, toast]);

  const updateStreak = useCallback(async (
    streakType: 'daily_login' | 'content_upload' | 'review_writing'
  ) => {
    if (!userId) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      // Get or create streak
      const { data: streak, error: fetchError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .eq('streak_type', streakType)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (!streak) {
        // Create new streak
        await supabase
          .from('user_streaks')
          .insert({
            user_id: userId,
            streak_type: streakType,
            current_streak: 1,
            longest_streak: 1,
            last_activity_date: today
          });
      } else {
        const lastDate = new Date(streak.last_activity_date);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          // Same day, no update needed
          return;
        } else if (diffDays === 1) {
          // Consecutive day, increment streak
          const newStreak = streak.current_streak + 1;
          const newLongest = Math.max(newStreak, streak.longest_streak);

          await supabase
            .from('user_streaks')
            .update({
              current_streak: newStreak,
              longest_streak: newLongest,
              last_activity_date: today
            })
            .eq('id', streak.id);

          // Award milestone points
          if (newStreak % 7 === 0) {
            await awardPoints(50);
            toast({
              title: `${newStreak} Day Streak! 🔥`,
              description: "You earned 50 bonus points!"
            });
          }
        } else {
          // Streak broken, reset
          await supabase
            .from('user_streaks')
            .update({
              current_streak: 1,
              last_activity_date: today
            })
            .eq('id', streak.id);
        }
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  }, [userId, awardPoints, toast]);

  return {
    updateChallengeProgress,
    awardPoints,
    checkAndUnlockAchievement,
    updateStreak
  };
};
