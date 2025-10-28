import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, UserMinus, Shield, Ban, Search } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CircleMember {
  id: string;
  user_id: string;
  circle_id: string;
  role: string;
  joined_at: string;
  profile: {
    full_name: string;
    avatar_url: string;
  };
  isModerator?: boolean;
  postCount?: number;
  engagementScore?: number;
}

export function CircleMemberManagement() {
  const [circles, setCircles] = useState<any[]>([]);
  const [selectedCircle, setSelectedCircle] = useState<string>("");
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCircles();
  }, []);

  useEffect(() => {
    if (selectedCircle) {
      fetchMembers();
    }
  }, [selectedCircle]);

  const fetchCircles = async () => {
    try {
      const { data, error } = await supabase
        .from("circles")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setCircles(data || []);
      if (data && data.length > 0) {
        setSelectedCircle(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching circles:", error);
      toast.error("Failed to load circles");
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data: membersData, error } = await supabase
        .from("circle_members")
        .select(`
          *,
          profile:profiles!circle_members_user_id_fkey(full_name, avatar_url)
        `)
        .eq("circle_id", selectedCircle)
        .order("joined_at", { ascending: false });

      if (error) throw error;

      // Check if user is moderator
      const enrichedMembers = await Promise.all(
        (membersData || []).map(async (member) => {
          const { data: modData } = await supabase
            .from("circle_moderators")
            .select("id")
            .eq("circle_id", selectedCircle)
            .eq("user_id", member.user_id)
            .single();

          // Get post count
          const { count } = await supabase
            .from("circle_posts")
            .select("*", { count: "exact", head: true })
            .eq("circle_id", selectedCircle)
            .eq("user_id", member.user_id);

          return {
            ...member,
            isModerator: !!modData,
            postCount: count || 0,
            engagementScore: count || 0, // Simplified, could be more complex
          };
        })
      );

      setMembers(enrichedMembers);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToModerator = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("circle_moderators")
        .insert({
          circle_id: selectedCircle,
          user_id: userId,
          assigned_by: user.id,
        });

      if (error) throw error;
      toast.success("User promoted to moderator");
      fetchMembers();
    } catch (error) {
      console.error("Error promoting user:", error);
      toast.error("Failed to promote user");
    }
  };

  const handleRemoveModerator = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("circle_moderators")
        .delete()
        .eq("circle_id", selectedCircle)
        .eq("user_id", userId);

      if (error) throw error;
      toast.success("Moderator status removed");
      fetchMembers();
    } catch (error) {
      console.error("Error removing moderator:", error);
      toast.error("Failed to remove moderator");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from("circle_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
      toast.success("Member removed from circle");
      fetchMembers();
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    }
  };

  const filteredMembers = members.filter((member) =>
    member.profile.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Member Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage members, moderators, and permissions for each circle
        </p>
      </div>

      {/* Circle Selector */}
      <Card className="glass-effect">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={selectedCircle} onValueChange={setSelectedCircle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a circle" />
                </SelectTrigger>
                <SelectContent>
                  {circles.map((circle) => (
                    <SelectItem key={circle.id} value={circle.id}>
                      {circle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="glass-effect">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.profile.avatar_url} />
                    <AvatarFallback>
                      {member.profile.full_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{member.profile.full_name}</CardTitle>
                      {member.isModerator && (
                        <Badge variant="default">
                          <Shield className="h-3 w-3 mr-1" />
                          Moderator
                        </Badge>
                      )}
                      <Badge variant="outline">{member.role}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Joined {new Date(member.joined_at).toLocaleDateString()} • {member.postCount} posts
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!member.isModerator ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePromoteToModerator(member.user_id)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Make Moderator
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveModerator(member.user_id)}
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Remove Moderator
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}

        {filteredMembers.length === 0 && (
          <Card className="glass-effect">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No members found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
