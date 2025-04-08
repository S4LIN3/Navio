import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  
  const handleNotificationClick = (message: string) => {
    toast({
      title: "Notification",
      description: message,
    });
  };

  const handleLogout = () => {
    logout();
    setShowLogoutDialog(false);
  };

  return (
    <>
      <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-neutral-200">
        <div className="flex md:hidden">
          <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
            <span className="material-icons">menu</span>
          </Button>
        </div>
        
        <div className="flex md:hidden ml-2">
          <h1 className="text-lg font-semibold text-primary-700">
            <span className="text-primary-600">Navio</span>
          </h1>
        </div>
        
        <div className="flex items-center ml-auto">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="material-icons text-neutral-400 text-lg">search</span>
            </span>
            <Input 
              type="search" 
              placeholder="Search..." 
              className="hidden sm:block w-full h-10 pl-10 pr-4 text-sm bg-neutral-100 border-none rounded-lg focus:outline-none" 
            />
          </div>
          
          {/* Theme Toggle */}
          <div className="ml-4">
            <ThemeToggle />
          </div>
          
          {/* Notifications Dropdown */}
          <div className="relative ml-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <span className="material-icons">notifications</span>
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-secondary-500 rounded-full">3</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => handleNotificationClick("Daily Goal Progress: You're 75% complete with today's tasks!")}>
                    <div className="flex items-start gap-2">
                      <span className="material-icons text-green-500">task_alt</span>
                      <div>
                        <div className="font-medium">Daily Goal Progress</div>
                        <div className="text-sm text-muted-foreground">You're 75% complete with today's tasks!</div>
                        <div className="text-xs text-muted-foreground mt-1">2 hours ago</div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNotificationClick("Reminder: Weekly reflection is due tomorrow")}>
                    <div className="flex items-start gap-2">
                      <span className="material-icons text-amber-500">event_note</span>
                      <div>
                        <div className="font-medium">Reminder</div>
                        <div className="text-sm text-muted-foreground">Weekly reflection is due tomorrow</div>
                        <div className="text-xs text-muted-foreground mt-1">5 hours ago</div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNotificationClick("New Learning Resource: Introduction to Mindfulness")}>
                    <div className="flex items-start gap-2">
                      <span className="material-icons text-blue-500">school</span>
                      <div>
                        <div className="font-medium">New Learning Resource</div>
                        <div className="text-sm text-muted-foreground">Introduction to Mindfulness</div>
                        <div className="text-xs text-muted-foreground mt-1">1 day ago</div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-primary-600">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Profile Dropdown */}
          <div className="relative ml-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center text-sm">
                  <Avatar className="w-8 h-8 mr-2">
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt={user?.name || 'User'} />
                    <AvatarFallback>{user?.name?.slice(0, 2) || 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block mr-1 text-sm font-medium">{user?.name || 'User'}</span>
                  <span className="material-icons text-neutral-400 text-lg">arrow_drop_down</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/profile">
                    <div className="flex items-center gap-2">
                      <span className="material-icons">person</span>
                      <span>Profile</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/settings">
                    <div className="flex items-center gap-2">
                      <span className="material-icons">settings</span>
                      <span>Settings</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowLogoutDialog(true)}>
                  <div className="flex items-center gap-2">
                    <span className="material-icons">logout</span>
                    <span>Log out</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? Any unsaved data will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default Header;