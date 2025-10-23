import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ShareAnalyticsDashboard } from "@/components/ShareAnalyticsDashboard";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const ShareAnalytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Share Analytics</h1>
            <p className="text-muted-foreground">
              Track your social shares with UTM parameters and see how your content performs across platforms
            </p>
          </div>
          <ShareAnalyticsDashboard />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShareAnalytics;
