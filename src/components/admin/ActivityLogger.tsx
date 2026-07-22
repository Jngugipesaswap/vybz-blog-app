import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, User, FileText, MessageSquare, Heart, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface ActivityLog {
  id: string;
  user_id: string | null;
  activity_type: string;
  entity_type: string;
  entity_id: string | null;
  metadata: any;
  created_at: string;
  profiles?: {
    full_name: string | null;
  };
}

export const ActivityLogger = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      const userIds = Array.from(new Set((data || []).map((a) => a.user_id).filter(Boolean))) as string[];
      let profilesMap = new Map<string, { full_name: string | null }>();
      if (userIds.length) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);
        profilesMap = new Map((profs || []).map((p: any) => [p.user_id, { full_name: p.full_name }]));
      }
      setActivities(
        (data || []).map((a: any) => ({
          ...a,
          profiles: a.user_id ? profilesMap.get(a.user_id) : undefined,
        }))
      );
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'page_view':
        return <FileText className="w-4 h-4" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4" />;
      case 'like':
      case 'reaction':
        return <Heart className="w-4 h-4" />;
      case 'share':
        return <Share2 className="w-4 h-4" />;
      case 'user_action':
        return <User className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'page_view':
        return 'bg-blue-500/10 text-blue-500';
      case 'comment':
        return 'bg-green-500/10 text-green-500';
      case 'like':
      case 'reaction':
        return 'bg-pink-500/10 text-pink-500';
      case 'share':
        return 'bg-purple-500/10 text-purple-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatActivityType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          Loading activity...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No activity recorded yet
              </p>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className={`p-2 rounded-full ${getActivityColor(activity.activity_type)}`}>
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">
                        {formatActivityType(activity.activity_type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm">
                      {activity.profiles?.full_name || 'Anonymous User'} 
                      {' '}{activity.activity_type.replace('_', ' ')}{' '}
                      {activity.entity_type}
                    </p>
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {JSON.stringify(activity.metadata, null, 2)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
