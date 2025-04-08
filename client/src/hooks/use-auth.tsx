import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { clearUserData } from "@/utils/user-data-utils";
import { apiRequest } from "@/lib/queryClient";

// Type definitions for our user object
interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  dateJoined: Date;
  assessmentCompleted: boolean;
  location?: string;
  occupation?: string;
  bio?: string;
  phone?: string;
}

// Login credentials type
interface LoginCredentials {
  username: string;
  password: string;
}

// Registration data type
interface RegisterData {
  username: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const storedUser = localStorage.getItem('currentUser');
    
    if (isAuthenticated && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Convert date strings back to Date objects
        parsedUser.dateJoined = new Date(parsedUser.dateJoined);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse user data', error);
        // Clear invalid data
        localStorage.removeItem('currentUser');
        localStorage.setItem('isAuthenticated', 'false');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    // Validate form input
    if (!credentials.username || !credentials.password) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return false;
    }

    try {
      // In a real app, this would call your login API endpoint
      // For demo purposes, we're simulating success and using localStorage
      
      // Check if we already have a user with this username in localStorage
      const existingUser = localStorage.getItem('currentUser');
      let userObject;
      
      if (existingUser) {
        userObject = JSON.parse(existingUser);
        
        // Verify username (in a real app, we would check password too)
        if (userObject.username !== credentials.username) {
          // If username doesn't match, create a new demo user
          userObject = {
            id: new Date().getTime(),
            username: credentials.username,
            name: "Demo User",
            email: `${credentials.username}@example.com`,
            dateJoined: new Date(),
            assessmentCompleted: false,
            location: "San Francisco, CA",
            occupation: "Professional",
            bio: "I'm a demo user of Navio",
            phone: "+1 (555) 123-4567"
          };
        }
      } else {
        // Create a demo user if none exists
        userObject = {
          id: new Date().getTime(),
          username: credentials.username,
          name: "Demo User",
          email: `${credentials.username}@example.com`,
          dateJoined: new Date(),
          assessmentCompleted: false,
          location: "San Francisco, CA",
          occupation: "Professional",
          bio: "I'm a demo user of Navio",
          phone: "+1 (555) 123-4567"
        };
      }
      
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUser', JSON.stringify(userObject));
      
      // For existing users, we assume they've completed the assessment
      // For new users, we don't set this yet
      if (existingUser) {
        localStorage.setItem('hasCompletedAssessment', 'true');
        localStorage.setItem('isNewUser', 'false');
      }
      
      // Convert the date string back to Date object
      userObject.dateJoined = new Date(userObject.dateJoined);
      setUser(userObject);
      
      toast({
        title: "Login successful",
        description: "You have been logged in successfully."
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An error occurred during login.",
        variant: "destructive"
      });
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    // Validate form
    if (!data.username || !data.password || !data.confirmPassword) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return false;
    }

    if (data.password !== data.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      // In a real app, this would call your register API endpoint
      const newUser = {
        id: new Date().getTime(),
        username: data.username,
        name: data.name || "New User",
        email: data.email,
        dateJoined: new Date(),
        assessmentCompleted: false,
        location: "",
        occupation: "",
        bio: "Tell us about yourself",
        phone: ""
      };
      
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      localStorage.setItem('hasCompletedAssessment', 'false');
      localStorage.setItem('isNewUser', 'true');
      
      setUser(newUser);
      
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully."
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "An error occurred during registration.",
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = () => {
    localStorage.setItem('isAuthenticated', 'false');
    setUser(null);
    setLocation('/auth');
    
    toast({
      title: "Logged out",
      description: "You have been logged out successfully."
    });
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully."
    });
  };
  
  const deleteAccount = async () => {
    setIsLoading(true);
    
    try {
      // Call the API endpoint to delete the user account and all related data
      await apiRequest("DELETE", "/api/account");
      
      // Clear local storage data
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('currentUser');
      
      // Clear all user data from local storage
      clearUserData();
      
      // Set user to null
      setUser(null);
      
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      
      // Redirect to auth page
      setLocation('/auth');
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Failed to delete your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        deleteAccount,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}