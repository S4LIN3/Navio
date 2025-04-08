import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import FocusMode from "./FocusMode";
import TaskTemplates from "./TaskTemplates";
import ProductivityStats from "./ProductivityStats";

interface Task {
  id: number;
  title: string;
  description?: string;
  isCompleted: boolean;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  category: string;
  estimatedMinutes?: number;
  timeSpent?: number;
}

interface TimeEntry {
  id: number;
  taskId: number;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  notes?: string;
}

interface PomodoroSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

type TimerType = 'pomodoro' | 'shortBreak' | 'longBreak';

interface TaskTemplate {
  id: number;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  estimatedMinutes?: number;
}

const taskSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  category: z.string().min(1, { message: "Please select a category" }),
  estimatedMinutes: z.number().min(1).optional(),
});

export function ProductivityPage() {
  // Tasks state
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('userProductivityTasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        // Convert dueDate strings back to Date objects
        return parsedTasks.map((task: any) => ({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined
        }));
      } catch (e) {
        console.error('Failed to parse saved tasks', e);
        return [];
      }
    }
    return [];
  });
  
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(() => {
    const savedEntries = localStorage.getItem('userTimeEntries');
    if (savedEntries) {
      try {
        const parsedEntries = JSON.parse(savedEntries);
        // Convert date strings back to Date objects
        return parsedEntries.map((entry: any) => ({
          ...entry,
          startTime: new Date(entry.startTime),
          endTime: entry.endTime ? new Date(entry.endTime) : undefined
        }));
      } catch (e) {
        console.error('Failed to parse saved time entries', e);
        return [];
      }
    }
    return [];
  });

  // State for edit/delete operations
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  // State for time tracking
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [trackingStartTime, setTrackingStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  
  // State for Pomodoro timer
  const [pomodoroSettings, setPomodoroSettings] = useState<PomodoroSettings>(() => {
    const savedSettings = localStorage.getItem('userPomodoroSettings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        console.error('Failed to parse saved pomodoro settings', e);
      }
    }
    return {
      workDuration: 25, // 25 minutes
      shortBreakDuration: 5, // 5 minutes
      longBreakDuration: 15, // 15 minutes
      sessionsBeforeLongBreak: 4,
      autoStartBreaks: false,
      autoStartPomodoros: false
    };
  });
  
  const [timerType, setTimerType] = useState<TimerType>('pomodoro');
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerTime, setTimerTime] = useState(pomodoroSettings.workDuration * 60); // in seconds
  const [completedSessions, setCompletedSessions] = useState(0);
  const [openPomodoroSettings, setOpenPomodoroSettings] = useState(false);
  
  // Refs for intervals
  const timerIntervalRef = useRef<number | null>(null);
  const timeTrackingIntervalRef = useRef<number | null>(null);
  
  // Form for task creation/editing
  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      category: "",
    },
  });
  
  // Reset form when opening the dialog for creating a new task
  useEffect(() => {
    if (openTaskDialog && !taskToEdit) {
      form.reset({
        title: "",
        description: "",
        priority: "medium",
        category: "",
      });
    }
  }, [openTaskDialog, taskToEdit, form]);
  
  // Set form values when editing a task
  useEffect(() => {
    if (taskToEdit) {
      form.reset({
        title: taskToEdit.title,
        description: taskToEdit.description || "",
        dueDate: taskToEdit.dueDate,
        priority: taskToEdit.priority,
        category: taskToEdit.category,
        estimatedMinutes: taskToEdit.estimatedMinutes,
      });
      setOpenTaskDialog(true);
    }
  }, [taskToEdit, form]);

  // Save data whenever it changes
  useEffect(() => {
    localStorage.setItem('userProductivityTasks', JSON.stringify(tasks));
  }, [tasks]);
  
  useEffect(() => {
    localStorage.setItem('userTimeEntries', JSON.stringify(timeEntries));
  }, [timeEntries]);
  
  useEffect(() => {
    localStorage.setItem('userPomodoroSettings', JSON.stringify(pomodoroSettings));
  }, [pomodoroSettings]);
  
  // Time tracking interval
  useEffect(() => {
    if (trackingStartTime && activeTask) {
      // Clear any existing interval
      if (timeTrackingIntervalRef.current) {
        window.clearInterval(timeTrackingIntervalRef.current);
      }
      
      // Set up new interval
      timeTrackingIntervalRef.current = window.setInterval(() => {
        const now = new Date();
        const seconds = Math.floor((now.getTime() - trackingStartTime.getTime()) / 1000);
        setElapsedTime(seconds);
      }, 1000);
      
      // Clean up interval on unmount
      return () => {
        if (timeTrackingIntervalRef.current) {
          window.clearInterval(timeTrackingIntervalRef.current);
        }
      };
    }
  }, [trackingStartTime, activeTask]);
  
  // Pomodoro timer interval
  useEffect(() => {
    if (timerRunning) {
      // Clear any existing interval
      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current);
      }
      
      // Set up new interval
      timerIntervalRef.current = window.setInterval(() => {
        setTimerTime(prevTime => {
          if (prevTime <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      // Clean up interval on unmount
      return () => {
        if (timerIntervalRef.current) {
          window.clearInterval(timerIntervalRef.current);
        }
      };
    } else if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
    }
  }, [timerRunning]);

  // Handle timer completion
  const handleTimerComplete = () => {
    // Stop the timer
    setTimerRunning(false);
    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    // Play a sound
    const audio = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3");
    audio.play();
    
    // Show a notification if supported
    if (Notification && Notification.permission === "granted") {
      let notificationTitle = "Pomodoro Timer";
      let notificationBody = "";
      
      if (timerType === 'pomodoro') {
        notificationTitle = "Work Session Complete!";
        notificationBody = "Great job! Take a break to recharge.";
      } else if (timerType === 'shortBreak') {
        notificationTitle = "Short Break Complete";
        notificationBody = "Time to get back to work!";
      } else {
        notificationTitle = "Long Break Complete";
        notificationBody = "Ready for a new work session?";
      }
      
      new Notification(notificationTitle, {
        body: notificationBody,
        icon: "/favicon.ico"
      });
    }
    
    // Update timer type and sessions
    if (timerType === 'pomodoro') {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);
      
      // Mark a randomly selected incomplete task as complete when a pomodoro is finished
      // This is optional and builds a sense of accomplishment
      const incompleteTasks = tasks.filter(task => !task.isCompleted);
      if (incompleteTasks.length > 0 && activeTask) {
        // If there's an active task, mark progress on it
        const updatedTasks = tasks.map(task => {
          if (task.id === activeTask.id) {
            // If the task has estimated time, update progress accordingly
            if (task.estimatedMinutes) {
              const remainingTime = (task.estimatedMinutes || 0) - (task.timeSpent || 0) - pomodoroSettings.workDuration;
              // If completed
              if (remainingTime <= 0) {
                return { ...task, isCompleted: true, timeSpent: task.estimatedMinutes };
              } else {
                // Update time spent
                return { ...task, timeSpent: (task.timeSpent || 0) + pomodoroSettings.workDuration };
              }
            }
          }
          return task;
        });
        setTasks(updatedTasks);
      }
      
      // Determine the next break type
      if (newCompletedSessions % pomodoroSettings.sessionsBeforeLongBreak === 0) {
        setTimerType('longBreak');
        setTimerTime(pomodoroSettings.longBreakDuration * 60);
        
        // During long breaks, suggest rest activities
        const longBreakActivities = [
          "Take a walk outside for fresh air",
          "Do some quick stretching exercises",
          "Meditate for a few minutes",
          "Make yourself a cup of tea or coffee",
          "Listen to relaxing music",
          "Rest your eyes by looking at distant objects",
          "Practice deep breathing exercises"
        ];
        
        // Toast notification with a suggestion
        if (window.confirm(`Long Break Started! 
Suggestion: ${longBreakActivities[Math.floor(Math.random() * longBreakActivities.length)]}
Duration: ${pomodoroSettings.longBreakDuration} minutes`)) {
          // User acknowledged
        }
      } else {
        setTimerType('shortBreak');
        setTimerTime(pomodoroSettings.shortBreakDuration * 60);
        
        // During short breaks, suggest quick activities
        const shortBreakActivities = [
          "Stand up and stretch",
          "Take a few deep breaths",
          "Refill your water bottle",
          "Rest your eyes for a moment",
          "Do a quick posture check"
        ];
        
        // Toast notification with a suggestion
        if (window.confirm(`Short Break Started! 
Suggestion: ${shortBreakActivities[Math.floor(Math.random() * shortBreakActivities.length)]}
Duration: ${pomodoroSettings.shortBreakDuration} minutes`)) {
          // User acknowledged
        }
      }
      
      // Auto-start breaks if enabled
      if (pomodoroSettings.autoStartBreaks) {
        setTimerRunning(true);
      }
    } else {
      // If this was a break, the next timer is a pomodoro
      setTimerType('pomodoro');
      setTimerTime(pomodoroSettings.workDuration * 60);
      
      // Show a motivational message before starting a new pomodoro
      const motivationalMessages = [
        "Let's tackle the next task with focus!",
        "Ready for another productive session?",
        "Focus mode activated!",
        "You're making great progress!",
        "Stay focused and conquer your goals!"
      ];
      
      if (timerType === 'longBreak') {
        // After a long break, show a more substantial message
        if (window.confirm(`New Work Session! 
${motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]}
Duration: ${pomodoroSettings.workDuration} minutes`)) {
          // User acknowledged
        }
      }
      
      // Auto-start pomodoros if enabled
      if (pomodoroSettings.autoStartPomodoros) {
        setTimerRunning(true);
      }
    }
  };
  
  // Task management functions
  const onSubmitTask = (values: z.infer<typeof taskSchema>) => {
    if (taskToEdit) {
      // Update existing task
      const updatedTasks = tasks.map(task => 
        task.id === taskToEdit.id 
          ? { ...task, ...values, isCompleted: task.isCompleted } 
          : task
      );
      setTasks(updatedTasks);
    } else {
      // Create new task
      const newTask: Task = {
        id: Math.max(...tasks.map(t => t.id), 0) + 1,
        ...values,
        isCompleted: false,
      };
      setTasks([...tasks, newTask]);
    }
    
    setOpenTaskDialog(false);
    setTaskToEdit(null);
  };
  
  const handleDeleteTask = () => {
    if (!taskToDelete) return;
    
    // Remove task
    const updatedTasks = tasks.filter(task => task.id !== taskToDelete.id);
    setTasks(updatedTasks);
    
    // Remove any time entries for this task
    const updatedTimeEntries = timeEntries.filter(entry => entry.taskId !== taskToDelete.id);
    setTimeEntries(updatedTimeEntries);
    
    setTaskToDelete(null);
    setOpenDeleteDialog(false);
  };
  
  const toggleTaskCompletion = (taskId: number) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
    );
    setTasks(updatedTasks);
  };
  
  // Time tracking functions
  const startTimeTracking = (task: Task) => {
    // If already tracking a different task, stop that first
    if (trackingStartTime && activeTask && activeTask.id !== task.id) {
      stopTimeTracking();
    }
    
    setActiveTask(task);
    const now = new Date();
    setTrackingStartTime(now);
    
    // Start a new time entry
    const newEntry: TimeEntry = {
      id: Math.max(...timeEntries.map(e => e.id), 0) + 1,
      taskId: task.id,
      startTime: now,
    };
    setTimeEntries([...timeEntries, newEntry]);
  };
  
  const stopTimeTracking = () => {
    if (!trackingStartTime || !activeTask) return;
    
    const now = new Date();
    
    // Update the current time entry
    const updatedEntries = timeEntries.map(entry => {
      if (entry.taskId === activeTask.id && !entry.endTime) {
        const durationMinutes = Math.round((now.getTime() - entry.startTime.getTime()) / (1000 * 60));
        return {
          ...entry,
          endTime: now,
          duration: durationMinutes
        };
      }
      return entry;
    });
    
    // Update task with total time spent
    const taskTimeEntries = updatedEntries.filter(entry => 
      entry.taskId === activeTask.id && entry.duration !== undefined
    );
    const totalMinutes = taskTimeEntries.reduce((total, entry) => total + (entry.duration || 0), 0);
    
    const updatedTasks = tasks.map(task => 
      task.id === activeTask.id ? { ...task, timeSpent: totalMinutes } : task
    );
    
    setTasks(updatedTasks);
    setTimeEntries(updatedEntries);
    setActiveTask(null);
    setTrackingStartTime(null);
    setElapsedTime(0);
    
    if (timeTrackingIntervalRef.current) {
      window.clearInterval(timeTrackingIntervalRef.current);
      timeTrackingIntervalRef.current = null;
    }
  };
  
  // Helper functions
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours > 0 ? hours : null,
      minutes.toString().padStart(hours > 0 ? 2 : 1, '0'),
      secs.toString().padStart(2, '0')
    ].filter(Boolean).join(':');
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };
  
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'work': return 'bg-blue-100 text-blue-800';
      case 'personal': return 'bg-purple-100 text-purple-800';
      case 'health': return 'bg-green-100 text-green-800';
      case 'education': return 'bg-amber-100 text-amber-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };
  
  const getTimerTypeColor = (type: TimerType) => {
    switch (type) {
      case 'pomodoro': return 'text-red-600';
      case 'shortBreak': return 'text-green-600';
      case 'longBreak': return 'text-blue-600';
      default: return 'text-neutral-600';
    }
  };
  
  const handleRequestNotificationPermission = () => {
    if (Notification && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  };
  
  const handlePomodoroSettingChange = (setting: keyof PomodoroSettings, value: number | boolean) => {
    setPomodoroSettings(prev => {
      const updated = { ...prev, [setting]: value };
      
      // Update timer time if needed
      if (!timerRunning) {
        if (timerType === 'pomodoro' && setting === 'workDuration') {
          setTimerTime((value as number) * 60);
        } else if (timerType === 'shortBreak' && setting === 'shortBreakDuration') {
          setTimerTime((value as number) * 60);
        } else if (timerType === 'longBreak' && setting === 'longBreakDuration') {
          setTimerTime((value as number) * 60);
        }
      }
      
      return updated;
    });
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Productivity</h1>
        <Dialog open={openTaskDialog} onOpenChange={setOpenTaskDialog}>
          <DialogTrigger asChild>
            <Button>
              <span className="material-icons mr-2 text-sm">add</span>
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{taskToEdit ? 'Edit Task' : 'Add a New Task'}</DialogTitle>
              <DialogDescription>
                {taskToEdit 
                  ? 'Update the details of your task below.' 
                  : 'Enter the details of your task to add it to your list.'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitTask)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Complete project proposal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Additional details about the task" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="date"
                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value ? new Date(value) : undefined);
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="estimatedMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Time (Minutes)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="60"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            value={field.value || ''}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
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
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Work">Work</SelectItem>
                            <SelectItem value="Personal">Personal</SelectItem>
                            <SelectItem value="Health">Health</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button type="submit">{taskToEdit ? 'Update Task' : 'Add Task'}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="tasks">
        <TabsList className="grid grid-cols-5 w-[600px]">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="time-tracking">Time Tracking</TabsTrigger>
          <TabsTrigger value="pomodoro">Pomodoro Timer</TabsTrigger>
          <TabsTrigger value="focus">Focus Mode</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>
        
        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pending Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center">
                  <span className="material-icons mr-2">pending_actions</span>
                  Pending Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tasks.filter(task => !task.isCompleted).length === 0 ? (
                  <div className="text-center py-4 text-neutral-500">
                    <span className="material-icons text-3xl mb-2">check_circle</span>
                    <p>No pending tasks</p>
                  </div>
                ) : (
                  tasks
                    .filter(task => !task.isCompleted)
                    .map(task => (
                      <div key={task.id} className="p-3 border rounded-lg hover:bg-neutral-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-2">
                            <Checkbox 
                              id={`task-${task.id}`}
                              checked={task.isCompleted}
                              onCheckedChange={() => toggleTaskCompletion(task.id)}
                            />
                            <div>
                              <label 
                                htmlFor={`task-${task.id}`}
                                className="text-base font-medium cursor-pointer"
                              >
                                {task.title}
                              </label>
                              {task.description && (
                                <p className="text-sm text-neutral-600 mt-1">{task.description}</p>
                              )}
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                  {task.priority}
                                </Badge>
                                <Badge variant="outline" className={getCategoryColor(task.category)}>
                                  {task.category}
                                </Badge>
                                {task.dueDate && (
                                  <Badge variant="outline">
                                    <span className="material-icons text-xs mr-1">event</span>
                                    {new Date(task.dueDate).toLocaleDateString()}
                                  </Badge>
                                )}
                                {task.estimatedMinutes && (
                                  <Badge variant="outline">
                                    <span className="material-icons text-xs mr-1">schedule</span>
                                    {task.estimatedMinutes} min
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setTaskToEdit(task)}
                            >
                              <span className="material-icons text-neutral-600 text-sm">edit</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setTaskToDelete(task);
                                setOpenDeleteDialog(true);
                              }}
                            >
                              <span className="material-icons text-neutral-600 text-sm">delete</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </CardContent>
            </Card>
            
            {/* Completed Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center">
                  <span className="material-icons mr-2">task_alt</span>
                  Completed Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tasks.filter(task => task.isCompleted).length === 0 ? (
                  <div className="text-center py-4 text-neutral-500">
                    <span className="material-icons text-3xl mb-2">pending_actions</span>
                    <p>No completed tasks yet</p>
                  </div>
                ) : (
                  tasks
                    .filter(task => task.isCompleted)
                    .map(task => (
                      <div key={task.id} className="p-3 border rounded-lg bg-neutral-50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-2">
                            <Checkbox 
                              id={`task-${task.id}`}
                              checked={task.isCompleted}
                              onCheckedChange={() => toggleTaskCompletion(task.id)}
                            />
                            <div>
                              <label 
                                htmlFor={`task-${task.id}`}
                                className="text-base font-medium cursor-pointer line-through text-neutral-500"
                              >
                                {task.title}
                              </label>
                              {task.description && (
                                <p className="text-sm text-neutral-500 mt-1 line-through">{task.description}</p>
                              )}
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="outline" className="opacity-60">
                                  {task.priority}
                                </Badge>
                                <Badge variant="outline" className="opacity-60">
                                  {task.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setTaskToDelete(task);
                              setOpenDeleteDialog(true);
                            }}
                          >
                            <span className="material-icons text-neutral-500 text-sm">delete</span>
                          </Button>
                        </div>
                      </div>
                    ))
                )}
              </CardContent>
            </Card>
            
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center">
                  <span className="material-icons mr-2">insights</span>
                  Productivity Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Task completion rate */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-sm font-medium">Task Completion Rate</h3>
                    <span className="text-sm text-neutral-600">
                      {tasks.length > 0 
                        ? `${Math.round((tasks.filter(task => task.isCompleted).length / tasks.length) * 100)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                  <Progress 
                    value={tasks.length > 0 
                      ? (tasks.filter(task => task.isCompleted).length / tasks.length) * 100
                      : 0
                    } 
                    className="h-2"
                  />
                </div>
                
                {/* Time tracked */}
                <div>
                  <h3 className="text-sm font-medium mb-1">Time Tracked Today</h3>
                  <div className="flex items-center space-x-2">
                    <span className="material-icons text-neutral-600">timer</span>
                    <span className="text-2xl font-semibold">
                      {(() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        const todayEntries = timeEntries.filter(entry => {
                          const entryDate = new Date(entry.startTime);
                          entryDate.setHours(0, 0, 0, 0);
                          return entryDate.getTime() === today.getTime() && entry.duration;
                        });
                        
                        const totalMinutes = todayEntries.reduce((total, entry) => 
                          total + (entry.duration || 0), 0
                        );
                        
                        const hours = Math.floor(totalMinutes / 60);
                        const minutes = totalMinutes % 60;
                        
                        return `${hours}h ${minutes}m`;
                      })()}
                    </span>
                  </div>
                </div>
                
                {/* Tasks by priority */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Tasks by Priority</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-red-50 p-2 rounded text-center">
                      <div className="text-xl font-semibold text-red-700">
                        {tasks.filter(t => t.priority === 'high').length}
                      </div>
                      <div className="text-xs text-red-600">High</div>
                    </div>
                    <div className="bg-amber-50 p-2 rounded text-center">
                      <div className="text-xl font-semibold text-amber-700">
                        {tasks.filter(t => t.priority === 'medium').length}
                      </div>
                      <div className="text-xs text-amber-600">Medium</div>
                    </div>
                    <div className="bg-green-50 p-2 rounded text-center">
                      <div className="text-xl font-semibold text-green-700">
                        {tasks.filter(t => t.priority === 'low').length}
                      </div>
                      <div className="text-xs text-green-600">Low</div>
                    </div>
                  </div>
                </div>
                
                {/* Tasks by category */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Top Categories</h3>
                  <div className="space-y-2">
                    {(() => {
                      const categories = tasks.reduce((acc, task) => {
                        const category = task.category;
                        if (!acc[category]) {
                          acc[category] = 0;
                        }
                        acc[category]++;
                        return acc;
                      }, {} as Record<string, number>);
                      
                      return Object.entries(categories)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([category, count]) => (
                          <div key={category} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Badge variant="outline" className={getCategoryColor(category)}>
                                {category}
                              </Badge>
                            </div>
                            <span className="text-sm">{count} tasks</span>
                          </div>
                        ));
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Time Tracking Tab */}
        <TabsContent value="time-tracking" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Active Time Tracking */}
            <Card className={cn(
              "border-2",
              activeTask ? "border-primary" : "border-neutral-200"
            )}>
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center">
                  <span className="material-icons mr-2">timer</span>
                  Time Tracker
                </CardTitle>
                <CardDescription>
                  {activeTask 
                    ? `Currently tracking: ${activeTask.title}` 
                    : "Select a task to start tracking time"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeTask ? (
                  <>
                    <div className="flex justify-center mb-4">
                      <div className="text-4xl font-bold text-primary">
                        {formatTime(elapsedTime)}
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Button 
                        variant="default" 
                        className="bg-red-600 hover:bg-red-700"
                        onClick={stopTimeTracking}
                      >
                        <span className="material-icons mr-2">stop</span>
                        Stop Tracking
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6 text-neutral-500">
                    <span className="material-icons text-4xl mb-2">play_circle</span>
                    <p>No active time tracking</p>
                    <p className="text-sm mt-1">Start tracking time for a task from the list below</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Tasks for Time Tracking */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center">
                  <span className="material-icons mr-2">format_list_bulleted</span>
                  Tasks
                </CardTitle>
                <CardDescription>
                  Select a task to track time or view time spent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tasks.length === 0 ? (
                  <div className="text-center py-4 text-neutral-500">
                    <p>No tasks available</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setOpenTaskDialog(true)}
                    >
                      <span className="material-icons mr-2 text-sm">add</span>
                      Add a Task
                    </Button>
                  </div>
                ) : (
                  tasks.map(task => {
                    // Calculate total time spent on this task
                    const taskEntries = timeEntries.filter(entry => 
                      entry.taskId === task.id && entry.duration !== undefined
                    );
                    const totalMinutes = taskEntries.reduce((total, entry) => 
                      total + (entry.duration || 0), 0
                    );
                    
                    // Check if this task is currently being tracked
                    const isActive = activeTask?.id === task.id;
                    
                    return (
                      <div 
                        key={task.id} 
                        className={cn(
                          "p-3 border rounded-lg transition-all",
                          isActive ? "border-primary-500 bg-primary-50" : "hover:bg-neutral-50",
                          task.isCompleted && "opacity-60"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center">
                              <h3 className={cn(
                                "font-medium",
                                task.isCompleted && "line-through text-neutral-500"
                              )}>
                                {task.title}
                              </h3>
                              {isActive && (
                                <Badge className="ml-2 bg-primary-100 text-primary-800">
                                  Active
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                              <Badge variant="outline" className={getCategoryColor(task.category)}>
                                {task.category}
                              </Badge>
                            </div>
                            <div className="mt-2 text-sm text-neutral-600">
                              <span className="material-icons text-xs mr-1 align-text-top">schedule</span>
                              Time spent: {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
                              {task.estimatedMinutes && (
                                <> / Estimated: {Math.floor(task.estimatedMinutes / 60)}h {task.estimatedMinutes % 60}m</>
                              )}
                            </div>
                            {task.estimatedMinutes && (
                              <div className="mt-1">
                                <div className="flex justify-between items-center text-xs mb-1">
                                  <span>Progress</span>
                                  <span>{Math.min(100, Math.round((totalMinutes / task.estimatedMinutes) * 100))}%</span>
                                </div>
                                <Progress 
                                  value={Math.min(100, (totalMinutes / task.estimatedMinutes) * 100)} 
                                  className="h-1.5"
                                />
                              </div>
                            )}
                          </div>
                          <div>
                            {isActive ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-600"
                                onClick={stopTimeTracking}
                              >
                                <span className="material-icons mr-1 text-sm">stop</span>
                                Stop
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm"
                                disabled={task.isCompleted}
                                onClick={() => startTimeTracking(task)}
                              >
                                <span className="material-icons mr-1 text-sm">play_arrow</span>
                                Start
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
            
            {/* Time Tracking History */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center">
                  <span className="material-icons mr-2">history</span>
                  Recent Time Entries
                </CardTitle>
              </CardHeader>
              <CardContent>
                {timeEntries.length === 0 ? (
                  <div className="text-center py-4 text-neutral-500">
                    <p>No time entries yet</p>
                    <p className="text-sm mt-1">Start tracking time to see entries here</p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-neutral-200">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Task
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Start Time
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            End Time
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Duration
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-neutral-200">
                        {timeEntries
                          .slice()
                          .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                          .slice(0, 10)
                          .map(entry => {
                            const task = tasks.find(t => t.id === entry.taskId);
                            return (
                              <tr key={entry.id}>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  {task?.title || `Task ${entry.taskId}`}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-neutral-600">
                                  {new Date(entry.startTime).toLocaleString()}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-neutral-600">
                                  {entry.endTime 
                                    ? new Date(entry.endTime).toLocaleString()
                                    : 'In progress'
                                  }
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-neutral-600">
                                  {entry.duration
                                    ? `${Math.floor(entry.duration / 60)}h ${entry.duration % 60}m`
                                    : 'In progress'
                                  }
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Pomodoro Timer Tab */}
        <TabsContent value="pomodoro" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Pomodoro Timer */}
            <Card className={cn(
              "col-span-1 lg:col-span-2 border-2",
              timerRunning ? (
                timerType === 'pomodoro' 
                  ? "border-red-500" 
                  : timerType === 'shortBreak' 
                    ? "border-green-500" 
                    : "border-blue-500"
              ) : "border-neutral-200"
            )}>
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center">
                  <span className="material-icons mr-2">timer</span>
                  Pomodoro Timer
                </CardTitle>
                <CardDescription>
                  Use the Pomodoro Technique to boost your productivity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  {/* Timer types */}
                  <div className="flex justify-center mb-6">
                    <TabsList className="grid grid-cols-3 w-[300px]">
                      <TabsTrigger 
                        value="pomodoro"
                        className={timerType === 'pomodoro' ? 'text-red-600' : ''}
                        onClick={() => {
                          if (!timerRunning) {
                            setTimerType('pomodoro');
                            setTimerTime(pomodoroSettings.workDuration * 60);
                          }
                        }}
                      >
                        Pomodoro
                      </TabsTrigger>
                      <TabsTrigger 
                        value="shortBreak"
                        className={timerType === 'shortBreak' ? 'text-green-600' : ''}
                        onClick={() => {
                          if (!timerRunning) {
                            setTimerType('shortBreak');
                            setTimerTime(pomodoroSettings.shortBreakDuration * 60);
                          }
                        }}
                      >
                        Short Break
                      </TabsTrigger>
                      <TabsTrigger 
                        value="longBreak"
                        className={timerType === 'longBreak' ? 'text-blue-600' : ''}
                        onClick={() => {
                          if (!timerRunning) {
                            setTimerType('longBreak');
                            setTimerTime(pomodoroSettings.longBreakDuration * 60);
                          }
                        }}
                      >
                        Long Break
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Timer */}
                  <div className="flex justify-center mb-8">
                    <div className={cn(
                      "text-7xl font-bold",
                      getTimerTypeColor(timerType)
                    )}>
                      {formatTime(timerTime)}
                    </div>
                  </div>
                  
                  {/* Timer controls */}
                  <div className="flex justify-center space-x-4">
                    {timerRunning ? (
                      <Button 
                        variant="default" 
                        size="lg"
                        className="bg-amber-600 hover:bg-amber-700"
                        onClick={() => setTimerRunning(false)}
                      >
                        <span className="material-icons mr-2">pause</span>
                        Pause
                      </Button>
                    ) : (
                      <Button 
                        variant="default" 
                        size="lg"
                        className={cn(
                          timerType === 'pomodoro' 
                            ? "bg-red-600 hover:bg-red-700" 
                            : timerType === 'shortBreak' 
                              ? "bg-green-600 hover:bg-green-700" 
                              : "bg-blue-600 hover:bg-blue-700"
                        )}
                        onClick={() => {
                          setTimerRunning(true);
                          handleRequestNotificationPermission();
                        }}
                      >
                        <span className="material-icons mr-2">play_arrow</span>
                        Start
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => {
                        setTimerRunning(false);
                        if (timerType === 'pomodoro') {
                          setTimerTime(pomodoroSettings.workDuration * 60);
                        } else if (timerType === 'shortBreak') {
                          setTimerTime(pomodoroSettings.shortBreakDuration * 60);
                        } else {
                          setTimerTime(pomodoroSettings.longBreakDuration * 60);
                        }
                      }}
                    >
                      <span className="material-icons mr-2">restart_alt</span>
                      Reset
                    </Button>
                  </div>
                  
                  {/* Session counter */}
                  <div className="mt-6 text-neutral-600">
                    <p>
                      Completed sessions: <span className="font-medium">{completedSessions}</span>
                      {pomodoroSettings.sessionsBeforeLongBreak > 0 && (
                        <> / <span className="font-medium">{pomodoroSettings.sessionsBeforeLongBreak}</span> until long break</>
                      )}
                    </p>
                  </div>
                  
                  {/* Settings button */}
                  <div className="mt-6">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setOpenPomodoroSettings(true)}
                    >
                      <span className="material-icons mr-2 text-sm">settings</span>
                      Timer Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Pomodoro Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center">
                  <span className="material-icons mr-2">insights</span>
                  Pomodoro Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Today's Progress</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-red-50 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-red-700">
                        {completedSessions}
                      </div>
                      <div className="text-xs text-red-600 mt-1">Pomodoros</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-blue-700">
                        {Math.round(completedSessions * pomodoroSettings.workDuration / 60 * 10) / 10}
                      </div>
                      <div className="text-xs text-blue-600 mt-1">Hours</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Current Settings</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Work Duration:</span>
                      <span className="font-medium">{pomodoroSettings.workDuration} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Short Break:</span>
                      <span className="font-medium">{pomodoroSettings.shortBreakDuration} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Long Break:</span>
                      <span className="font-medium">{pomodoroSettings.longBreakDuration} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Sessions Before Long Break:</span>
                      <span className="font-medium">{pomodoroSettings.sessionsBeforeLongBreak}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Tips</h3>
                  <div className="space-y-2 text-sm text-neutral-600">
                    <p>
                      <span className="font-medium">Focus on one task</span> during each Pomodoro session.
                    </p>
                    <p>
                      <span className="font-medium">Take breaks seriously</span> - step away from your computer.
                    </p>
                    <p>
                      <span className="font-medium">Track your progress</span> to stay motivated and improve.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Suggested Tasks */}
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center">
                  <span className="material-icons mr-2">list</span>
                  Suggested Tasks for Pomodoro
                </CardTitle>
                <CardDescription>
                  Select a task to work on during your next Pomodoro session
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tasks.filter(task => !task.isCompleted).length === 0 ? (
                  <div className="text-center py-4 text-neutral-500">
                    <p>No pending tasks available</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setOpenTaskDialog(true)}
                    >
                      <span className="material-icons mr-2 text-sm">add</span>
                      Add a Task
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tasks
                      .filter(task => !task.isCompleted)
                      .sort((a, b) => {
                        // Sort by priority first
                        const priorityValues = { high: 3, medium: 2, low: 1 };
                        const priorityDiff = 
                          (priorityValues[b.priority as 'high' | 'medium' | 'low'] || 0) -
                          (priorityValues[a.priority as 'high' | 'medium' | 'low'] || 0);
                        
                        if (priorityDiff !== 0) return priorityDiff;
                        
                        // Then by due date if available
                        if (a.dueDate && b.dueDate) {
                          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                        }
                        
                        if (a.dueDate) return -1;
                        if (b.dueDate) return 1;
                        
                        return 0;
                      })
                      .slice(0, 6)
                      .map(task => (
                        <Card key={task.id} className="border hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{task.title}</h3>
                                {task.description && (
                                  <p className="text-sm text-neutral-600 mt-1">{task.description}</p>
                                )}
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                    {task.priority}
                                  </Badge>
                                  {task.estimatedMinutes && (
                                    <Badge variant="outline">
                                      <span className="material-icons text-xs mr-1">schedule</span>
                                      {task.estimatedMinutes} min
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="mt-3">
                              <Button 
                                variant={timerType === 'pomodoro' ? 'default' : 'outline'}
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  if (timerType !== 'pomodoro') {
                                    setTimerType('pomodoro');
                                    setTimerTime(pomodoroSettings.workDuration * 60);
                                  }
                                  setTimerRunning(true);
                                  handleRequestNotificationPermission();
                                  // Optionally also start time tracking for the task
                                  if (!activeTask || activeTask.id !== task.id) {
                                    startTimeTracking(task);
                                  }
                                }}
                              >
                                <span className="material-icons mr-2 text-sm">play_arrow</span>
                                Start Pomodoro
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    }
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Pomodoro Settings Dialog */}
          <Dialog open={openPomodoroSettings} onOpenChange={setOpenPomodoroSettings}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Pomodoro Timer Settings</DialogTitle>
                <DialogDescription>
                  Customize the timer durations and preferences
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 items-center gap-4">
                    <Label htmlFor="workDuration">Work Duration (minutes)</Label>
                    <Input 
                      id="workDuration"
                      type="number" 
                      min="1" 
                      max="60" 
                      value={pomodoroSettings.workDuration}
                      onChange={(e) => handlePomodoroSettingChange(
                        'workDuration', 
                        Math.max(1, Math.min(60, parseInt(e.target.value) || 1))
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 items-center gap-4">
                    <Label htmlFor="shortBreakDuration">Short Break Duration (minutes)</Label>
                    <Input 
                      id="shortBreakDuration"
                      type="number" 
                      min="1" 
                      max="30" 
                      value={pomodoroSettings.shortBreakDuration}
                      onChange={(e) => handlePomodoroSettingChange(
                        'shortBreakDuration', 
                        Math.max(1, Math.min(30, parseInt(e.target.value) || 1))
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 items-center gap-4">
                    <Label htmlFor="longBreakDuration">Long Break Duration (minutes)</Label>
                    <Input 
                      id="longBreakDuration"
                      type="number" 
                      min="1" 
                      max="60" 
                      value={pomodoroSettings.longBreakDuration}
                      onChange={(e) => handlePomodoroSettingChange(
                        'longBreakDuration', 
                        Math.max(1, Math.min(60, parseInt(e.target.value) || 1))
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 items-center gap-4">
                    <Label htmlFor="sessionsBeforeLongBreak">Pomodoros before Long Break</Label>
                    <Input 
                      id="sessionsBeforeLongBreak"
                      type="number" 
                      min="1" 
                      max="10" 
                      value={pomodoroSettings.sessionsBeforeLongBreak}
                      onChange={(e) => handlePomodoroSettingChange(
                        'sessionsBeforeLongBreak', 
                        Math.max(1, Math.min(10, parseInt(e.target.value) || 1))
                      )}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox 
                      id="autoStartBreaks" 
                      checked={pomodoroSettings.autoStartBreaks}
                      onCheckedChange={(checked) => 
                        handlePomodoroSettingChange('autoStartBreaks', !!checked)
                      }
                    />
                    <Label htmlFor="autoStartBreaks">Auto-start breaks</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="autoStartPomodoros" 
                      checked={pomodoroSettings.autoStartPomodoros}
                      onCheckedChange={(checked) => 
                        handlePomodoroSettingChange('autoStartPomodoros', !!checked)
                      }
                    />
                    <Label htmlFor="autoStartPomodoros">Auto-start pomodoros</Label>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        handlePomodoroSettingChange('workDuration', 25);
                        handlePomodoroSettingChange('shortBreakDuration', 5);
                        handlePomodoroSettingChange('longBreakDuration', 15);
                        handlePomodoroSettingChange('sessionsBeforeLongBreak', 4);
                        handlePomodoroSettingChange('autoStartBreaks', false);
                        handlePomodoroSettingChange('autoStartPomodoros', false);
                      }}
                    >
                      Reset to Defaults
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setOpenPomodoroSettings(false)}>
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        {/* Focus Mode Tab */}
        <TabsContent value="focus" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Focus Mode Component */}
            <div className="lg:col-span-2">
              <FocusMode 
                tasks={tasks}
                activeTask={activeTask}
                onStartTimeTracking={startTimeTracking}
                onStopTimeTracking={stopTimeTracking}
                onStartPomodoro={() => {
                  setTimerType('pomodoro');
                  setTimerTime(pomodoroSettings.workDuration * 60);
                  setTimerRunning(true);
                  handleRequestNotificationPermission();
                }}
                formatTime={formatTime}
                elapsedTime={elapsedTime}
              />
            </div>
            
            {/* Task Templates */}
            <div>
              <TaskTemplates 
                onCreateTaskFromTemplate={(template) => {
                  const newTask: Task = {
                    id: Math.max(...tasks.map(t => t.id), 0) + 1,
                    title: template.title,
                    description: template.description,
                    priority: template.priority,
                    category: template.category,
                    estimatedMinutes: template.estimatedMinutes,
                    isCompleted: false
                  };
                  
                  setTasks([...tasks, newTask]);
                }}
                getPriorityColor={getPriorityColor}
                getCategoryColor={getCategoryColor}
              />
            </div>
          </div>
        </TabsContent>
        
        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-6 mt-4">
          <ProductivityStats 
            tasks={tasks}
            timeEntries={timeEntries}
            completedPomodoros={completedSessions}
            getCategoryColor={getCategoryColor}
          />
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center">
                <span className="material-icons mr-2">category</span>
                Productivity by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(() => {
                  // Calculate category data
                  const categories = tasks.reduce((acc, task) => {
                    const category = task.category;
                    if (!acc[category]) {
                      acc[category] = {
                        total: 0,
                        completed: 0,
                        timeSpent: 0
                      };
                    }
                    
                    acc[category].total++;
                    if (task.isCompleted) {
                      acc[category].completed++;
                    }
                    
                    // Sum up time spent
                    const taskTimeEntries = timeEntries.filter(entry => 
                      entry.taskId === task.id && entry.duration !== undefined
                    );
                    const totalMinutes = taskTimeEntries.reduce((total, entry) => 
                      total + (entry.duration || 0), 0
                    );
                    
                    acc[category].timeSpent += totalMinutes;
                    
                    return acc;
                  }, {} as Record<string, { total: number, completed: number, timeSpent: number }>);
                  
                  return Object.entries(categories)
                    .map(([category, data]) => (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Badge className={getCategoryColor(category)}>
                            {category}
                          </Badge>
                          <div className="text-sm">
                            {data.completed}/{data.total} tasks
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs text-neutral-600 mb-1">
                          <span>Completion Rate</span>
                          <span>{data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0}%</span>
                        </div>
                        <Progress 
                          value={data.total > 0 ? (data.completed / data.total) * 100 : 0} 
                          className="h-2 mb-3"
                        />
                        
                        <div className="flex justify-between items-center text-xs text-neutral-600">
                          <span>Time Spent</span>
                          <span>
                            {Math.floor(data.timeSpent / 60)}h {data.timeSpent % 60}m
                          </span>
                        </div>
                      </div>
                    ));
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{taskToDelete?.title}" from your tasks.
              All time tracking data for this task will also be deleted.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTask} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}