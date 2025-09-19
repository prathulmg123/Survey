import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Search, Plus, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import authService from "@/api/authService";
import { useEffect, useState } from "react";

export const DashboardHeader = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string>('');
  const userEmail = localStorage.getItem("userEmail") || "user@example.com";
  const userInitials = userEmail.slice(0, 2).toUpperCase();

  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    // Get user role from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.role) {
          // Capitalize first letter of role
          setUserRole(user.role.charAt(0).toUpperCase() + user.role.slice(1));
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      // Switch to light mode before logging out
      if (theme === 'dark') {
        toggleTheme();
      }
      
      // Call the authService logout which will handle API call and cleanup
      await authService.logout(navigate);
      toast.success("Successfully logged out");
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  return (
    <header className="border-b border-border/80 bg-card/50 backdrop-blur-sm sticky top-0 border-border/90 shadow-md bg-gradient-to-br from-background to-muted/40">
      <div className="flex h-16 items-center px-6 gap-4">
        <SidebarTrigger className="hover:bg-accent rounded-md p-2" />
        
        <div className="flex-1 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* <h1 className="font-semibold text-lg">Survey Dashboard</h1> */}
          </div>

          <div className="flex items-center gap-2">
          
            
            <ThemeToggle />
           
            
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-[10px] text-white flex items-center justify-center">
                3
              </span>
            </Button>

            {userRole && (
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-md  text-sm font-medium text-foreground">
                <User className="h-4 w-4" />
                <span className="capitalize">{userRole}</span>
              </div>
            )}
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