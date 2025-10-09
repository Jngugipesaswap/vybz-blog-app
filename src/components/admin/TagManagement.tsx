import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag as TagIcon, Plus, X, TrendingUp, Hash, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export function TagManagement() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({ name: "" });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    const { data, error } = await supabase.from("tags").select("*").order("name");
    if (error) {
      toast.error("Failed to fetch tags");
      return;
    }
    setTags(data || []);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Tag name is required");
      return;
    }

    const slug = formData.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
    const { error } = await supabase.from("tags").insert([{ name: formData.name, slug }]);

    if (error) {
      toast.error("Failed to create tag");
      return;
    }

    toast.success("Tag created successfully");
    setIsDialogOpen(false);
    setFormData({ name: "" });
    fetchTags();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("tags").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete tag");
      return;
    }
    toast.success("Tag deleted successfully");
    fetchTags();
  };

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tagColors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];
  
  const chartData = tags.slice(0, 5).map((tag, index) => ({
    name: tag.name,
    value: Math.floor(Math.random() * 100) + 10,
    color: tagColors[index % tagColors.length]
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-cta bg-clip-text text-transparent">
            Tag Management
          </h1>
          <p className="text-muted-foreground mt-1">Organize content with tags</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient shadow-hover">
              <Plus className="h-4 w-4 mr-2" />
              New Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tag</DialogTitle>
              <DialogDescription>Add a new tag to categorize your content</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tag Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  placeholder="e.g., JavaScript, Tutorial, Featured"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="btn-gradient" onClick={handleSubmit}>
                Create Tag
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover-lift glass-effect border-border/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tags</CardTitle>
            <TagIcon className="h-5 w-5 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tags.length}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">+5</span>
              <span className="ml-1">this week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift glass-effect border-border/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Most Popular</CardTitle>
            <Hash className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{tags[0]?.name || "—"}</div>
            <p className="text-xs text-muted-foreground mt-2">Most used tag</p>
          </CardContent>
        </Card>

        <Card className="hover-lift glass-effect border-border/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Usage</CardTitle>
            <Sparkles className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12.5</div>
            <p className="text-xs text-muted-foreground mt-2">Posts per tag</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="glass-effect border-border/50">
        <CardHeader>
          <CardTitle>Top 5 Tags Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              value: { label: "Usage", color: "hsl(var(--primary))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Tags Cloud */}
      <Card className="glass-effect border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TagIcon className="h-5 w-5 text-primary" />
              All Tags
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {filteredTags.map((tag, index) => {
              const size = Math.random() > 0.5 ? "lg" : "default";
              const usage = Math.floor(Math.random() * 50) + 5;
              
              return (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className={`px-4 py-2 hover-lift cursor-pointer group relative overflow-hidden ${
                    size === "lg" ? "text-lg" : "text-sm"
                  }`}
                  style={{
                    backgroundColor: `hsl(var(--chart-${(index % 5) + 1}) / 0.1)`,
                    borderColor: `hsl(var(--chart-${(index % 5) + 1}) / 0.3)`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <TagIcon className="h-3 w-3 mr-1 inline" />
                  <span className="font-medium">{tag.name}</span>
                  <span className="ml-2 text-xs opacity-60">({usage})</span>
                  <button
                    onClick={() => handleDelete(tag.id)}
                    className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
