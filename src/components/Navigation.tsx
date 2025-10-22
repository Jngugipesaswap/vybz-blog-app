import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Menu, X, Calendar, MapPin, Users, FileText, Bot, Wallet, Trophy, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { NotificationCenter } from "@/components/NotificationCenter";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed Out",
        description: "You've been successfully signed out.",
      });
      navigate("/");
    }
  };

  const eventCategories = [
    { name: "+18 Events", icon: Calendar, id: "adult-events" },
    { name: "Family Fun", icon: Users, id: "family-events" },
    { name: "Conferences", icon: FileText, id: "conferences" },
  ];

  const features = [
    { name: "Venues", icon: MapPin, id: "venues" },
    { name: "AI Planner", icon: Bot, id: "ai-planner" },
    { name: "Wallet", icon: Wallet, id: "wallet" },
    { name: "Loyalty", icon: Trophy, id: "loyalty" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg cta-gradient flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="font-bold text-xl">The Vybz Circle</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Events</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-[400px]">
                      {eventCategories.map((category) => {
                        const Icon = category.icon;
                        return (
                          <button
                            key={category.id}
                            onClick={() => scrollToSection(category.id)}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                          >
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{category.name}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-[400px]">
                      {features.map((feature) => {
                        const Icon = feature.icon;
                        return (
                          <button
                            key={feature.id}
                            onClick={() => scrollToSection(feature.id)}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                          >
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{feature.name}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Button variant="ghost" onClick={() => scrollToSection('blog')}>{t('common.blog', 'Blog')}</Button>
            
            <LanguageSwitcher />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            {user && <NotificationCenter />}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="cta-gradient text-white">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={async () => {
                    try {
                      const { data } = await supabase.rpc("get_user_role", { _user_id: user.id });
                      if (data === 'admin') navigate('/admin');
                      else if (data === 'content_creator') navigate('/content');
                      else navigate('/dashboard');
                    } catch {
                      navigate('/dashboard');
                    }
                  }}>
                    {t('dashboard.welcome', 'My Dashboard')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => scrollToSection('wallet')}>
                    {t('wallet.title', 'My Wallet')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => scrollToSection('loyalty')}>
                    {t('loyalty.title', 'Loyalty Points')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/quote-studio')}>
                    Quote Studio
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    {t('common.logout', 'Sign Out')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button className="btn-gradient text-white" asChild>
                <Link to="/auth">{t('common.login', 'Sign In')}</Link>
              </Button>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              <Button variant="ghost" className="justify-start">Events</Button>
              <Button variant="ghost" className="justify-start">Features</Button>
              <Button variant="ghost" className="justify-start">Blog</Button>
              {user ? (
                <>
                  <Button variant="ghost" className="justify-start" onClick={async () => {
                    try {
                      const { data } = await supabase.rpc("get_user_role", { _user_id: user.id });
                      if (data === 'admin') navigate('/admin');
                      else if (data === 'content_creator') navigate('/content');
                      else navigate('/dashboard');
                    } catch {
                      navigate('/dashboard');
                    }
                    setIsMenuOpen(false);
                  }}>
                    {t('dashboard.welcome', 'My Dashboard')}
                  </Button>
                  <Button variant="ghost" className="justify-start" onClick={() => {
                    navigate('/quote-studio');
                    setIsMenuOpen(false);
                  }}>
                    Quote Studio
                  </Button>
                  <Button variant="ghost" className="justify-start" onClick={handleSignOut}>
                    {t('common.logout', 'Sign Out')}
                  </Button>
                </>
              ) : (
                <Button className="btn-gradient text-white" asChild>
                  <Link to="/auth">{t('common.login', 'Sign In')}</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;