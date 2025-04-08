import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LearningResource } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { loadUserLearningResources, saveUserLearningResources } from "@/utils/user-data-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const resourceSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  category: z.string().min(1, { message: "Please select a category" }),
  url: z.string().url({ message: "Please enter a valid URL" }),
});

export function LearningHubPage() {
  const [resources, setResources] = useState<LearningResource[]>(loadUserLearningResources());
  const [openDialog, setOpenDialog] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<LearningResource | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  const form = useForm<z.infer<typeof resourceSchema>>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: "",
      category: "",
      url: "",
    },
  });

  // Save resources to localStorage whenever they change
  const saveResourcesToLocalStorage = (updatedResources: LearningResource[]) => {
    saveUserLearningResources(updatedResources);
  };

  // Handle form submission for new resources
  const onSubmit = (values: z.infer<typeof resourceSchema>) => {
    const newResource: LearningResource = {
      id: Math.max(...resources.map(r => r.id), 0) + 1,
      userId: 1,
      title: values.title,
      category: values.category,
      url: values.url,
      isCompleted: false,
      progress: 0
    };

    const updatedResources = [...resources, newResource];
    setResources(updatedResources);
    saveResourcesToLocalStorage(updatedResources);
    setOpenDialog(false);
    form.reset();
  };
  
  // Delete a resource
  const handleDeleteResource = () => {
    if (!resourceToDelete) return;
    
    const updatedResources = resources.filter(resource => resource.id !== resourceToDelete.id);
    setResources(updatedResources);
    saveResourcesToLocalStorage(updatedResources);
    setResourceToDelete(null);
    setOpenDeleteDialog(false);
  };

  const getCategoryColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'technology': return 'bg-primary-100 text-primary-800';
      case 'career': return 'bg-secondary-100 text-secondary-800';
      case 'health': return 'bg-accent-100 text-accent-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Learning Hub</h1>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <span className="material-icons mr-2 text-sm">add</span>
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add a Learning Resource</DialogTitle>
              <DialogDescription>
                Track courses, books, or articles you want to learn from.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Introduction to Machine Learning" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Technology">Technology</SelectItem>
                          <SelectItem value="Career">Career</SelectItem>
                          <SelectItem value="Health">Health</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Personal">Personal</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/course" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit">Add Resource</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="learning">
        <TabsList>
          <TabsTrigger value="learning">My Learning</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        <TabsContent value="learning">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {resources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-medium">{resource.title}</CardTitle>
                    <Badge variant="outline" className={getCategoryColor(resource.category)}>
                      {resource.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-neutral-700">Progress</span>
                      <span className="text-sm text-neutral-600">{resource.progress}%</span>
                    </div>
                    <Progress value={resource.progress} className="h-2" />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => window.open(resource.url, '_blank')}
                    >
                      <span className="material-icons text-sm mr-1">open_in_new</span>
                      Open
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setResourceToDelete(resource);
                        setOpenDeleteDialog(true);
                      }}
                    >
                      <span className="material-icons text-sm mr-1 text-destructive">delete</span>
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="recommendations">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Advanced Python Programming</CardTitle>
                <Badge variant="outline" className="bg-primary-100 text-primary-800 mt-1">
                  Technology
                </Badge>
                <CardDescription className="mt-2">
                  Take your Python skills to the next level with advanced concepts and patterns.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="flex items-center">
                    <span className="material-icons text-neutral-500 mr-1 text-sm">schedule</span>
                    <span className="text-neutral-500">8 weeks</span>
                  </div>
                  <div className="flex items-center">
                    <span className="material-icons text-yellow-500 mr-1 text-sm">star</span>
                    <span className="text-neutral-500">4.8/5</span>
                  </div>
                </div>
                <Button variant="default" size="sm" className="w-full">
                  Add to My Learning
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Mindfulness for Productivity</CardTitle>
                <Badge variant="outline" className="bg-accent-100 text-accent-800 mt-1">
                  Health
                </Badge>
                <CardDescription className="mt-2">
                  Learn how mindfulness practices can boost your focus and productivity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="flex items-center">
                    <span className="material-icons text-neutral-500 mr-1 text-sm">schedule</span>
                    <span className="text-neutral-500">4 weeks</span>
                  </div>
                  <div className="flex items-center">
                    <span className="material-icons text-yellow-500 mr-1 text-sm">star</span>
                    <span className="text-neutral-500">4.9/5</span>
                  </div>
                </div>
                <Button variant="default" size="sm" className="w-full">
                  Add to My Learning
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Financial Planning Essentials</CardTitle>
                <Badge variant="outline" className="bg-neutral-100 text-neutral-800 mt-1">
                  Finance
                </Badge>
                <CardDescription className="mt-2">
                  Master the fundamentals of personal finance and investment strategies.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="flex items-center">
                    <span className="material-icons text-neutral-500 mr-1 text-sm">schedule</span>
                    <span className="text-neutral-500">6 weeks</span>
                  </div>
                  <div className="flex items-center">
                    <span className="material-icons text-yellow-500 mr-1 text-sm">star</span>
                    <span className="text-neutral-500">4.7/5</span>
                  </div>
                </div>
                <Button variant="default" size="sm" className="w-full">
                  Add to My Learning
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Popular Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-primary-50 to-primary-100 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <span className="material-icons text-primary-600 text-3xl mr-4">code</span>
                <div>
                  <h3 className="text-lg font-medium text-primary-900">Technology</h3>
                  <p className="text-sm text-primary-700 mt-1">Programming, data science, AI and more</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-secondary-50 to-secondary-100 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <span className="material-icons text-secondary-600 text-3xl mr-4">work</span>
                <div>
                  <h3 className="text-lg font-medium text-secondary-900">Career Development</h3>
                  <p className="text-sm text-secondary-700 mt-1">Leadership, communication, management</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-accent-50 to-accent-100 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <span className="material-icons text-accent-600 text-3xl mr-4">spa</span>
                <div>
                  <h3 className="text-lg font-medium text-accent-900">Health & Wellness</h3>
                  <p className="text-sm text-accent-700 mt-1">Fitness, nutrition, mental health</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{resourceToDelete?.title}" from your learning resources.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteResource} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default LearningHubPage;
