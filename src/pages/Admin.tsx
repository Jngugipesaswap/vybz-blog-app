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
import { Loader2 } from "lucide-react";

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        navigate("/auth");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (error || !data) {
          navigate("/");
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error("Error checking admin status:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkAdminStatus();
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
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
