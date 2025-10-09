import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ContentCreatorDashboard } from "@/components/dashboards/ContentCreatorDashboard";
import { Loader2 } from "lucide-react";

export default function Content() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        navigate("/auth");
        return;
      }

      try {
        const { data, error } = await supabase
          .rpc("get_user_role", { _user_id: user.id });

        if (error) throw error;

        if (!data) {
          navigate("/auth");
          return;
        }

        // Only 'content_creator' and 'admin' can access this dashboard
        if (data !== 'content_creator' && data !== 'admin') {
          // Redirect to appropriate dashboard
          if (data === 'user') {
            navigate("/dashboard");
          }
          return;
        }

        setUserRole(data);
      } catch (error) {
        console.error("Error checking user role:", error);
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkUserRole();
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading content dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userRole || (userRole !== 'content_creator' && userRole !== 'admin')) {
    return null;
  }

  return <ContentCreatorDashboard />;
}
