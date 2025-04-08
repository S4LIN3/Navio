import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { currentUser } from "@/lib/mock-data";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Link, useLocation } from "wouter";
import { resetUserDataToDefaults, clearUserData } from "@/utils/user-data-utils";
import { useAuth } from "@/hooks/use-auth";

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  bio: z.string().optional(),
});

export function SettingsPage() {
  const { toast } = useToast();
  const { user, logout, deleteAccount } = useAuth();
  const [location, setLocation] = useLocation();
  const [showLogoutConfirmDialog, setShowLogoutConfirmDialog] = useState(false);
  const [showAccessibilityDialog, setShowAccessibilityDialog] = useState(false);
  const [showResetDataDialog, setShowResetDataDialog] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('system');
  const [selectedAccentColor, setSelectedAccentColor] = useState('blue');
  
  const [notifications, setNotifications] = useState({
    email: true,
    app: true,
    goalReminders: true,
    socialReminders: false,
  });
  
  const [accessibility, setAccessibility] = useState({
    fontSize: "medium",
    contrast: "normal",
    reducedMotion: false,
    screenReader: false,
    navigationAssist: false,
    textToSpeech: false
  });
  
  // Function to apply accent color CSS variables
  const applyAccentColor = (color: string) => {
    if (color === 'blue') {
      document.documentElement.style.setProperty('--primary', 'hsl(221.2 83.2% 53.3%)');
      document.documentElement.style.setProperty('--primary-foreground', 'hsl(210 40% 98%)');
      document.documentElement.style.setProperty('--accent', 'hsl(217.2 91.2% 59.8%)');
      document.documentElement.style.setProperty('--accent-foreground', 'hsl(222.2 47.4% 11.2%)');
    } else if (color === 'purple') {
      document.documentElement.style.setProperty('--primary', 'hsl(262 80% 50%)');
      document.documentElement.style.setProperty('--primary-foreground', 'hsl(210 40% 98%)');
      document.documentElement.style.setProperty('--accent', 'hsl(258 90% 66%)');
      document.documentElement.style.setProperty('--accent-foreground', 'hsl(222.2 47.4% 11.2%)');
    } else if (color === 'teal') {
      document.documentElement.style.setProperty('--primary', 'hsl(168 80% 40%)');
      document.documentElement.style.setProperty('--primary-foreground', 'hsl(210 40% 98%)');
      document.documentElement.style.setProperty('--accent', 'hsl(172 66% 50%)');
      document.documentElement.style.setProperty('--accent-foreground', 'hsl(222.2 47.4% 11.2%)');
    } else if (color === 'amber') {
      document.documentElement.style.setProperty('--primary', 'hsl(39 100% 50%)');
      document.documentElement.style.setProperty('--primary-foreground', 'hsl(222.2 47.4% 11.2%)');
      document.documentElement.style.setProperty('--accent', 'hsl(45 93% 47%)');
      document.documentElement.style.setProperty('--accent-foreground', 'hsl(222.2 47.4% 11.2%)');
    }
  };

  // Load saved preferences on mount
  useEffect(() => {
    // Load saved accessibility settings
    const savedAccessibility = localStorage.getItem('userAccessibility');
    if (savedAccessibility) {
      try {
        const parsedAccessibility = JSON.parse(savedAccessibility);
        setAccessibility(parsedAccessibility);
        
        // Apply font size
        if (parsedAccessibility.fontSize) {
          document.documentElement.style.fontSize = 
            parsedAccessibility.fontSize === 'small' ? '14px' : 
            parsedAccessibility.fontSize === 'large' ? '18px' : 
            parsedAccessibility.fontSize === 'x-large' ? '20px' : '16px';
        }
        
        // Apply contrast setting
        if (parsedAccessibility.contrast === 'high') {
          document.documentElement.classList.add('high-contrast');
        }
        
        // Apply reduced motion setting
        if (parsedAccessibility.reducedMotion) {
          document.documentElement.classList.add('reduced-motion');
        }
      } catch (error) {
        console.error('Failed to parse accessibility settings', error);
      }
    }
    
    // Load and apply saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setSelectedTheme(savedTheme);
      
      // Apply theme
      if (savedTheme === 'dark') {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      } else if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else if (savedTheme === 'system') {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(systemTheme);
      }
    }
    
    // Load saved accent color
    const savedAccentColor = localStorage.getItem('accentColor');
    if (savedAccentColor) {
      setSelectedAccentColor(savedAccentColor);
      // Apply accent color using CSS variables
      applyAccentColor(savedAccentColor);
    }
    
    // Load saved notification settings
    const savedNotifications = localStorage.getItem('userSettings');
    if (savedNotifications) {
      try {
        const settings = JSON.parse(savedNotifications);
        setNotifications({
          email: settings.emailNotifications || false,
          app: settings.appNotifications || false,
          goalReminders: settings.goalReminders || false,
          socialReminders: settings.socialReminders || false,
        });
      } catch (error) {
        console.error('Failed to parse notification settings', error);
      }
    }
  }, []);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser.name || "",
      username: currentUser.username,
      email: "user@example.com", // Default value
      bio: "",
    },
  });

  const handleProfileSubmit = (data: z.infer<typeof profileSchema>) => {
    // In a real app, this would update the user profile on the server
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    });
  };

  const handleNotificationChange = (key: string, checked: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: checked
    }));
  };
  
  const handleAccessibilityChange = (key: string, value: any) => {
    setAccessibility(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Save to localStorage 
    localStorage.setItem('userAccessibility', JSON.stringify({
      ...accessibility,
      [key]: value
    }));
    
    // Apply changes immediately for certain settings
    if (key === 'fontSize') {
      document.documentElement.style.fontSize = 
        value === 'small' ? '14px' : 
        value === 'large' ? '18px' : 
        value === 'x-large' ? '20px' : '16px'; // medium is default (16px)
    }
    
    if (key === 'contrast') {
      if (value === 'high') {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    }
    
    if (key === 'reducedMotion') {
      if (value) {
        document.documentElement.classList.add('reduced-motion');
      } else {
        document.documentElement.classList.remove('reduced-motion');
      }
    }
    
    if (key === 'screenReader') {
      // Add ARIA attributes to improve screen reader compatibility
      if (value) {
        document.querySelectorAll('button, a, input, select').forEach(el => {
          if (!el.getAttribute('aria-label') && el.textContent) {
            el.setAttribute('aria-label', el.textContent.trim());
          }
        });
      }
    }
    
    if (key === 'navigationAssist') {
      // Add keyboard navigation helpers
      const focusableElements = document.querySelectorAll(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (value) {
        focusableElements.forEach(el => {
          el.classList.add('focus-visible:ring-2', 'focus-visible:ring-offset-2', 'focus-visible:ring-primary-500');
        });
      } else {
        focusableElements.forEach(el => {
          el.classList.remove('focus-visible:ring-2', 'focus-visible:ring-offset-2', 'focus-visible:ring-primary-500');
        });
      }
    }
    
    toast({
      title: "Accessibility Setting Updated",
      description: `Your ${key} preference has been updated.`,
    });
  };
  
  const handleLogout = () => {
    // Clear authentication state
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    
    // Clear all user data before logging out
    clearUserData();
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    
    // Redirect to login/auth page
    setLocation("/auth");
  };
  
  const handleResetData = () => {
    // Reset user data to default values
    resetUserDataToDefaults();
    
    toast({
      title: "Data Reset",
      description: "Your app data has been reset to default values.",
    });
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowAccessibilityDialog(true)}>
            <span className="material-icons mr-2 text-sm">accessibility</span>
            Accessibility Options
          </Button>
          <Button variant="destructive" onClick={() => setShowLogoutConfirmDialog(true)}>
            <span className="material-icons mr-2 text-sm">logout</span>
            Logout
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleProfileSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormDescription>
                          This email will be used for notifications and account recovery.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us a little about yourself"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit">Save Changes</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-base font-medium mb-3">Password</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  <Button>Change Password</Button>
                </div>
              </div>

              <div className="border-t pt-5">
                <h3 className="text-base font-medium mb-3 text-red-600">Danger Zone</h3>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-sm text-neutral-600">
                      Reset your data to default values. This will clear your custom data but keep your account.
                    </p>
                    <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => setShowResetDataDialog(true)}>
                      <span className="material-icons mr-2 text-sm">restart_alt</span>
                      Reset Data to Defaults
                    </Button>
                  </div>
                  
                  <div className="space-y-3 pt-3 border-t">
                    <p className="text-sm text-neutral-600">
                      Once you delete your account, all of your data will be permanently removed. This action cannot be undone.
                    </p>
                    <Button variant="destructive" onClick={() => setShowDeleteAccountDialog(true)}>
                      <span className="material-icons mr-2 text-sm">delete_forever</span>
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-neutral-500">
                    Receive email notifications for important updates
                  </p>
                </div>
                <Switch 
                  id="email-notifications" 
                  checked={notifications.email}
                  onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="app-notifications">In-App Notifications</Label>
                  <p className="text-sm text-neutral-500">
                    Show notifications within the application
                  </p>
                </div>
                <Switch 
                  id="app-notifications" 
                  checked={notifications.app}
                  onCheckedChange={(checked) => handleNotificationChange('app', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="goal-reminders">Goal Reminders</Label>
                  <p className="text-sm text-neutral-500">
                    Get reminders about upcoming goal deadlines
                  </p>
                </div>
                <Switch 
                  id="goal-reminders" 
                  checked={notifications.goalReminders}
                  onCheckedChange={(checked) => handleNotificationChange('goalReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="social-reminders">Social Connection Reminders</Label>
                  <p className="text-sm text-neutral-500">
                    Get reminders to keep in touch with your connections
                  </p>
                </div>
                <Switch 
                  id="social-reminders" 
                  checked={notifications.socialReminders}
                  onCheckedChange={(checked) => handleNotificationChange('socialReminders', checked)}
                />
              </div>

              <Button>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-medium mb-3">Theme</h3>
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <ThemeToggle />
                    <p className="text-sm text-neutral-500">Click to toggle between light, dark, and system theme</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div 
                      className={`relative flex flex-col items-center bg-white rounded-md p-4 border cursor-pointer 
                        ${selectedTheme === 'light' ? 'border-primary-500 ring-2 ring-primary-200' : 'border-neutral-200 hover:border-primary-500'}`}
                      onClick={() => {
                        setSelectedTheme('light');
                        localStorage.setItem('theme', 'light');
                        document.documentElement.classList.remove('dark');
                        document.documentElement.classList.add('light');
                        toast({
                          title: "Theme Updated",
                          description: "Light theme has been applied",
                        });
                      }}
                    >
                      <div className="w-full h-16 bg-white rounded-md mb-2 border border-neutral-200"></div>
                      <span className="text-sm">Light</span>
                      {selectedTheme === 'light' && (
                        <div className="absolute top-2 right-2">
                          <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                        </div>
                      )}
                    </div>
                    <div 
                      className={`relative flex flex-col items-center bg-neutral-100 rounded-md p-4 border cursor-pointer 
                        ${selectedTheme === 'dark' ? 'border-primary-500 ring-2 ring-primary-200' : 'border-neutral-200 hover:border-primary-500'}`}
                      onClick={() => {
                        setSelectedTheme('dark');
                        localStorage.setItem('theme', 'dark');
                        document.documentElement.classList.remove('light');
                        document.documentElement.classList.add('dark');
                        toast({
                          title: "Theme Updated",
                          description: "Dark theme has been applied",
                        });
                      }}
                    >
                      <div className="w-full h-16 bg-neutral-800 rounded-md mb-2"></div>
                      <span className="text-sm">Dark</span>
                      {selectedTheme === 'dark' && (
                        <div className="absolute top-2 right-2">
                          <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                        </div>
                      )}
                    </div>
                    <div 
                      className={`relative flex flex-col items-center bg-gradient-to-b from-white to-neutral-100 rounded-md p-4 border cursor-pointer 
                        ${selectedTheme === 'system' ? 'border-primary-500 ring-2 ring-primary-200' : 'border-neutral-200 hover:border-primary-500'}`}
                      onClick={() => {
                        setSelectedTheme('system');
                        localStorage.setItem('theme', 'system');
                        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                        document.documentElement.classList.remove('light', 'dark');
                        document.documentElement.classList.add(systemTheme);
                        toast({
                          title: "Theme Updated",
                          description: "System theme preference has been applied",
                        });
                      }}
                    >
                      <div className="w-full h-16 bg-gradient-to-b from-white to-neutral-800 rounded-md mb-2"></div>
                      <span className="text-sm">System</span>
                      {selectedTheme === 'system' && (
                        <div className="absolute top-2 right-2">
                          <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-medium mb-3">Accent Color</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div 
                      className={`relative flex flex-col items-center rounded-md p-4 border cursor-pointer 
                        ${selectedAccentColor === 'blue' ? 'border-primary-500 ring-2 ring-primary-200' : 'border-neutral-200 hover:border-primary-500'}`}
                      onClick={() => {
                        setSelectedAccentColor('blue');
                        localStorage.setItem('accentColor', 'blue');
                        // Apply the accent color
                        applyAccentColor('blue');
                        toast({
                          title: "Accent Color Updated",
                          description: "Blue accent color has been applied",
                        });
                      }}
                    >
                      <div className="w-full h-8 bg-blue-500 rounded-md mb-2"></div>
                      <span className="text-sm">Blue</span>
                      {selectedAccentColor === 'blue' && (
                        <div className="absolute top-2 right-2">
                          <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                        </div>
                      )}
                    </div>
                    <div 
                      className={`relative flex flex-col items-center rounded-md p-4 border cursor-pointer 
                        ${selectedAccentColor === 'purple' ? 'border-primary-500 ring-2 ring-primary-200' : 'border-neutral-200 hover:border-primary-500'}`}
                      onClick={() => {
                        setSelectedAccentColor('purple');
                        localStorage.setItem('accentColor', 'purple');
                        // Apply the accent color
                        applyAccentColor('purple');
                        toast({
                          title: "Accent Color Updated",
                          description: "Purple accent color has been applied",
                        });
                      }}
                    >
                      <div className="w-full h-8 bg-purple-500 rounded-md mb-2"></div>
                      <span className="text-sm">Purple</span>
                      {selectedAccentColor === 'purple' && (
                        <div className="absolute top-2 right-2">
                          <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                        </div>
                      )}
                    </div>
                    <div 
                      className={`relative flex flex-col items-center rounded-md p-4 border cursor-pointer 
                        ${selectedAccentColor === 'teal' ? 'border-primary-500 ring-2 ring-primary-200' : 'border-neutral-200 hover:border-primary-500'}`}
                      onClick={() => {
                        setSelectedAccentColor('teal');
                        localStorage.setItem('accentColor', 'teal');
                        // Apply the accent color
                        applyAccentColor('teal');
                        toast({
                          title: "Accent Color Updated",
                          description: "Teal accent color has been applied",
                        });
                      }}
                    >
                      <div className="w-full h-8 bg-teal-500 rounded-md mb-2"></div>
                      <span className="text-sm">Teal</span>
                      {selectedAccentColor === 'teal' && (
                        <div className="absolute top-2 right-2">
                          <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                        </div>
                      )}
                    </div>
                    <div 
                      className={`relative flex flex-col items-center rounded-md p-4 border cursor-pointer 
                        ${selectedAccentColor === 'amber' ? 'border-primary-500 ring-2 ring-primary-200' : 'border-neutral-200 hover:border-primary-500'}`}
                      onClick={() => {
                        setSelectedAccentColor('amber');
                        localStorage.setItem('accentColor', 'amber');
                        // Apply the accent color
                        applyAccentColor('amber');
                        toast({
                          title: "Accent Color Updated",
                          description: "Amber accent color has been applied",
                        });
                      }}
                    >
                      <div className="w-full h-8 bg-amber-500 rounded-md mb-2"></div>
                      <span className="text-sm">Amber</span>
                      {selectedAccentColor === 'amber' && (
                        <div className="absolute top-2 right-2">
                          <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Button onClick={() => {
                  // All appearance settings are saved immediately on change, 
                  // but we can trigger a more visible confirmation here
                  toast({
                    title: "Appearance Settings Saved",
                    description: "Your appearance preferences have been saved successfully.",
                  });
                }}>Save Appearance</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="accessibility">
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Settings</CardTitle>
              <CardDescription>Customize your experience to make the application more accessible.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-base font-medium">Text Size</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="font-size">Font Size</Label>
                      <Select value={accessibility.fontSize} onValueChange={(val) => handleAccessibilityChange('fontSize', val)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium (Default)</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                          <SelectItem value="x-large">Extra Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-base font-medium">Contrast</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contrast">Contrast Mode</Label>
                      <Select value={accessibility.contrast} onValueChange={(val) => handleAccessibilityChange('contrast', val)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal (Default)</SelectItem>
                          <SelectItem value="high">High Contrast</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-base font-medium">Motion & Animation</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="reduced-motion">Reduced Motion</Label>
                      <p className="text-sm text-neutral-500">
                        Minimize animations and transitions
                      </p>
                    </div>
                    <Switch 
                      id="reduced-motion" 
                      checked={accessibility.reducedMotion}
                      onCheckedChange={(checked) => handleAccessibilityChange('reducedMotion', checked)}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-base font-medium">Assistive Technologies</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="screen-reader">Screen Reader Support</Label>
                      <p className="text-sm text-neutral-500">
                        Enhanced support for screen readers
                      </p>
                    </div>
                    <Switch 
                      id="screen-reader" 
                      checked={accessibility.screenReader}
                      onCheckedChange={(checked) => handleAccessibilityChange('screenReader', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="navigation-assist">Navigation Assistance</Label>
                      <p className="text-sm text-neutral-500">
                        Additional navigation cues and keyboard shortcuts
                      </p>
                    </div>
                    <Switch 
                      id="navigation-assist" 
                      checked={accessibility.navigationAssist}
                      onCheckedChange={(checked) => handleAccessibilityChange('navigationAssist', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="text-to-speech">Text-to-Speech</Label>
                      <p className="text-sm text-neutral-500">
                        Enable text-to-speech functionality for content
                      </p>
                    </div>
                    <Switch 
                      id="text-to-speech" 
                      checked={accessibility.textToSpeech}
                      onCheckedChange={(checked) => handleAccessibilityChange('textToSpeech', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => {
                localStorage.setItem('userAccessibility', JSON.stringify(accessibility));
                toast({
                  title: "Accessibility Settings Saved",
                  description: "Your accessibility preferences have been saved successfully.",
                });
              }}>Save Accessibility Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Accessibility Dialog */}
      <Dialog open={showAccessibilityDialog} onOpenChange={setShowAccessibilityDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Accessibility Options</DialogTitle>
            <DialogDescription>Adjust these settings to improve your experience.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quick-font-size">Text Size</Label>
              <Select value={accessibility.fontSize} onValueChange={(val) => handleAccessibilityChange('fontSize', val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium (Default)</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="x-large">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quick-contrast">Contrast</Label>
              <Select value={accessibility.contrast} onValueChange={(val) => handleAccessibilityChange('contrast', val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal (Default)</SelectItem>
                  <SelectItem value="high">High Contrast</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="quick-reduced-motion">Reduced Motion</Label>
                <p className="text-sm text-neutral-500">
                  Minimize animations
                </p>
              </div>
              <Switch 
                id="quick-reduced-motion" 
                checked={accessibility.reducedMotion}
                onCheckedChange={(checked) => handleAccessibilityChange('reducedMotion', checked)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              localStorage.setItem('userAccessibility', JSON.stringify(accessibility));
              setShowAccessibilityDialog(false);
              toast({
                title: "Accessibility Settings Saved",
                description: "Your quick accessibility preferences have been saved and applied.",
              });
            }}>Save & Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutConfirmDialog} onOpenChange={setShowLogoutConfirmDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>Are you sure you want to log out of your account?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowLogoutConfirmDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleLogout}>Logout</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reset Data Confirm Dialog */}
      <Dialog open={showResetDataDialog} onOpenChange={setShowResetDataDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset Data</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset all your data to default values? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowResetDataDialog(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                handleResetData();
                setShowResetDataDialog(false);
              }}
            >
              Reset Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Account Confirm Dialog */}
      <Dialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete your account? This will remove all your data and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <Alert className="my-4 bg-red-50 text-red-700 border-red-200">
            <AlertDescription>
              This is a permanent action. Once you delete your account, all of your data will be lost forever.
            </AlertDescription>
          </Alert>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDeleteAccountDialog(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                deleteAccount();
                setShowDeleteAccountDialog(false);
              }}
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SettingsPage;