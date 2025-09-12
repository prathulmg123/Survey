import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const DashboardHeader = () => {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail") || "user@example.com";
  const userInitials = userEmail.slice(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <header className="border-b border-border/80 bg-card/50 backdrop-blur-sm sticky top-0 border-border/90 shadow-md bg-gradient-to-br from-background to-muted/40">
      <div className="flex h-16 items-center px-6 gap-4">
        <SidebarTrigger className="hover:bg-accent rounded-md p-2" />
        
        <div className="flex-1 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* <h1 className="font-semibold text-lg">Survey Dashboard</h1> */}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="hero" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Survey
            </Button>
            
            <Button variant="ghost" size="icon" className="relative">
              <Search className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-[10px] text-white flex items-center justify-center">
                3
              </span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="" alt={userEmail} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Account</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userEmail}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};