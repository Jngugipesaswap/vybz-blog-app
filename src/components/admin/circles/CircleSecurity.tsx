import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Lock, Eye, EyeOff, Save, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface CircleSettings {
  id: string;
  name: string;
  privacy_level: string;
  auto_approve_members: boolean;
  require_approval_threshold: number;
  rules: string | null;
}

export function CircleSecurity() {
  const [circles, setCircles] = useState<CircleSettings[]>([]);
  const [selectedCircle, setSelectedCircle] = useState<string>("");
  const [settings, setSettings] = useState<CircleSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCircles();
  }, []);

  useEffect(() => {
    if (selectedCircle) {
      fetchCircleSettings();
    }
  }, [selectedCircle]);

  const fetchCircles = async () => {
    try {
      const { data, error } = await supabase
        .from("circles")
        .select("id, name, privacy_level, auto_approve_members, require_approval_threshold, rules")
        .order("name");

      if (error) throw error;
      setCircles(data || []);
      if (data && data.length > 0) {
        setSelectedCircle(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching circles:", error);
      toast.error("Failed to load circles");
    } finally {
      setLoading(false);
    }
  };

  const fetchCircleSettings = () => {
    const circle = circles.find((c) => c.id === selectedCircle);
    if (circle) {
      setSettings(circle);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    try {
      const { error } = await supabase
        .from("circles")
        .update({
          privacy_level: settings.privacy_level,
          auto_approve_members: settings.auto_approve_members,
          require_approval_threshold: settings.require_approval_threshold,
          rules: settings.rules,
        })
        .eq("id", selectedCircle);

      if (error) throw error;

      toast.success("Settings saved successfully");
      fetchCircles();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    }
  };

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Security & Privacy</h1>
        <p className="text-muted-foreground mt-1">
          Configure privacy settings and access controls for circles
        </p>
      </div>

      {/* Circle Selector */}
      <Card className="glass-effect">
        <CardContent className="pt-6">
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
        </CardContent>
      </Card>

      {/* Privacy Level */}
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <CardTitle>Privacy Level</CardTitle>
          </div>
          <CardDescription>
            Control who can see and join this circle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Privacy Setting</Label>
            <Select
              value={settings.privacy_level}
              onValueChange={(value) =>
                setSettings({ ...settings, privacy_level: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Public</p>
                      <p className="text-xs text-muted-foreground">
                        Anyone can see and join
                      </p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Private</p>
                      <p className="text-xs text-muted-foreground">
                        Visible but requires approval to join
                      </p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="invite_only">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Invite Only</p>
                      <p className="text-xs text-muted-foreground">
                        Hidden, invitation required
                      </p>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <Badge
              variant={
                settings.privacy_level === "public"
                  ? "default"
                  : settings.privacy_level === "private"
                  ? "secondary"
                  : "outline"
              }
            >
              {settings.privacy_level.toUpperCase()}
            </Badge>
            <p className="text-sm text-muted-foreground mt-2">
              {settings.privacy_level === "public" &&
                "This circle is discoverable and anyone can join instantly."}
              {settings.privacy_level === "private" &&
                "This circle appears in search but requires approval to join."}
              {settings.privacy_level === "invite_only" &&
                "This circle is hidden from search and requires an invitation."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Member Approval Settings */}
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Member Approval</CardTitle>
          </div>
          <CardDescription>
            Configure automatic approval rules for new members
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-Approve Members</p>
              <p className="text-sm text-muted-foreground">
                Automatically accept join requests
              </p>
            </div>
            <Switch
              checked={settings.auto_approve_members}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, auto_approve_members: checked })
              }
            />
          </div>

          {!settings.auto_approve_members && (
            <div className="space-y-2">
              <Label>Approval Threshold</Label>
              <Select
                value={settings.require_approval_threshold.toString()}
                onValueChange={(value) =>
                  setSettings({
                    ...settings,
                    require_approval_threshold: parseInt(value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Manual approval for all</SelectItem>
                  <SelectItem value="1">Auto-approve if 1+ mutual circles</SelectItem>
                  <SelectItem value="2">Auto-approve if 2+ mutual circles</SelectItem>
                  <SelectItem value="5">Auto-approve if 5+ mutual circles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Circle Rules */}
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <CardTitle>Community Rules</CardTitle>
          </div>
          <CardDescription>
            Set guidelines for members to follow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Rules (Markdown supported)</Label>
            <Textarea
              placeholder="Enter community rules and guidelines..."
              value={settings.rules || ""}
              onChange={(e) =>
                setSettings({ ...settings, rules: e.target.value })
              }
              rows={8}
              className="font-mono text-sm"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            These rules will be displayed to members when they join the circle
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} size="lg">
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>

      {/* Security Best Practices */}
      <Card className="glass-effect border-primary/20">
        <CardHeader>
          <CardTitle>Security Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Regular Moderation</p>
              <p className="text-sm text-muted-foreground">
                Review flagged content and member reports regularly
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Clear Rules</p>
              <p className="text-sm text-muted-foreground">
                Establish and communicate community guidelines clearly
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Eye className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Privacy Awareness</p>
              <p className="text-sm text-muted-foreground">
                Ensure members understand the circle's privacy level
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
