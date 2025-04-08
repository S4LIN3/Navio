import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface InitialAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function InitialAssessmentModal({
  isOpen,
  onClose,
  onComplete,
}: InitialAssessmentModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("welcome");
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    occupation: "",
    phoneNumber: "",
    email: "",
    careerGoals: "",
    personalGoals: "",
    interests: {
      technology: false,
      health: false,
      arts: false,
      business: false,
      finance: false,
      education: false,
      travel: false,
      cooking: false,
    },
    challenges: {
      timeManagement: false,
      stress: false,
      finances: false,
      motivation: false,
      workLifeBalance: false,
      relationships: false,
      health: false,
      career: false,
    },
    priorities: {
      career: 0,
      health: 0,
      relationships: 0,
      personalGrowth: 0,
      finances: 0
    }
  });

  // Pre-fill form data with existing user info if available
  useEffect(() => {
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      try {
        const currentUser = JSON.parse(currentUserStr);
        setFormData(prev => ({
          ...prev,
          name: currentUser.name || prev.name,
          email: currentUser.email || prev.email,
          occupation: currentUser.occupation || prev.occupation,
          phoneNumber: currentUser.phone || prev.phoneNumber
        }));
      } catch (e) {
        console.error("Error parsing current user data", e);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (category: "interests" | "challenges", name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [name]: checked,
      },
    }));
  };
  
  const handlePriorityChange = (key: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      priorities: {
        ...prev.priorities,
        [key]: value,
      },
    }));
  };

  const handleNextTab = () => {
    if (activeTab === "welcome") setActiveTab("personal");
    else if (activeTab === "personal") setActiveTab("goals");
    else if (activeTab === "goals") setActiveTab("interests");
    else if (activeTab === "interests") setActiveTab("challenges");
    else if (activeTab === "challenges") setActiveTab("priorities");
    else if (activeTab === "priorities") handleSubmit();
  };

  const handlePrevTab = () => {
    if (activeTab === "personal") setActiveTab("welcome");
    else if (activeTab === "goals") setActiveTab("personal");
    else if (activeTab === "interests") setActiveTab("goals");
    else if (activeTab === "challenges") setActiveTab("interests");
    else if (activeTab === "priorities") setActiveTab("challenges");
  };
  
  // Validation for the current tab
  const isCurrentTabValid = () => {
    if (activeTab === "welcome") return true;
    if (activeTab === "personal") return !!formData.name;
    if (activeTab === "goals") return true; // Goals are optional
    if (activeTab === "interests") return Object.values(formData.interests).some(v => v); // At least one interest
    if (activeTab === "challenges") return true; // Challenges are optional
    if (activeTab === "priorities") return true; // Priorities are optional
    return true;
  };

  const handleSubmit = async () => {
    try {
      // Transform the form data into the format expected by the API
      const interestsArray = Object.entries(formData.interests)
        .filter(([_, checked]) => checked)
        .map(([name]) => name);
      
      const challengesArray = Object.entries(formData.challenges)
        .filter(([_, checked]) => checked)
        .map(([name]) => name);
      
      // Update the current user profile with the new data
      const currentUserStr = localStorage.getItem('currentUser');
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        const updatedUser = {
          ...currentUser,
          name: formData.name || currentUser.name,
          occupation: formData.occupation || currentUser.occupation,
          phone: formData.phoneNumber || currentUser.phone,
          email: formData.email || currentUser.email
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
      
      // Save assessment data
      localStorage.setItem('userAssessmentResults', JSON.stringify({
        careerGoals: formData.careerGoals,
        personalGoals: formData.personalGoals,
        interests: interestsArray,
        challenges: challengesArray,
        priorities: formData.priorities,
        completedAt: new Date()
      }));
      
      // In a real application, we would also submit to the API
      // For now, we'll just update localStorage
      
      toast({
        title: "Assessment Completed",
        description: "Thank you for completing your initial assessment. Your experience is now personalized.",
      });
      
      onComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save assessment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Welcome to Navio!</DialogTitle>
          <DialogDescription>
            Let's start by getting to know you better. This initial assessment will help us personalize your experience.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} className="w-full">
          {/* Welcome tab */}
          <TabsContent value="welcome" className="pt-4 pb-6">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-medium mb-3">Welcome!</h3>
                <p className="text-neutral-600 mb-4">
                  The Navio is your comprehensive tool for personal development, 
                  well-being, and life management.
                </p>
                <div className="grid grid-cols-2 gap-4 text-center my-8">
                  <div className="border rounded-lg p-4 bg-primary-50">
                    <div className="text-3xl mb-2 text-primary-500">
                      <span className="material-icons">psychology</span>
                    </div>
                    <h4 className="font-medium mb-1">Mental Health</h4>
                    <p className="text-sm text-neutral-600">Track mood and well-being</p>
                  </div>
                  <div className="border rounded-lg p-4 bg-primary-50">
                    <div className="text-3xl mb-2 text-primary-500">
                      <span className="material-icons">flag</span>
                    </div>
                    <h4 className="font-medium mb-1">Goals</h4>
                    <p className="text-sm text-neutral-600">Set and track personal goals</p>
                  </div>
                  <div className="border rounded-lg p-4 bg-primary-50">
                    <div className="text-3xl mb-2 text-primary-500">
                      <span className="material-icons">savings</span>
                    </div>
                    <h4 className="font-medium mb-1">Finances</h4>
                    <p className="text-sm text-neutral-600">Manage your financial goals</p>
                  </div>
                  <div className="border rounded-lg p-4 bg-primary-50">
                    <div className="text-3xl mb-2 text-primary-500">
                      <span className="material-icons">groups</span>
                    </div>
                    <h4 className="font-medium mb-1">Social</h4>
                    <p className="text-sm text-neutral-600">Nurture your relationships</p>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 italic">
                  Please take a moment to complete this short assessment so we can personalize your experience.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Personal Information tab */}
          <TabsContent value="personal" className="pt-4 pb-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleInputChange}
                      placeholder="Software Developer"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+1 (123) 456-7890"
                  />
                  <p className="text-xs text-neutral-500">For contact reminders and social connections features</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Goals tab */}
          <TabsContent value="goals" className="pt-4 pb-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Your Goals</h3>
              <p className="text-neutral-600 text-sm mb-4">
                Tell us about your goals so we can help you track and achieve them.
              </p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="careerGoals">What are your main career goals?</Label>
                  <Textarea
                    id="careerGoals"
                    name="careerGoals"
                    value={formData.careerGoals}
                    onChange={handleInputChange}
                    placeholder="e.g., Get promoted, Switch careers, Learn new skills"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="personalGoals">What personal goals would you like to achieve?</Label>
                  <Textarea
                    id="personalGoals"
                    name="personalGoals"
                    value={formData.personalGoals}
                    onChange={handleInputChange}
                    placeholder="e.g., Improve fitness, Read more books, Learn a language"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Interests tab */}
          <TabsContent value="interests" className="pt-4 pb-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Your Interests</h3>
              <p className="text-neutral-600 text-sm mb-4">
                Select topics that interest you. We'll use this to suggest learning resources.
              </p>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="int-technology"
                      checked={formData.interests.technology}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("interests", "technology", checked as boolean)
                      }
                    />
                    <Label htmlFor="int-technology" className="font-normal">Technology</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="int-health"
                      checked={formData.interests.health}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("interests", "health", checked as boolean)
                      }
                    />
                    <Label htmlFor="int-health" className="font-normal">Health & Fitness</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="int-arts"
                      checked={formData.interests.arts}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("interests", "arts", checked as boolean)
                      }
                    />
                    <Label htmlFor="int-arts" className="font-normal">Arts & Culture</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="int-business"
                      checked={formData.interests.business}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("interests", "business", checked as boolean)
                      }
                    />
                    <Label htmlFor="int-business" className="font-normal">Business</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="int-finance"
                      checked={formData.interests.finance}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("interests", "finance", checked as boolean)
                      }
                    />
                    <Label htmlFor="int-finance" className="font-normal">Finance</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="int-education"
                      checked={formData.interests.education}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("interests", "education", checked as boolean)
                      }
                    />
                    <Label htmlFor="int-education" className="font-normal">Education</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="int-travel"
                      checked={formData.interests.travel}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("interests", "travel", checked as boolean)
                      }
                    />
                    <Label htmlFor="int-travel" className="font-normal">Travel</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="int-cooking"
                      checked={formData.interests.cooking}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("interests", "cooking", checked as boolean)
                      }
                    />
                    <Label htmlFor="int-cooking" className="font-normal">Cooking</Label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Challenges tab */}
          <TabsContent value="challenges" className="pt-4 pb-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Your Challenges</h3>
              <p className="text-neutral-600 text-sm mb-4">
                Let us know what challenges you're facing so we can provide targeted help.
              </p>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ch-timeManagement"
                      checked={formData.challenges.timeManagement}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("challenges", "timeManagement", checked as boolean)
                      }
                    />
                    <Label htmlFor="ch-timeManagement" className="font-normal">Time Management</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ch-stress"
                      checked={formData.challenges.stress}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("challenges", "stress", checked as boolean)
                      }
                    />
                    <Label htmlFor="ch-stress" className="font-normal">Stress & Anxiety</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ch-finances"
                      checked={formData.challenges.finances}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("challenges", "finances", checked as boolean)
                      }
                    />
                    <Label htmlFor="ch-finances" className="font-normal">Financial Planning</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ch-motivation"
                      checked={formData.challenges.motivation}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("challenges", "motivation", checked as boolean)
                      }
                    />
                    <Label htmlFor="ch-motivation" className="font-normal">Motivation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ch-workLifeBalance"
                      checked={formData.challenges.workLifeBalance}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("challenges", "workLifeBalance", checked as boolean)
                      }
                    />
                    <Label htmlFor="ch-workLifeBalance" className="font-normal">Work-Life Balance</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ch-relationships"
                      checked={formData.challenges.relationships}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("challenges", "relationships", checked as boolean)
                      }
                    />
                    <Label htmlFor="ch-relationships" className="font-normal">Relationships</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ch-health"
                      checked={formData.challenges.health}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("challenges", "health", checked as boolean)
                      }
                    />
                    <Label htmlFor="ch-health" className="font-normal">Health Issues</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ch-career"
                      checked={formData.challenges.career}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("challenges", "career", checked as boolean)
                      }
                    />
                    <Label htmlFor="ch-career" className="font-normal">Career Development</Label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Priorities tab */}
          <TabsContent value="priorities" className="pt-4 pb-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Your Priorities</h3>
              <p className="text-neutral-600 text-sm mb-4">
                What aspects of your life would you like to focus on improving the most?
              </p>
              
              <div className="space-y-6">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="pri-career">Career & Professional Growth</Label>
                    <span className="text-sm text-neutral-500">
                      {formData.priorities.career > 2 ? 'High priority' : 
                       formData.priorities.career > 0 ? 'Medium priority' : 'Low priority'}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    id="pri-career"
                    min="0"
                    max="5"
                    step="1"
                    value={formData.priorities.career}
                    onChange={(e) => handlePriorityChange('career', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="pri-health">Health & Wellbeing</Label>
                    <span className="text-sm text-neutral-500">
                      {formData.priorities.health > 2 ? 'High priority' : 
                       formData.priorities.health > 0 ? 'Medium priority' : 'Low priority'}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    id="pri-health"
                    min="0"
                    max="5"
                    step="1"
                    value={formData.priorities.health}
                    onChange={(e) => handlePriorityChange('health', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="pri-relationships">Relationships & Social Life</Label>
                    <span className="text-sm text-neutral-500">
                      {formData.priorities.relationships > 2 ? 'High priority' : 
                       formData.priorities.relationships > 0 ? 'Medium priority' : 'Low priority'}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    id="pri-relationships"
                    min="0"
                    max="5"
                    step="1"
                    value={formData.priorities.relationships}
                    onChange={(e) => handlePriorityChange('relationships', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="pri-personalGrowth">Personal Growth & Learning</Label>
                    <span className="text-sm text-neutral-500">
                      {formData.priorities.personalGrowth > 2 ? 'High priority' : 
                       formData.priorities.personalGrowth > 0 ? 'Medium priority' : 'Low priority'}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    id="pri-personalGrowth"
                    min="0"
                    max="5"
                    step="1"
                    value={formData.priorities.personalGrowth}
                    onChange={(e) => handlePriorityChange('personalGrowth', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="pri-finances">Financial Stability</Label>
                    <span className="text-sm text-neutral-500">
                      {formData.priorities.finances > 2 ? 'High priority' : 
                       formData.priorities.finances > 0 ? 'Medium priority' : 'Low priority'}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    id="pri-finances"
                    min="0"
                    max="5"
                    step="1"
                    value={formData.priorities.finances}
                    onChange={(e) => handlePriorityChange('finances', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
          
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between mt-4">
          {activeTab === "welcome" ? (
            <>
              <Button type="button" variant="outline" onClick={onClose}>Skip for now</Button>
              <Button type="button" onClick={handleNextTab}>Next</Button>
            </>
          ) : activeTab === "priorities" ? (
            <>
              <Button type="button" variant="outline" onClick={handlePrevTab}>Back</Button>
              <Button type="button" onClick={handleSubmit}>Complete Assessment</Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={handlePrevTab}>Back</Button>
              <Button 
                type="button" 
                onClick={handleNextTab}
                disabled={!isCurrentTabValid()}
              >
                Next
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
