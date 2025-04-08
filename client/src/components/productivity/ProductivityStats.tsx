import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

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

interface ProductivityStatsProps {
  tasks: Task[];
  timeEntries: TimeEntry[];
  completedPomodoros: number;
  getCategoryColor: (category: string) => string;
}

export function ProductivityStats({ tasks, timeEntries, completedPomodoros, getCategoryColor }: ProductivityStatsProps) {
  const [dailyStats, setDailyStats] = useState({
    completedTasks: 0,
    timeTracked: 0,
    completionRate: 0,
    mostProductiveCategory: ""
  });
  
  const [weeklyStats, setWeeklyStats] = useState({
    completedTasks: 0,
    timeTracked: 0,
    pomodorosSessions: 0,
    mostProductiveDay: ""
  });
  
  // Calculate statistics whenever the data changes
  useEffect(() => {
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get start of week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    // Calculate today's stats
    const tasksCompletedToday = tasks.filter(task => {
      if (!task.isCompleted) return false;
      
      // Find the time entry where this task was completed
      const taskEntries = timeEntries.filter(entry => entry.taskId === task.id && entry.endTime);
      if (taskEntries.length === 0) return false;
      
      // Get the latest entry
      const latestEntry = taskEntries.reduce((latest, entry) => {
        return !latest.endTime || (entry.endTime && entry.endTime > latest.endTime!) 
          ? entry 
          : latest;
      }, taskEntries[0]);
      
      // Check if it was completed today
      const entryDate = new Date(latestEntry.endTime!);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });
    
    // Today's time entries
    const todayEntries = timeEntries.filter(entry => {
      if (!entry.duration) return false;
      const entryDate = new Date(entry.startTime);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });
    
    // Calculate time tracked today
    const timeTrackedToday = todayEntries.reduce((total, entry) => total + (entry.duration || 0), 0);
    
    // Calculate completion rate
    const todaysTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    });
    
    const completionRate = todaysTasks.length > 0 
      ? (todaysTasks.filter(t => t.isCompleted).length / todaysTasks.length) * 100 
      : 0;
    
    // Find most productive category
    const categoryCompletions: Record<string, number> = {};
    tasksCompletedToday.forEach(task => {
      if (!categoryCompletions[task.category]) {
        categoryCompletions[task.category] = 0;
      }
      categoryCompletions[task.category]++;
    });
    
    let mostProductiveCategory = "";
    let maxCompletions = 0;
    Object.entries(categoryCompletions).forEach(([category, count]) => {
      if (count > maxCompletions) {
        mostProductiveCategory = category;
        maxCompletions = count;
      }
    });
    
    // Update daily stats
    setDailyStats({
      completedTasks: tasksCompletedToday.length,
      timeTracked: timeTrackedToday,
      completionRate,
      mostProductiveCategory
    });
    
    // Calculate weekly stats
    const tasksCompletedThisWeek = tasks.filter(task => {
      if (!task.isCompleted) return false;
      
      // Find the time entry where this task was completed
      const taskEntries = timeEntries.filter(entry => entry.taskId === task.id && entry.endTime);
      if (taskEntries.length === 0) return false;
      
      // Get the latest entry
      const latestEntry = taskEntries.reduce((latest, entry) => {
        return !latest.endTime || (entry.endTime && entry.endTime > latest.endTime!) 
          ? entry 
          : latest;
      }, taskEntries[0]);
      
      // Check if it was completed this week
      const entryDate = new Date(latestEntry.endTime!);
      return entryDate >= startOfWeek && entryDate <= today;
    });
    
    // Week's time entries
    const weekEntries = timeEntries.filter(entry => {
      if (!entry.duration) return false;
      const entryDate = new Date(entry.startTime);
      return entryDate >= startOfWeek && entryDate <= today;
    });
    
    // Calculate time tracked this week
    const timeTrackedThisWeek = weekEntries.reduce((total, entry) => total + (entry.duration || 0), 0);
    
    // Find most productive day of the week
    const dayCompletions: Record<string, number> = {
      "Sunday": 0,
      "Monday": 0,
      "Tuesday": 0,
      "Wednesday": 0,
      "Thursday": 0,
      "Friday": 0,
      "Saturday": 0
    };
    
    weekEntries.forEach(entry => {
      const day = new Date(entry.startTime).toLocaleDateString('en-US', { weekday: 'long' });
      dayCompletions[day] += entry.duration || 0;
    });
    
    let mostProductiveDay = "";
    let maxMinutes = 0;
    Object.entries(dayCompletions).forEach(([day, minutes]) => {
      if (minutes > maxMinutes) {
        mostProductiveDay = day;
        maxMinutes = minutes;
      }
    });
    
    // Update weekly stats
    setWeeklyStats({
      completedTasks: tasksCompletedThisWeek.length,
      timeTracked: timeTrackedThisWeek,
      pomodorosSessions: completedPomodoros,
      mostProductiveDay
    });
    
  }, [tasks, timeEntries, completedPomodoros]);
  
  // Format minutes to hours and minutes
  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Daily Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center">
            <span className="material-icons mr-2">today</span>
            Today's Productivity
          </CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-50 p-3 rounded text-center">
              <div className="text-xl font-semibold text-blue-700">
                {dailyStats.completedTasks}
              </div>
              <div className="text-xs text-blue-600">Tasks Completed</div>
            </div>
            <div className="bg-green-50 p-3 rounded text-center">
              <div className="text-xl font-semibold text-green-700">
                {formatMinutes(dailyStats.timeTracked)}
              </div>
              <div className="text-xs text-green-600">Time Tracked</div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-medium">Task Completion Rate</h3>
              <span className="text-sm text-neutral-600">
                {Math.round(dailyStats.completionRate)}%
              </span>
            </div>
            <Progress 
              value={dailyStats.completionRate} 
              className="h-2"
            />
          </div>
          
          {dailyStats.mostProductiveCategory && (
            <div>
              <h3 className="text-sm font-medium mb-1">Most Productive Category</h3>
              <Badge className={getCategoryColor(dailyStats.mostProductiveCategory)}>
                {dailyStats.mostProductiveCategory}
              </Badge>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-medium mb-1">Focus Score</h3>
            <div className="flex items-center">
              <div className="flex-1 mr-4">
                <Progress 
                  value={Math.min(100, (dailyStats.timeTracked / 240) * 100)} 
                  className="h-2"
                />
              </div>
              <div className="text-sm font-medium">
                {Math.min(10, Math.ceil((dailyStats.timeTracked / 240) * 10))}/10
              </div>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Based on time tracked and tasks completed
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Weekly Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center">
            <span className="material-icons mr-2">date_range</span>
            Weekly Overview
          </CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - 
            {(() => {
              const endOfWeek = new Date();
              endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
              return endOfWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
            })()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-purple-50 p-3 rounded text-center">
              <div className="text-xl font-semibold text-purple-700">
                {weeklyStats.completedTasks}
              </div>
              <div className="text-xs text-purple-600">Tasks Completed</div>
            </div>
            <div className="bg-amber-50 p-3 rounded text-center">
              <div className="text-xl font-semibold text-amber-700">
                {formatMinutes(weeklyStats.timeTracked)}
              </div>
              <div className="text-xs text-amber-600">Time Tracked</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-red-50 p-3 rounded text-center">
              <div className="text-xl font-semibold text-red-700">
                {weeklyStats.pomodorosSessions}
              </div>
              <div className="text-xs text-red-600">Pomodoro Sessions</div>
            </div>
            <div className="bg-blue-50 p-3 rounded text-center">
              <div className="text-xl font-semibold text-blue-700">
                {formatMinutes(weeklyStats.pomodorosSessions * 25)}
              </div>
              <div className="text-xs text-blue-600">Focused Time</div>
            </div>
          </div>
          
          {weeklyStats.mostProductiveDay && (
            <div>
              <h3 className="text-sm font-medium mb-1">Most Productive Day</h3>
              <Badge className="bg-blue-100 text-blue-800">
                {weeklyStats.mostProductiveDay}
              </Badge>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-medium mb-1">Weekly Goal Progress</h3>
            <div className="flex items-center">
              <div className="flex-1 mr-4">
                <Progress 
                  value={Math.min(100, (weeklyStats.timeTracked / 1200) * 100)} 
                  className="h-2"
                />
              </div>
              <div className="text-sm font-medium">
                {Math.round((weeklyStats.timeTracked / 1200) * 100)}%
              </div>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Target: 20 hours of focused work per week
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProductivityStats;