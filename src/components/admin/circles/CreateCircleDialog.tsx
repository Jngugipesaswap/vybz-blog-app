import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CreateCircleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateCircleDialog({ open, onOpenChange, onSuccess }: CreateCircleDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    circle_type: "topic",
    privacy_level: "public",
    rules: "",
    event_id: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Circle name is required");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      const { error } = await supabase.from("circles").insert({
        name: formData.name,
        description: formData.description || null,
        circle_type: formData.circle_type,
        privacy_level: formData.privacy_level,
        rules: formData.rules || null,
        event_id: formData.event_id || null,
        created_by: user.id,
      });

      if (error) throw error;

      toast.success("Circle created successfully!");
      setFormData({
        name: "",
        description: "",
        circle_type: "topic",
        privacy_level: "public",
        rules: "",
        event_id: "",
      });
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error creating circle:", error);
      toast.error(error.message || "Failed to create circle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Circle</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Circle Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter circle name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this circle is about"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="circle_type">Circle Type</Label>
              <Select
                value={formData.circle_type}
                onValueChange={(value) => setFormData({ ...formData, circle_type: value })}
              >
                <SelectTrigger id="circle_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="topic">Topic</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="artist">Artist</SelectItem>
                  <SelectItem value="venue">Venue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="privacy_level">Privacy Level</Label>
              <Select
                value={formData.privacy_level}
                onValueChange={(value) => setFormData({ ...formData, privacy_level: value })}
              >
                <SelectTrigger id="privacy_level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="invite_only">Invite Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event_id">Event ID (Optional)</Label>
            <Input
              id="event_id"
              value={formData.event_id}
              onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
              placeholder="Link to event if applicable"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rules">Community Rules</Label>
            <Textarea
              id="rules"
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
              placeholder="Set guidelines for your circle"
              rows={4}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Circle
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
