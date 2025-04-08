import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import GoalSetting from "@/pages/GoalSetting";
import MentalHealth from "@/pages/MentalHealth";
import SocialConnections from "@/pages/SocialConnections";
import LearningHub from "@/pages/LearningHub";
import FinancialPlanning from "@/pages/FinancialPlanning";
import Productivity from "@/pages/Productivity";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import AuthPage from "@/pages/auth-page";
import { useState, useEffect } from "react";
import InitialAssessmentModal from "./components/assessment/InitialAssessmentModal";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

// Improved Auth protected route component using the auth hook
function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType, path: string }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/auth');
    }
  }, [isAuthenticated, isLoading, setLocation]);
  
  if (isLoading) {
    return (
      <Route {...rest}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }
  
  return (
    <Route {...rest}>
      {isAuthenticated ? <Component /> : null}
    </Route>
  );
}

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/goals" component={GoalSetting} />
      <ProtectedRoute path="/mental-health" component={MentalHealth} />
      <ProtectedRoute path="/social" component={SocialConnections} />
      <ProtectedRoute path="/learning" component={LearningHub} />
      <ProtectedRoute path="/finance" component={FinancialPlanning} />
      <ProtectedRoute path="/productivity" component={Productivity} />
      <ProtectedRoute path="/settings" component={Settings} />
      <ProtectedRoute path="/profile" component={Profile} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showAssessment, setShowAssessment] = useState(false);
  
  // Monitor authentication status to detect new logins
  useEffect(() => {
    // Listen for changes to auth status (login/logout)
    const checkAuthStatus = () => {
      // New user login detection - show assessment ONLY for new users
      const hasCompletedAssessment = localStorage.getItem('hasCompletedAssessment');
      const isNewUser = localStorage.getItem('isNewUser');
      
      if (localStorage.getItem('isAuthenticated') === 'true' && 
          isNewUser === 'true' && 
          (hasCompletedAssessment === 'false' || hasCompletedAssessment === null)) {
        setShowAssessment(true);
      } else {
        setShowAssessment(false);
      }
    };
    
    // Check immediately on mount
    checkAuthStatus();
    
    // Set up interval to periodically check authentication status (handles login from other tabs)
    const intervalId = setInterval(checkAuthStatus, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  const onAssessmentComplete = () => {
    localStorage.setItem('hasCompletedAssessment', 'true');
    setShowAssessment(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
        {showAssessment && (
          <InitialAssessmentModal 
            isOpen={showAssessment}
            onClose={() => setShowAssessment(false)}
            onComplete={onAssessmentComplete}
          />
        )}
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
