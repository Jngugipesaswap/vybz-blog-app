import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell, Send, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const NotificationManagement = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [targetUser, setTargetUser] = useState<string>("all");
  const [users, setUsers] = useState<Array<{ id: string; full_name: string; email: string }>>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .limit(100);

      if (error) throw error;

      // Get user emails from auth
      const userIds = profilesData?.map(p => p.user_id) || [];
      const usersWithEmails = await Promise.all(
        userIds.slice(0, 20).map(async (userId) => {
          const profile = profilesData?.find(p => p.user_id === userId);
          return {
            id: userId,
            full_name: profile?.full_name || 'Unknown',
            email: `User ${userId.slice(0, 8)}`
          };
        })
      );

      setUsers(usersWithEmails);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const sendNotification = async () => {
    if (!title || !message) {
      toast.error('Please fill in all fields');
      return;
    }

    setSending(true);
    try {
      if (targetUser === 'all') {
        // Send to all users
        const userIds = users.map(u => u.id);
        const notifications = userIds.map(userId => ({
          user_id: userId,
          type,
          title,
          message,
          metadata: { sent_by: 'admin', broadcast: true }
        }));

        const { error } = await supabase
          .from('notifications')
          .insert(notifications);

        if (error) throw error;
        toast.success(`Notification sent to ${userIds.length} users`);
      } else {
        // Send to specific user
        const { error } = await supabase
          .from('notifications')
          .insert({
            user_id: targetUser,
            type,
            title,
            message,
            metadata: { sent_by: 'admin' }
          });

        if (error) throw error;
        toast.success('Notification sent successfully');
      }

      // Reset form
      setTitle("");
      setMessage("");
      setType("info");
      setTargetUser("all");
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Notification Management</h2>
        <p className="text-muted-foreground">
          Send notifications to users
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Send Notification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="target">Target Users</Label>
            <Select value={targetUser} onValueChange={setTargetUser}>
              <SelectTrigger id="target">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    All Users ({users.length})
                  </div>
                </SelectItem>
                {users.slice(0, 20).map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Notification Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="alert">Alert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Notification title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Notification message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          <Button 
            onClick={sendNotification} 
            disabled={sending}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            {sending ? 'Sending...' : 'Send Notification'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">info</Badge>
              <span className="text-sm text-muted-foreground">General information</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">success</Badge>
              <span className="text-sm text-muted-foreground">Success messages</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">warning</Badge>
              <span className="text-sm text-muted-foreground">Warning messages</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">alert</Badge>
              <span className="text-sm text-muted-foreground">Important alerts</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
