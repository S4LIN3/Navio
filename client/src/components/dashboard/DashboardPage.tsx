import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { mockMoodData, mockTasks, mockGoals, mockSocialConnections, mockMetrics } from "@/lib/mock-data";
import MetricCard from "./MetricCard";
import MoodChart from "./MoodChart";
import TaskList from "./TaskList";
import ModuleCard from "./ModuleCard";
import { formatRelativeDate } from "@/utils/date-utils";
import { useAuth } from "@/hooks/use-auth";

export function DashboardPage() {
  const { user } = useAuth();
  const [moodData, setMoodData] = useState(() => {
    const savedMoodData = localStorage.getItem('userMoodData');
    if (savedMoodData) {
      try {
        return JSON.parse(savedMoodData);
      } catch (e) {
        console.error('Failed to parse saved mood data', e);
      }
    }
    return mockMoodData;
  });
  
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('userTasks');
    if (savedTasks) {
      try {
        return JSON.parse(savedTasks);
      } catch (e) {
        console.error('Failed to parse saved tasks', e);
      }
    }
    return mockTasks;
  });
  
  const [goals, setGoals] = useState(() => {
    const savedGoals = localStorage.getItem('userGoals');
    if (savedGoals) {
      try {
        return JSON.parse(savedGoals);
      } catch (e) {
        console.error('Failed to parse saved goals', e);
      }
    }
    return mockGoals;
  });
  
  const [connections, setConnections] = useState(() => {
    const savedConnections = localStorage.getItem('userConnections');
    if (savedConnections) {
      try {
        return JSON.parse(savedConnections);
      } catch (e) {
        console.error('Failed to parse saved connections', e);
      }
    }
    return mockSocialConnections;
  });
  
  const [metrics, setMetrics] = useState(() => {
    const savedMetrics = localStorage.getItem('userMetrics');
    if (savedMetrics) {
      try {
        return JSON.parse(savedMetrics);
      } catch (e) {
        console.error('Failed to parse saved metrics', e);
      }
    }
    return mockMetrics;
  });
  
  const [, navigate] = useLocation();

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userMoodData', JSON.stringify(moodData));
  }, [moodData]);
  
  useEffect(() => {
    localStorage.setItem('userTasks', JSON.stringify(tasks));
  }, [tasks]);
  
  useEffect(() => {
    localStorage.setItem('userGoals', JSON.stringify(goals));
  }, [goals]);
  
  useEffect(() => {
    localStorage.setItem('userConnections', JSON.stringify(connections));
  }, [connections]);
  
  useEffect(() => {
    localStorage.setItem('userMetrics', JSON.stringify(metrics));
  }, [metrics]);

  const handleTaskToggle = (taskId: number, isCompleted: boolean) => {
    const updatedTasks = tasks.map((task: any) => 
      task.id === taskId ? { ...task, isCompleted } : task
    );
    setTasks(updatedTasks);
    
    // Update metrics based on task completion
    const completedTasks = updatedTasks.filter((t: any) => t.isCompleted).length;
    const totalTasks = updatedTasks.length;
    const productivityScore = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    setMetrics((prev: any) => ({
      ...prev,
      productivity: {
        ...prev.productivity,
        score: Math.round(productivityScore),
        tasksCompleted: completedTasks,
        totalTasks: totalTasks
      }
    }));
  };

  const handleAddTask = () => {
    navigate("/goals");
  };

  const handleModuleClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Welcome section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-neutral-900">
          {(() => {
            const hour = new Date().getHours();
            let greeting = "Good ";
            if (hour < 12) greeting += "morning";
            else if (hour < 18) greeting += "afternoon";
            else greeting += "evening";
            return `${greeting}, ${user?.name?.split(' ')[0] || 'there'}!`;
          })()}
        </h2>
        <p className="mt-1 text-neutral-600">
          Here's your life progress for today, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
        </p>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Mental Health"
          value={metrics.mentalHealth.score}
          maxValue={100}
          progress={metrics.mentalHealth.score}
          trend={metrics.mentalHealth.trend}
          icon="sentiment_satisfied_alt"
          footnote="Your mood is improving this week"
          color="secondary"
        />
        
        <MetricCard
          title="Productivity"
          value={metrics.productivity.score}
          maxValue={100}
          progress={metrics.productivity.score}
          trend={metrics.productivity.trend}
          icon="trending_up"
          footnote={`Completed ${metrics.productivity.tasksCompleted}/${metrics.productivity.totalTasks} tasks this week`}
          color="primary"
        />
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-neutral-600">Goals</h3>
            <span className="material-icons text-accent-500">flag</span>
          </div>
          <div className="flex items-end">
            <p className="text-2xl font-bold">{goals.length}</p>
            <p className="ml-1 text-sm text-neutral-600">active</p>
            <span className="ml-auto text-sm font-medium text-secondary-500 flex items-center">
              <span className="material-icons text-secondary-500 text-sm mr-0.5">history</span>
              {metrics.goals.completed} completed
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {goals.slice(0, 3).map((goal: any) => (
              <div key={goal.id} className="flex flex-col items-center">
                <p className="text-xs font-medium text-neutral-600 mb-1 truncate w-full text-center">{goal.title}</p>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    className="bg-accent-500 h-2 rounded-full" 
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-neutral-500 mt-1">{goal.progress}%</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-neutral-600">Social Connections</h3>
            <span className="material-icons text-primary-500">people</span>
          </div>
          <div className="flex items-end">
            <p className="text-2xl font-bold">{connections.length}</p>
            <p className="ml-1 text-sm text-neutral-600">active</p>
            <span className="ml-auto text-sm font-medium text-secondary-500 flex items-center">
              <span className="material-icons text-secondary-500 text-sm mr-0.5">add</span>
              {metrics.socialConnections.new} new
            </span>
          </div>
          <div className="mt-4 flex -space-x-2 overflow-hidden">
            {connections.slice(0, 4).map((connection: any, index: number) => (
              <div 
                key={connection.id}
                className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-primary-100 text-primary-800 flex items-center justify-center text-xs font-medium"
              >
                {connection.name.charAt(0)}
              </div>
            ))}
            {connections.length > 4 && (
              <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-neutral-200 text-neutral-600 text-xs font-medium">
                +{connections.length - 4}
              </div>
            )}
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            Last contacted {connections[0]?.name?.split(' ')[0]} {formatRelativeDate(connections[0]?.lastContactDate)}
          </p>
        </div>
      </div>
      
      {/* Data Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <MoodChart moodData={moodData} />
        </div>
        
        <div>
          <TaskList 
            tasks={tasks} 
            onTaskToggle={handleTaskToggle}
            onAddTask={handleAddTask}
          />
        </div>
      </div>
      
      {/* Module Cards */}
      <h3 className="text-lg font-semibold text-neutral-800 mb-4">Quick Access</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <ModuleCard
          title="Goal Setting"
          description="Create and track your SMART goals with step-by-step guidance."
          icon="flag"
          buttonText="Set New Goal"
          gradient="bg-gradient-to-r from-primary-500 to-secondary-500"
          onClick={() => handleModuleClick("/goals")}
        />
        
        <ModuleCard
          title="Mental Health Tools"
          description="Track your mood and access guided meditations and exercises."
          icon="psychology"
          buttonText="Log Today's Mood"
          gradient="bg-gradient-to-r from-secondary-500 to-secondary-700"
          onClick={() => handleModuleClick("/mental-health")}
        />
        
        <ModuleCard
          title="Learning Hub"
          description="Discover personalized courses and resources to grow your skills."
          icon="school"
          buttonText="Browse Recommendations"
          gradient="bg-gradient-to-r from-accent-500 to-accent-700"
          onClick={() => handleModuleClick("/learning")}
        />
      </div>
    </div>
  );
}

export default DashboardPage;
