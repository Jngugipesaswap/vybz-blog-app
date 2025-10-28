import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Zap, Bell, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Automation {
  id: string;
  circle_id: string;
  trigger_type: string;
  action_type: string;
  message_template: string;
  is_active: boolean;
  conditions: any;
  circle?: { name: string };
}

const triggerTypes = [
  { value: "new_member", label: "New Member Joins" },
  { value: "high_activity", label: "High Activity Spike" },
  { value: "inactive_member", label: "Inactive Member" },
  { value: "event_live", label: "Event Goes Live" },
];

const actionTypes = [
  { value: "send_notification", label: "Send Push Notification", icon: Bell },
  { value: "send_message", label: "Send In-App Message", icon: MessageSquare },
  { value: "send_email", label: "Send Email", icon: Mail },
];

export function CircleAutomation() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [circles, setCircles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [newAutomation, setNewAutomation] = useState({
    circle_id: "",
    trigger_type: "new_member",
    action_type: "send_notification",
    message_template: "",
    conditions: {},
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [automationsRes, circlesRes] = await Promise.all([
        supabase
          .from("circle_automation")
          .select("*, circle:circles(name)")
          .order("created_at", { ascending: false }),
        supabase.from("circles").select("id, name").order("name"),
      ]);

      if (automationsRes.error) throw automationsRes.error;
      if (circlesRes.error) throw circlesRes.error;

      setAutomations(automationsRes.data || []);
      setCircles(circlesRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load automation data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAutomation = async () => {
    try {
      const { error } = await supabase
        .from("circle_automation")
        .insert([newAutomation]);

      if (error) throw error;

      toast.success("Automation created successfully");
      setShowDialog(false);
      setNewAutomation({
        circle_id: "",
        trigger_type: "new_member",
        action_type: "send_notification",
        message_template: "",
        conditions: {},
      });
      fetchData();
    } catch (error) {
      console.error("Error creating automation:", error);
      toast.error("Failed to create automation");
    }
  };

  const toggleAutomation = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from("circle_automation")
        .update({ is_active: !currentState })
        .eq("id", id);

      if (error) throw error;

      toast.success(
        !currentState ? "Automation activated" : "Automation deactivated"
      );
      fetchData();
    } catch (error) {
      console.error("Error toggling automation:", error);
      toast.error("Failed to toggle automation");
    }
  };

  const getActionIcon = (actionType: string) => {
    const action = actionTypes.find((a) => a.value === actionType);
    return action ? action.icon : Bell;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Automation System</h1>
          <p className="text-muted-foreground mt-1">
            Set up automated triggers and actions for circles
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Automation
        </Button>
      </div>

      {/* Active Automations */}
      <div className="grid grid-cols-1 gap-4">
        {automations.map((automation) => {
          const ActionIcon = getActionIcon(automation.action_type);
          const trigger = triggerTypes.find((t) => t.value === automation.trigger_type);

          return (
            <Card key={automation.id} className="glass-effect">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">
                        {trigger?.label || automation.trigger_type}
                      </CardTitle>
                      <Badge variant={automation.is_active ? "default" : "secondary"}>
                        {automation.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1">
                      Circle: {automation.circle?.name}
                    </CardDescription>
                  </div>
                  <Switch
                    checked={automation.is_active}
                    onCheckedChange={() =>
                      toggleAutomation(automation.id, automation.is_active)
                    }
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <ActionIcon className="h-4 w-4 text-primary mt-1" />
                    <div>
                      <p className="text-sm font-medium">Action</p>
                      <p className="text-sm text-muted-foreground">
                        {actionTypes.find((a) => a.value === automation.action_type)?.label}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Message Template</p>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                      {automation.message_template || "No message template"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {automations.length === 0 && (
          <Card className="glass-effect">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No automations configured yet</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Automation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Automation</DialogTitle>
            <DialogDescription>
              Set up automated actions based on circle events
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Circle</Label>
              <Select
                value={newAutomation.circle_id}
                onValueChange={(value) =>
                  setNewAutomation({ ...newAutomation, circle_id: value })
                }
              >
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

            <div>
              <Label>Trigger Event</Label>
              <Select
                value={newAutomation.trigger_type}
                onValueChange={(value) =>
                  setNewAutomation({ ...newAutomation, trigger_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {triggerTypes.map((trigger) => (
                    <SelectItem key={trigger.value} value={trigger.value}>
                      {trigger.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Action</Label>
              <Select
                value={newAutomation.action_type}
                onValueChange={(value) =>
                  setNewAutomation({ ...newAutomation, action_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {actionTypes.map((action) => (
                    <SelectItem key={action.value} value={action.value}>
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Message Template</Label>
              <Textarea
                placeholder="Enter the message to send..."
                value={newAutomation.message_template}
                onChange={(e) =>
                  setNewAutomation({
                    ...newAutomation,
                    message_template: e.target.value,
                  })
                }
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                You can use variables like {"{user_name}"} and {"{circle_name}"}
              </p>
            </div>

            <Button
              onClick={handleCreateAutomation}
              className="w-full"
              disabled={!newAutomation.circle_id || !newAutomation.message_template}
            >
              Create Automation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
