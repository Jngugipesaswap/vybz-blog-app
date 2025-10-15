import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DashboardOverview } from "@/components/admin/DashboardOverview";
import { PostManagement } from "@/components/admin/PostManagement";
import { CategoryManagement } from "@/components/admin/CategoryManagement";
import { TagManagement } from "@/components/admin/TagManagement";
import { MediaManagement } from "@/components/admin/MediaManagement";
import { UserManagement } from "@/components/admin/UserManagement";
import { LoyaltyManagement } from "@/components/admin/LoyaltyManagement";
import { WalletManagement } from "@/components/admin/WalletManagement";
import { CommentManagement } from "@/components/admin/CommentManagement";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { SettingsManagement } from "@/components/admin/SettingsManagement";
import { ContentModeration } from "@/components/admin/ContentModeration";
import { GamificationManagement } from "@/components/admin/GamificationManagement";
import { UserDashboard } from "@/components/dashboards/UserDashboard";
import { ContentCreatorDashboard } from "@/components/dashboards/ContentCreatorDashboard";
import { Loader2 } from "lucide-react";

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        navigate("/auth");
        return;
      }

      try {
        // Use the get_user_role function to get the highest role
        const { data, error } = await supabase
          .rpc("get_user_role", { _user_id: user.id });

        if (error) throw error;

        if (!data) {
          navigate("/");
          return;
        }

        setUserRole(data);
      } catch (error) {
        console.error("Error checking user role:", error);
        navigate("/");
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
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return null;
  }

  // Route to appropriate dashboard based on role
  if (userRole === 'user') {
    navigate("/dashboard");
    return null;
  }

  if (userRole === 'content_creator') {
    navigate("/content");
    return null;
  }

  // Only admin role gets access to the full admin panel
  if (userRole !== 'admin') {
    return null;
  }

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <DashboardOverview />;
      case "posts":
        return <PostManagement />;
      case "categories":
        return <CategoryManagement />;
      case "tags":
        return <TagManagement />;
      case "media":
        return <MediaManagement />;
      case "comments":
        return <CommentManagement />;
      case "users":
        return <UserManagement />;
      case "loyalty":
        return <LoyaltyManagement />;
      case "wallets":
        return <WalletManagement />;
      case "moderation":
        return <ContentModeration />;
      case "gamification":
        return <GamificationManagement />;
      case "analytics":
        return <AnalyticsDashboard />;
      case "settings":
        return <SettingsManagement />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-muted/20 to-background">
        <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader />
          
          <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
            <div className="animate-fade-up">
              {renderSection()}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
