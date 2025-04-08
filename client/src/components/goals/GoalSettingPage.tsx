import { useState, useEffect, useDeferredValue } from "react";
import { mockGoals } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Progress } from "@/components/ui/progress";
import { Goal } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { addGoalToCalendar, getLocationSuggestions, LocationData } from "@/lib/google-api";
import { useToast } from "@/hooks/use-toast";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const goalSchema = z.object({
  title: z.string().min(3, { message: "Goal title must be at least 3 characters" }),
  description: z.string().optional(),
  category: z.string().min(1, { message: "Please select a category" }),
  dueDate: z.string().optional(),
  location: z.string().optional(),
});

export function GoalSettingPage() {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [openDialog, setOpenDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationData[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof goalSchema>>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      dueDate: "",
      location: "",
    },
  });
  
  const editForm = useForm<z.infer<typeof goalSchema>>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      dueDate: "",
      location: "",
    },
  });

  const onSubmit = (values: z.infer<typeof goalSchema>) => {
    const newGoal: Goal = {
      id: Math.max(...goals.map(g => g.id), 0) + 1,
      userId: 1,
      title: values.title,
      description: values.description,
      progress: 0,
      isCompleted: false,
      category: values.category,
      dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
      location: values.location,
      steps: []
    };

    setGoals([...goals, newGoal]);
    setOpenDialog(false);
    form.reset();
  };
  
  const handleEditClick = (goal: Goal) => {
    setSelectedGoal(goal);
    editForm.reset({
      title: goal.title,
      description: goal.description || "",
      category: goal.category || "",
      dueDate: goal.dueDate ? new Date(goal.dueDate).toISOString().split('T')[0] : "",
      location: goal.location || "",
    });
    setEditDialog(true);
  };
  
  const handleDeleteClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setDeleteDialog(true);
  };
  
  const onEditSubmit = (values: z.infer<typeof goalSchema>) => {
    if (!selectedGoal) return;
    
    const updatedGoals = goals.map(goal => {
      if (goal.id === selectedGoal.id) {
        return {
          ...goal,
          title: values.title,
          description: values.description,
          category: values.category,
          dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
          location: values.location,
        };
      }
      return goal;
    });
    
    setGoals(updatedGoals);
    setEditDialog(false);
    setSelectedGoal(null);
    editForm.reset();
  };
  
  const confirmDelete = () => {
    if (!selectedGoal) return;
    
    const updatedGoals = goals.filter(goal => goal.id !== selectedGoal.id);
    setGoals(updatedGoals);
    setDeleteDialog(false);
    setSelectedGoal(null);
  };
  
  const handleAddToCalendar = async (goal: Goal) => {
    try {
      setIsAddingToCalendar(true);
      
      const result = await addGoalToCalendar(goal);
      
      if (result.success) {
        toast({
          title: "Added to Calendar",
          description: `"${goal.title}" has been added to your Google Calendar.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Failed to Add to Calendar",
          description: result.error || "An error occurred while adding to calendar.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add goal to calendar. Please try again.",
        variant: "destructive",
      });
      console.error("Calendar error:", error);
    } finally {
      setIsAddingToCalendar(false);
    }
  };
  
  const handleLocationSearch = async (query: string) => {
    if (!query || query.length < 3) {
      setLocationSuggestions([]);
      return;
    }
    
    try {
      setIsLoadingLocations(true);
      const suggestions = await getLocationSuggestions(query);
      setLocationSuggestions(suggestions);
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch location suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingLocations(false);
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Goal Setting</h1>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <span className="material-icons mr-2 text-sm">add</span>
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create a New Goal</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Learn Python Programming" {...field} />
                      </FormControl>
                      <FormDescription>
                        What do you want to achieve?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Complete Python basics and build a simple project" {...field} />
                      </FormControl>
                      <FormDescription>
                        Provide details about your goal
                      </FormDescription>
                      <FormMessage />
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
                          <SelectItem value="Learning">Learning</SelectItem>
                          <SelectItem value="Health">Health</SelectItem>
                          <SelectItem value="Career">Career</SelectItem>
                          <SelectItem value="Personal">Personal</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose the area of your life this goal belongs to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        When do you want to achieve this goal?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Location</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={`w-full justify-between ${!field.value && "text-muted-foreground"}`}
                            >
                              {field.value
                                ? locationSuggestions.find(
                                    (location) => location.name === field.value
                                  )?.name || field.value
                                : "Search for a location"}
                              <span className="material-icons text-sm ml-2">search</span>
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command>
                            <CommandInput
                              placeholder="Search location..."
                              className="h-9"
                              onValueChange={(value) => {
                                handleLocationSearch(value);
                              }}
                            />
                            <CommandList>
                              <CommandEmpty>
                                {isLoadingLocations ? (
                                  <div className="py-6 text-center text-sm">Loading...</div>
                                ) : (
                                  <div className="py-6 text-center text-sm">No locations found</div>
                                )}
                              </CommandEmpty>
                              <CommandGroup>
                                {locationSuggestions.map((location) => (
                                  <CommandItem
                                    key={location.placeId}
                                    value={location.name}
                                    onSelect={() => {
                                      form.setValue("location", location.name);
                                    }}
                                  >
                                    <span className="material-icons text-sm mr-2">location_on</span>
                                    <span>{location.name}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Where will this goal take place?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Goal</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => (
          <Card key={goal.id} className="hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold text-neutral-900">{goal.title}</CardTitle>
                <Badge variant="outline" className={`${goal.category === 'Learning' ? 'bg-primary-100 text-primary-800' : goal.category === 'Health' ? 'bg-accent-100 text-accent-800' : 'bg-secondary-100 text-secondary-800'}`}>
                  {goal.category}
                </Badge>
              </div>
              {goal.description && (
                <p className="text-sm text-neutral-600 mt-1">{goal.description}</p>
              )}
              {goal.location && (
                <div className="flex items-center mt-1">
                  <span className="material-icons text-sm text-neutral-500 mr-1">location_on</span>
                  <p className="text-xs text-neutral-500">{goal.location}</p>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-neutral-700">Progress</span>
                  <span className="text-sm text-neutral-600">{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} className="h-2" />
              </div>
              
              {goal.steps && goal.steps.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h4 className="text-sm font-medium text-neutral-700">Steps:</h4>
                  <ul className="space-y-1">
                    {goal.steps.map((step: any, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <span className={`material-icons text-sm mr-2 ${step.isCompleted ? 'text-green-500' : 'text-neutral-400'}`}>
                          {step.isCompleted ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span className={`${step.isCompleted ? 'line-through text-neutral-500' : 'text-neutral-700'}`}>
                          {step.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex flex-col space-y-2">
                {/* Add to calendar button */}
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                  onClick={() => handleAddToCalendar(goal)}
                  disabled={isAddingToCalendar}
                >
                  <span className="material-icons text-sm mr-1">event</span>
                  Add to Calendar
                </Button>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditClick(goal)}
                  >
                    <span className="material-icons text-sm mr-1">edit</span>
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteClick(goal)}
                  >
                    <span className="material-icons text-sm mr-1">delete</span>
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {goals.length === 0 && (
        <Card className="text-center p-8">
          <div className="flex flex-col items-center">
            <span className="material-icons text-4xl text-neutral-400 mb-2">flag</span>
            <h3 className="text-lg font-medium text-neutral-800 mb-2">No Goals Yet</h3>
            <p className="text-neutral-600 mb-4">Create your first goal to start tracking your progress</p>
            <Button onClick={() => setOpenDialog(true)}>
              <span className="material-icons mr-2 text-sm">add</span>
              Create Goal
            </Button>
          </div>
        </Card>
      )}
      
      {/* Edit Goal Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
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
                        <SelectItem value="Learning">Learning</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Career">Career</SelectItem>
                        <SelectItem value="Personal">Personal</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Location</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={`w-full justify-between ${!field.value && "text-muted-foreground"}`}
                          >
                            {field.value
                              ? locationSuggestions.find(
                                  (location) => location.name === field.value
                                )?.name || field.value
                              : "Search for a location"}
                            <span className="material-icons text-sm ml-2">search</span>
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search location..."
                            className="h-9"
                            onValueChange={(value) => {
                              handleLocationSearch(value);
                            }}
                          />
                          <CommandList>
                            <CommandEmpty>
                              {isLoadingLocations ? (
                                <div className="py-6 text-center text-sm">Loading...</div>
                              ) : (
                                <div className="py-6 text-center text-sm">No locations found</div>
                              )}
                            </CommandEmpty>
                            <CommandGroup>
                              {locationSuggestions.map((location) => (
                                <CommandItem
                                  key={location.placeId}
                                  value={location.name}
                                  onSelect={() => {
                                    editForm.setValue("location", location.name);
                                  }}
                                >
                                  <span className="material-icons text-sm mr-2">location_on</span>
                                  <span>{location.name}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Goal Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Goal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this goal? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedGoal && (
            <div className="py-4">
              <h3 className="font-semibold text-lg mb-2">{selectedGoal.title}</h3>
              {selectedGoal.description && (
                <p className="text-sm text-neutral-600 mb-2">{selectedGoal.description}</p>
              )}
              {selectedGoal.location && (
                <div className="flex items-center mb-2">
                  <span className="material-icons text-sm text-neutral-500 mr-1">location_on</span>
                  <p className="text-xs text-neutral-500">{selectedGoal.location}</p>
                </div>
              )}
              <div className="flex items-center">
                <Badge variant="outline" className={`${selectedGoal.category === 'Learning' ? 'bg-primary-100 text-primary-800' : selectedGoal.category === 'Health' ? 'bg-accent-100 text-accent-800' : 'bg-secondary-100 text-secondary-800'}`}>
                  {selectedGoal.category}
                </Badge>
                <span className="text-sm text-neutral-500 ml-2">
                  {selectedGoal.progress}% complete
                </span>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default GoalSettingPage;
