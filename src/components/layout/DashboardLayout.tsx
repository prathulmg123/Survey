import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { DashboardHeader } from "./DashboardHeader";

interface DashboardLayoutProps {
  children?: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto bg-muted/30">
            <div className="p-6">
              {children || <Outlet />}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;