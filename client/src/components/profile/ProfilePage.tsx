import { useState } from "react";
import { format } from "date-fns";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { currentUser, mockGoals, mockTasks, mockMoodData } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

export function ProfilePage() {
  const [, setLocation] = useLocation();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  // Get user data from localStorage or use defaults if not available
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      return {
        ...parsedUser,
        dateJoined: parsedUser.dateJoined ? new Date(parsedUser.dateJoined) : new Date(),
        email: parsedUser.email || "",
        phone: parsedUser.phone || "",
        bio: parsedUser.bio || "Tell us about yourself",
        location: parsedUser.location || "",
        occupation: parsedUser.occupation || "",
      };
    }
    
    return {
      ...currentUser,
      email: "",
      phone: "",
      bio: "Tell us about yourself",
      dateJoined: new Date(),
      location: "",
      occupation: "",
    };
  });
  
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ ...user });
  const { toast } = useToast();
  
  const completedGoals = mockGoals.filter(goal => goal.isCompleted).length;
  const completedTasks = mockTasks.filter(task => task.isCompleted).length;
  const avgMoodScore = mockMoodData.reduce((sum, mood) => sum + mood.score, 0) / mockMoodData.length;
  
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out of your account."
    });
    setLocation('/auth');
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSave = () => {
    const updatedUser = {...formData};
    setUser(updatedUser);
    setEditing(false);
    
    // Update in localStorage to persist changes
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    });
  };
  
  const handleCancel = () => {
    setFormData({ ...user });
    setEditing(false);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <div className="flex gap-3">
          {!editing && (
            <>
              <Button onClick={() => setEditing(true)}>
                <span className="material-icons mr-2">edit</span>
                Edit Profile
              </Button>
              <Button 
                variant="outline" 
                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={() => setShowLogoutDialog(true)}
              >
                <span className="material-icons mr-2">logout</span>
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Logout Confirmation</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout? You will need to log back in to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        {/* Profile Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Avatar className="w-32 h-32 border-4 border-primary-100">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt={user.name} />
                <AvatarFallback className="text-3xl">{user.name?.slice(0, 2) || 'U'}</AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-semibold">{user.name}</h2>
              <p className="text-muted-foreground">{user.occupation}</p>
              <p className="text-muted-foreground text-sm mt-1">{user.location}</p>
              <p className="text-muted-foreground text-sm mt-1">Member since {format(user.dateJoined, 'MMMM yyyy')}</p>
            </CardContent>
          </Card>
          
          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Statistics</CardTitle>
              <CardDescription>Your activity on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Completed Goals</span>
                    <span className="font-medium">{completedGoals}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-neutral-100 overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full" 
                      style={{ width: `${(completedGoals / mockGoals.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Completed Tasks</span>
                    <span className="font-medium">{completedTasks}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-neutral-100 overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${(completedTasks / mockTasks.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Average Mood</span>
                    <span className="font-medium">{avgMoodScore.toFixed(1)}/10</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-neutral-100 overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full" 
                      style={{ width: `${(avgMoodScore / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Manage your personal details and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="account">Account</TabsTrigger>
                </TabsList>
                
                <TabsContent value="personal" className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      {editing ? (
                        <Input 
                          id="name" 
                          name="name" 
                          value={formData.name} 
                          onChange={handleInputChange} 
                        />
                      ) : (
                        <div className="p-2 border rounded-md">{user.name}</div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="occupation">Occupation</Label>
                      {editing ? (
                        <Input 
                          id="occupation" 
                          name="occupation" 
                          value={formData.occupation} 
                          onChange={handleInputChange} 
                        />
                      ) : (
                        <div className="p-2 border rounded-md">{user.occupation}</div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      {editing ? (
                        <Input 
                          id="location" 
                          name="location" 
                          value={formData.location} 
                          onChange={handleInputChange} 
                        />
                      ) : (
                        <div className="p-2 border rounded-md">{user.location}</div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      {editing ? (
                        <Input 
                          id="bio" 
                          name="bio" 
                          value={formData.bio} 
                          onChange={handleInputChange} 
                        />
                      ) : (
                        <div className="p-2 border rounded-md">{user.bio}</div>
                      )}
                    </div>
                  </div>
                  
                  {editing && (
                    <div className="flex justify-end gap-2 mt-6">
                      <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                      <Button onClick={handleSave}>Save Changes</Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="account" className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      {editing ? (
                        <Input 
                          id="username" 
                          name="username" 
                          value={formData.username} 
                          onChange={handleInputChange} 
                        />
                      ) : (
                        <div className="p-2 border rounded-md">{user.username}</div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      {editing ? (
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          value={formData.email} 
                          onChange={handleInputChange} 
                        />
                      ) : (
                        <div className="p-2 border rounded-md">{user.email}</div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      {editing ? (
                        <Input 
                          id="phone" 
                          name="phone" 
                          value={formData.phone} 
                          onChange={handleInputChange} 
                        />
                      ) : (
                        <div className="p-2 border rounded-md">{user.phone}</div>
                      )}
                    </div>
                  </div>
                  
                  {editing && (
                    <div className="flex justify-end gap-2 mt-6">
                      <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                      <Button onClick={handleSave}>Save Changes</Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>Manage your privacy settings and security preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Change Password</h3>
                    <p className="text-sm text-muted-foreground">Update your password regularly for better security</p>
                  </div>
                  <Button variant="outline">Change Password</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Data Privacy</h3>
                    <p className="text-sm text-muted-foreground">Manage how your data is used and shared</p>
                  </div>
                  <Button variant="outline">Privacy Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}