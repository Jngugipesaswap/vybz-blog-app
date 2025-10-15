import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Trophy, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export const GamificationManagement = () => {
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'challenges' | 'achievements'>('challenges');

  // Form state for challenges
  const [challengeForm, setChallengeForm] = useState({
    id: '',
    title: '',
    description: '',
    challenge_type: 'share',
    target_count: 1,
    points_reward: 0,
    badge_reward: '',
    end_date: '',
    is_active: true
  });

  // Form state for achievements
  const [achievementForm, setAchievementForm] = useState({
    id: '',
    name: '',
    description: '',
    icon: '',
    badge_type: 'bronze',
    points_value: 0,
    unlock_criteria: '',
    is_secret: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [challengesRes, achievementsRes] = await Promise.all([
        supabase.from('challenges').select('*').order('created_at', { ascending: false }),
        supabase.from('achievements').select('*').order('created_at', { ascending: false })
      ]);

      if (challengesRes.error) throw challengesRes.error;
      if (achievementsRes.error) throw achievementsRes.error;

      setChallenges(challengesRes.data || []);
      setAchievements(achievementsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load gamification data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChallenge = async () => {
    try {
      const data = {
        ...challengeForm,
        target_count: parseInt(challengeForm.target_count as any),
        points_reward: parseInt(challengeForm.points_reward as any),
        end_date: challengeForm.end_date || null,
        badge_reward: challengeForm.badge_reward || null
      };

      if (editMode) {
        const { error } = await supabase
          .from('challenges')
          .update(data)
          .eq('id', challengeForm.id);
        if (error) throw error;
      } else {
        const { id, ...insertData } = data;
        const { error } = await supabase.from('challenges').insert(insertData);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Challenge ${editMode ? 'updated' : 'created'} successfully`
      });

      setDialogOpen(false);
      resetForms();
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSaveAchievement = async () => {
    try {
      let criteria;
      try {
        criteria = JSON.parse(achievementForm.unlock_criteria);
      } catch {
        toast({
          title: "Invalid JSON",
          description: "Unlock criteria must be valid JSON",
          variant: "destructive"
        });
        return;
      }

      const data = {
        ...achievementForm,
        points_value: parseInt(achievementForm.points_value as any),
        unlock_criteria: criteria
      };

      if (editMode) {
        const { error } = await supabase
          .from('achievements')
          .update(data)
          .eq('id', achievementForm.id);
        if (error) throw error;
      } else {
        const { id, ...insertData } = data;
        const { error } = await supabase.from('achievements').insert(insertData);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Achievement ${editMode ? 'updated' : 'created'} successfully`
      });

      setDialogOpen(false);
      resetForms();
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (type: 'challenge' | 'achievement', id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const table = type === 'challenge' ? 'challenges' : 'achievements';
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;

      toast({
        title: "Deleted",
        description: `${type} deleted successfully`
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const resetForms = () => {
    setChallengeForm({
      id: '',
      title: '',
      description: '',
      challenge_type: 'share',
      target_count: 1,
      points_reward: 0,
      badge_reward: '',
      end_date: '',
      is_active: true
    });
    setAchievementForm({
      id: '',
      name: '',
      description: '',
      icon: '',
      badge_type: 'bronze',
      points_value: 0,
      unlock_criteria: '',
      is_secret: false
    });
    setEditMode(false);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
        <TabsList>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="challenges" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Manage Challenges</h3>
            <Dialog open={dialogOpen && activeTab === 'challenges'} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForms(); setActiveTab('challenges'); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Challenge
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editMode ? 'Edit' : 'Create'} Challenge</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Title</Label>
                    <Input
                      value={challengeForm.title}
                      onChange={(e) => setChallengeForm({ ...challengeForm, title: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <Textarea
                      value={challengeForm.description}
                      onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Type</Label>
                      <Select
                        value={challengeForm.challenge_type}
                        onValueChange={(v) => setChallengeForm({ ...challengeForm, challenge_type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="share">Share</SelectItem>
                          <SelectItem value="upload">Upload</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="attendance">Attendance</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                          <SelectItem value="streak">Streak</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Target Count</Label>
                      <Input
                        type="number"
                        value={challengeForm.target_count}
                        onChange={(e) => setChallengeForm({ ...challengeForm, target_count: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Points Reward</Label>
                      <Input
                        type="number"
                        value={challengeForm.points_reward}
                        onChange={(e) => setChallengeForm({ ...challengeForm, points_reward: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Badge Reward (optional)</Label>
                      <Input
                        value={challengeForm.badge_reward}
                        onChange={(e) => setChallengeForm({ ...challengeForm, badge_reward: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>End Date (optional)</Label>
                    <Input
                      type="date"
                      value={challengeForm.end_date}
                      onChange={(e) => setChallengeForm({ ...challengeForm, end_date: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={challengeForm.is_active}
                      onCheckedChange={(checked) => setChallengeForm({ ...challengeForm, is_active: checked })}
                    />
                    <Label>Active</Label>
                  </div>
                  <Button onClick={handleSaveChallenge}>
                    {editMode ? 'Update' : 'Create'} Challenge
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold">{challenge.title}</h4>
                      <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span>Type: {challenge.challenge_type}</span>
                        <span>Target: {challenge.target_count}</span>
                        <span>Reward: {challenge.points_reward} pts</span>
                        {challenge.end_date && (
                          <span>Ends: {format(new Date(challenge.end_date), 'MMM d, yyyy')}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setChallengeForm({
                            ...challenge,
                            end_date: challenge.end_date ? format(new Date(challenge.end_date), 'yyyy-MM-dd') : ''
                          });
                          setEditMode(true);
                          setDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete('challenge', challenge.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Manage Achievements</h3>
            <Dialog open={dialogOpen && activeTab === 'achievements'} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForms(); setActiveTab('achievements'); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Achievement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editMode ? 'Edit' : 'Create'} Achievement</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Name</Label>
                    <Input
                      value={achievementForm.name}
                      onChange={(e) => setAchievementForm({ ...achievementForm, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <Textarea
                      value={achievementForm.description}
                      onChange={(e) => setAchievementForm({ ...achievementForm, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Icon (emoji)</Label>
                      <Input
                        value={achievementForm.icon}
                        onChange={(e) => setAchievementForm({ ...achievementForm, icon: e.target.value })}
                        placeholder="🏆"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Badge Type</Label>
                      <Select
                        value={achievementForm.badge_type}
                        onValueChange={(v) => setAchievementForm({ ...achievementForm, badge_type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bronze">Bronze</SelectItem>
                          <SelectItem value="silver">Silver</SelectItem>
                          <SelectItem value="gold">Gold</SelectItem>
                          <SelectItem value="platinum">Platinum</SelectItem>
                          <SelectItem value="special">Special</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Points Value</Label>
                    <Input
                      type="number"
                      value={achievementForm.points_value}
                      onChange={(e) => setAchievementForm({ ...achievementForm, points_value: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Unlock Criteria (JSON)</Label>
                    <Textarea
                      value={achievementForm.unlock_criteria}
                      onChange={(e) => setAchievementForm({ ...achievementForm, unlock_criteria: e.target.value })}
                      placeholder='{"action": "signup"}'
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={achievementForm.is_secret}
                      onCheckedChange={(checked) => setAchievementForm({ ...achievementForm, is_secret: checked })}
                    />
                    <Label>Secret Achievement</Label>
                  </div>
                  <Button onClick={handleSaveAchievement}>
                    {editMode ? 'Update' : 'Create'} Achievement
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 flex-1">
                      <span className="text-3xl">{achievement.icon || '🏆'}</span>
                      <div>
                        <h4 className="font-semibold">{achievement.name}</h4>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span>Type: {achievement.badge_type}</span>
                          <span>Value: {achievement.points_value} pts</span>
                          {achievement.is_secret && <span className="text-purple-500">Secret</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAchievementForm({
                            ...achievement,
                            unlock_criteria: JSON.stringify(achievement.unlock_criteria, null, 2)
                          });
                          setEditMode(true);
                          setDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete('achievement', achievement.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
