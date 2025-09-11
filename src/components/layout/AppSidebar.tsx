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
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Survey Guide", url: "/guide", icon: FileText },
  { title: "Start Survey", url: "/survey/new", icon: Plus },
  { title: "Manage Survey", url: "/dashboard/surveys", icon: BarChart3 },
  { title: "In Progress Survey", url: "/dashboard/surveys/in-progress", icon: Clock },
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
    // Check for exact match or if the current path starts with the menu item's path
    // This handles nested routes as well
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
      isActive
        ? "bg-primary/5 text-primary border-r-2 border-primary font-semibold"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`;

  return (
    <Sidebar className="border-r border-gray-100 bg-white shadow-sm">
      <SidebarContent className="p-4">
        {/* Brand */}
        <div className="mb-8 pt-2">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-2'}`}>
            <div className="p-2 bg-primary rounded-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-gray-900">SurveyPro</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
              Main Menu
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={getNavLinkClass}
                    >
                      <item.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-primary' : 'text-gray-500'}`} />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom Navigation */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                Settings
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {bottomItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={getNavLinkClass}
                      >
                        <item.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-primary' : 'text-gray-500'}`} />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}