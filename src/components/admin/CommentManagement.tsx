import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Check, X, Clock, TrendingUp, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface Comment {
  id: string;
  content: string;
  status: string;
  created_at: string;
  post_id: string;
  user_id: string;
}

export function CommentManagement() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch comments");
      return;
    }

    const allComments = data || [];
    setComments(allComments);
    
    setStats({
      total: allComments.length,
      pending: allComments.filter(c => c.status === "pending").length,
      approved: allComments.filter(c => c.status === "approved").length,
      rejected: allComments.filter(c => c.status === "rejected").length,
    });
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from("comments")
      .update({ status: "approved" })
      .eq("id", id);

    if (error) {
      toast.error("Failed to approve comment");
      return;
    }

    toast.success("Comment approved");
    fetchComments();
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from("comments")
      .update({ status: "rejected" })
      .eq("id", id);

    if (error) {
      toast.error("Failed to reject comment");
      return;
    }

    toast.success("Comment rejected");
    fetchComments();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("comments").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete comment");
      return;
    }

    toast.success("Comment deleted");
    fetchComments();
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      approved: "bg-green-500/10 text-green-500 border-green-500/20",
      rejected: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const filteredComments = comments.filter(comment => {
    const matchesSearch = comment.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || comment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const chartData = [
    { name: "Mon", comments: 15 },
    { name: "Tue", comments: 22 },
    { name: "Wed", comments: 18 },
    { name: "Thu", comments: 28 },
    { name: "Fri", comments: 35 },
    { name: "Sat", comments: 30 },
    { name: "Sun", comments: 25 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-cta bg-clip-text text-transparent">
          Comment Management
        </h1>
        <p className="text-muted-foreground mt-1">Moderate user comments and engagement</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover-lift glass-effect border-border/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Comments</CardTitle>
            <MessageSquare className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">+18%</span>
              <span className="ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift glass-effect border-border/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <Clock className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-2">Awaiting moderation</p>
          </CardContent>
        </Card>

        <Card className="hover-lift glass-effect border-border/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            <Check className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground mt-2">Published comments</p>
          </CardContent>
        </Card>

        <Card className="hover-lift glass-effect border-border/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
            <X className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground mt-2">Spam/inappropriate</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="glass-effect border-border/50">
        <CardHeader>
          <CardTitle>Comment Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              comments: { label: "Comments", color: "hsl(var(--primary))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <ChartTooltip />
                <Line type="monotone" dataKey="comments" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: "hsl(var(--primary))", r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Comments Table */}
      <Card className="glass-effect border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              All Comments
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search comments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComments.map((comment) => (
                <TableRow key={comment.id} className="hover:bg-muted/50">
                  <TableCell className="max-w-md">
                    <p className="line-clamp-2">{comment.content}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {comment.user_id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(comment.status)} variant="outline">
                      {comment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {comment.status !== "approved" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleApprove(comment.id)}
                          title="Approve"
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                      )}
                      {comment.status !== "rejected" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleReject(comment.id)}
                          title="Reject"
                        >
                          <X className="h-4 w-4 text-orange-500" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(comment.id)}
                        title="Delete"
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
