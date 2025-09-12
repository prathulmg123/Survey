import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  FileText,
  Settings,
  Home,
  Plus,
  Clock,
  HelpCircle,
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
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Create Survey Guide", url: "/guide", icon: Plus },
  { title: "Manage Survey Guide", url: "/manage", icon: BarChart3 },
  { title: "In Progress", url: "/active", icon: Clock },
];

const bottomItems = [
  { title: "Help & Support", url: "/dashboard/help", icon: HelpCircle },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const getNavLinkClass = (active: boolean) =>
    `group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 relative font-medium ${
      active
        ? "bg-primary/8 text-primary shadow-sm border border-primary/10 scale-[1.02]"
        : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground hover:shadow-sm hover:scale-[1.01] hover:border hover:border-border/50"
    }`;

  return (
    <Sidebar className="bg-card/50 border-r border-border shadow-sidebar backdrop-blur-sm border-border/90 shadow-md bg-gradient-to-br from-background to-muted/40">
      <SidebarContent className="p-4">
        {/* Brand */}
        <div className="mb-10 pt-4">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-4 px-3'}`}>
            <div className="relative group">
              <div className="p-3 bg-gradient-primary rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
            </div>
            {!isCollapsed && (
              <div className="animate-slide-in">
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Katalyze.ai
                </h1>
                <p className="text-xs text-muted-foreground font-semibold tracking-wide">
                  ADMIN DASHBOARD
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Navigation
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item, index) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={getNavLinkClass(active)}
                      >
                        <div className={`p-2 rounded-lg transition-all duration-300 ${
                          active ? 'bg-primary/15' : 'bg-muted/30 group-hover:bg-muted'
                        }`}>
                          <item.icon className={`h-5 w-5 flex-shrink-0 transition-all duration-300 ${
                            active ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-foreground group-hover:scale-105'
                          }`} />
                        </div>
                        {!isCollapsed && (
                          <span className="font-semibold text-sm tracking-wide">{item.title}</span>
                        )}
                        {active && (
                          <div className="absolute right-2 w-2 h-8 bg-primary rounded-full shadow-sm"></div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom Navigation */}
        <div className="mt-auto pt-6 border-t border-border/60">
          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 px-3">
                Account
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {bottomItems.map((item, index) => {
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.title} className="animate-fade-in" style={{ animationDelay: `${(index + 5) * 50}ms` }}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className={getNavLinkClass(active)}
                        >
                          <div className={`p-2 rounded-lg transition-all duration-300 ${
                            active ? 'bg-primary/15' : 'bg-muted/30 group-hover:bg-muted'
                          }`}>
                            <item.icon className={`h-5 w-5 flex-shrink-0 transition-all duration-300 ${
                              active ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-foreground group-hover:scale-105'
                            }`} />
                          </div>
                          {!isCollapsed && (
                            <span className="font-semibold text-sm tracking-wide">{item.title}</span>
                          )}
                          {active && (
                            <div className="absolute right-2 w-2 h-8 bg-primary rounded-full shadow-sm"></div>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}