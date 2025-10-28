import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Tag,
  Image,
  MessageSquare,
  Users,
  Trophy,
  Wallet,
  BarChart3,
  Settings,
  ShieldCheck,
  Gamepad2,
  Bell,
  CircleDot,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

interface AdminSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const menuItems = [
  {
    section: "Content",
    items: [
      { id: "overview", label: "Dashboard", icon: LayoutDashboard },
      { id: "posts", label: "Posts", icon: FileText },
      { id: "categories", label: "Categories", icon: FolderTree },
      { id: "tags", label: "Tags", icon: Tag },
      { id: "media", label: "Media Library", icon: Image },
      { id: "comments", label: "Comments", icon: MessageSquare },
      { id: "moderation", label: "Content Moderation", icon: ShieldCheck },
    ],
  },
  {
    section: "Circle Management",
    items: [
      { id: "circles", label: "Circle Overview", icon: CircleDot },
      { id: "circle-moderation", label: "Moderation Queue", icon: ShieldCheck },
      { id: "circle-members", label: "Member Management", icon: Users },
      { id: "circle-analytics", label: "Analytics", icon: BarChart3 },
      { id: "circle-live", label: "Live Events", icon: Bell },
      { id: "circle-automation", label: "Automation", icon: Settings },
      { id: "circle-security", label: "Security & Privacy", icon: ShieldCheck },
    ],
  },
  {
    section: "Users & Engagement",
    items: [
      { id: "users", label: "Users", icon: Users },
      { id: "loyalty", label: "Loyalty Points", icon: Trophy },
      { id: "wallets", label: "Wallets", icon: Wallet },
      { id: "gamification", label: "Gamification", icon: Gamepad2 },
      { id: "notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    section: "System",
    items: [
      { id: "analytics", label: "Analytics", icon: BarChart3 },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AdminSidebar({ activeSection, setActiveSection }: AdminSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"}>
      <SidebarContent className="glass-effect border-r border-border/50">
        <div className="px-6 py-5 border-b border-border/50">
          {!collapsed && (
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gradient">Admin Panel</h2>
              <p className="text-xs text-muted-foreground">The Vybz Circle</p>
            </div>
          )}
          <SidebarTrigger className="mt-2" />
        </div>

        {menuItems.map((section) => (
          <SidebarGroup key={section.section}>
            {!collapsed && <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-6 py-2">{section.section}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveSection(item.id)}
                        className={`
                          transition-all duration-200
                          ${isActive 
                            ? "bg-primary/10 text-primary font-medium border-l-2 border-primary" 
                            : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                          }
                        `}
                      >
                        <Icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                        {!collapsed && <span>{item.label}</span>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
