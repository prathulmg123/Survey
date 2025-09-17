import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  FileText,
  Settings,
  Home,
  Plus,
  Clock,
  HelpCircle,
  Users as UsersIcon,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Users", url: "/users", icon: UsersIcon },
  { title: "Create Survey", url: "/guide", icon: Plus },
  { title: "Manage Survey", url: "/manage", icon: BarChart3 },
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
    // Special case for survey detail pages to keep Manage Surveys active
    if (path === "/manage") {
      return location.pathname.startsWith("/manage") || location.pathname.startsWith("/surveys/");
    }
    return location.pathname.startsWith(path);
  };

  const getNavLinkClass = (active: boolean) =>
    `group flex items-center gap-4 ${isCollapsed ? 'justify-center px-3' : 'px-3'} 
     py-4 rounded-md transition-all duration-300 relative font-medium 
     ${
       active
         ? "bg-gradient-to-r to-[#e1e1e1] from-[#e1e1e1] text-primary hover:text-primary font-bold border-l-4 border-blue-500"
         : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
     }`;
  
  

  return (
    <Sidebar className="bg-card/50 border-r border-border shadow-sidebar backdrop-blur-sm border-border/90 shadow-md bg-gradient-to-br from-background to-muted/40">
      <SidebarContent className="p-4">
        {/* Brand */}
        <div className={`mb-10 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <div className={`flex items-center ${isCollapsed ? 'flex-col gap-2' : 'gap-4 px-3'}`}>
            <div className="relative group">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <span className="text-2xl font-bold text-white">K</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
            </div>
            {!isCollapsed && (
              <div className="animate-slide-in">
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Katalyze.ai
                </h1>
                <p className="text-xs text-muted-foreground font-semibold tracking-wide">
                  ADMIN PANEL
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          {/* {!isCollapsed && (
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Navigation
            </SidebarGroupLabel>
          )} */}
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
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className={`p-2 rounded-lg transition-all duration-300 ${
                                  active ? '' : 'bg-muted/30 group-hover:bg-muted'
                                }`}>
                                  <item.icon className={`h-5 w-5 flex-shrink-0 transition-all duration-300 ${
                                    active ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-foreground group-hover:scale-105'
                                  }`} />
                                </div>
                              </TooltipTrigger>
                              {isCollapsed && (
                                <TooltipContent side="right" sideOffset={10}>
                                  <p>{item.title}</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                          {!isCollapsed && (
                            <span className="font-semibold text-sm tracking-wide">{item.title}</span>
                          )}
                        </div>

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
                    <SidebarMenuItem key={item.title} className="animate-fade-in  cursor-not-allowed" style={{ animationDelay: `${(index + 5) * 50}ms` }}>
                      <SidebarMenuButton asChild>
                        <div className={getNavLinkClass(active).replace('hover:bg-secondary/80', '')}>
                          <div className={`p-2 rounded-lg transition-all duration-300 ${
                            active ? 'bg-primary/15' : 'bg-muted/30'
                          }`}>
                            <item.icon className={`h-5 w-5 flex-shrink-0 transition-all duration-300 ${
                              active ? 'text-primary scale-110' : 'text-muted-foreground'
                            }`} />
                          </div>
                          {!isCollapsed && (
                            <span className="font-semibold text-sm tracking-wide">{item.title}</span>
                          )}
                        </div>
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