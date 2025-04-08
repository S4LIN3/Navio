import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { clearUserData } from "@/utils/user-data-utils";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { login, register, isAuthenticated, isLoading } = useAuth();
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: ""
  });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Check if user is already logged in
  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Clear previous user data since this could be a different user
      clearUserData();
      
      const success = await login(loginForm);
      if (success) {
        // Redirect happens in the useEffect
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Clear all previous user data and initialize fresh data for the new user
      clearUserData();
      
      const success = await register(registerForm);
      if (success) {
        // Redirect happens in the useEffect
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      {/* Hero Section */}
      <div className="flex-1 bg-gradient-to-br from-primary-500 to-primary-700 text-white p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-4">Navio</h1>
          <p className="text-xl mb-6">Your comprehensive life management platform</p>
          <ul className="space-y-3">
            <li className="flex items-center">
              <span className="material-icons mr-2">check_circle</span>
              <span>Track and improve your mental health</span>
            </li>
            <li className="flex items-center">
              <span className="material-icons mr-2">check_circle</span>
              <span>Set and achieve personal goals</span>
            </li>
            <li className="flex items-center">
              <span className="material-icons mr-2">check_circle</span>
              <span>Manage your finances effectively</span>
            </li>
            <li className="flex items-center">
              <span className="material-icons mr-2">check_circle</span>
              <span>Nurture your social connections</span>
            </li>
            <li className="flex items-center">
              <span className="material-icons mr-2">check_circle</span>
              <span>Access personalized learning resources</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Form Section */}
      <div className="flex-1 bg-background p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Login or create a new account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Username</Label>
                    <Input 
                      id="login-username" 
                      name="username" 
                      placeholder="Enter your username" 
                      value={loginForm.username}
                      onChange={handleLoginChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Password</Label>
                      <Button variant="link" className="p-0 h-auto" type="button">
                        Forgot password?
                      </Button>
                    </div>
                    <Input 
                      id="login-password" 
                      name="password" 
                      type="password" 
                      placeholder="Enter your password" 
                      value={loginForm.password}
                      onChange={handleLoginChange}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : "Login"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Username</Label>
                    <Input 
                      id="register-username" 
                      name="username" 
                      placeholder="Choose a username" 
                      value={registerForm.username}
                      onChange={handleRegisterChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full Name</Label>
                    <Input 
                      id="register-name" 
                      name="name" 
                      placeholder="Enter your full name"
                      value={registerForm.name}
                      onChange={handleRegisterChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input 
                      id="register-email" 
                      name="email" 
                      type="email" 
                      placeholder="Enter your email"
                      value={registerForm.email}
                      onChange={handleRegisterChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input 
                      id="register-password" 
                      name="password" 
                      type="password" 
                      placeholder="Create a password"
                      value={registerForm.password}
                      onChange={handleRegisterChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Confirm Password</Label>
                    <Input 
                      id="register-confirm-password" 
                      name="confirmPassword" 
                      type="password" 
                      placeholder="Confirm your password"
                      value={registerForm.confirmPassword}
                      onChange={handleRegisterChange}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-neutral-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}