import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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

interface FocusModeProps {
  tasks: Task[];
  activeTask: Task | null;
  onStartTimeTracking: (task: Task) => void;
  onStopTimeTracking: () => void;
  onStartPomodoro: () => void;
  formatTime: (seconds: number) => string;
  elapsedTime: number;
}

export function FocusMode({ 
  tasks, 
  activeTask, 
  onStartTimeTracking, 
  onStopTimeTracking, 
  onStartPomodoro,
  formatTime,
  elapsedTime
}: FocusModeProps) {
  const [focusModeEnabled, setFocusModeEnabled] = useState(false);
  const [ambientSoundEnabled, setAmbientSoundEnabled] = useState(false);
  const [ambientSoundVolume, setAmbientSoundVolume] = useState(50);
  const [ambientSound, setAmbientSound] = useState<HTMLAudioElement | null>(null);
  const [blockingEnabled, setBlockingEnabled] = useState(false);
  const [countdownTime, setCountdownTime] = useState(60 * 60); // 1 hour in seconds
  const [countdown, setCountdown] = useState(0);
  const [isCountdownRunning, setIsCountdownRunning] = useState(false);
  
  // Get recommended task
  const getRecommendedTask = (): Task | null => {
    if (activeTask) return activeTask;
    
    const incompleteTasks = tasks.filter(t => !t.isCompleted);
    if (incompleteTasks.length === 0) return null;
    
    // Priority order: high, medium, low
    const highPriorityTasks = incompleteTasks.filter(t => t.priority === 'high');
    if (highPriorityTasks.length > 0) {
      // If there are tasks with due dates, prioritize those
      const withDueDate = highPriorityTasks.filter(t => t.dueDate);
      if (withDueDate.length > 0) {
        // Sort by closest due date
        return withDueDate.sort((a, b) => {
          const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          return dateA - dateB;
        })[0];
      }
      return highPriorityTasks[0];
    }
    
    const mediumPriorityTasks = incompleteTasks.filter(t => t.priority === 'medium');
    if (mediumPriorityTasks.length > 0) {
      const withDueDate = mediumPriorityTasks.filter(t => t.dueDate);
      if (withDueDate.length > 0) {
        return withDueDate.sort((a, b) => {
          const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          return dateA - dateB;
        })[0];
      }
      return mediumPriorityTasks[0];
    }
    
    return incompleteTasks[0];
  };
  
  const recommendedTask = getRecommendedTask();
  
  // Toggle focus mode
  const toggleFocusMode = () => {
    const newMode = !focusModeEnabled;
    setFocusModeEnabled(newMode);
    
    if (newMode) {
      // If enabling focus mode, start the recommended task if not already tracking
      if (recommendedTask && !activeTask) {
        onStartTimeTracking(recommendedTask);
      }
      
      // Start countdown
      startCountdown();
      
      // If ambient sound is enabled, play it
      if (ambientSoundEnabled) {
        playAmbientSound();
      }
      
      // If blocking is enabled, notify about it
      if (blockingEnabled) {
        alert("Focus mode activated. Distracting websites will be blocked until the session ends.");
      }
    } else {
      // If disabling focus mode, stop the countdown
      stopCountdown();
      
      // Stop the ambient sound
      if (ambientSound) {
        ambientSound.pause();
        ambientSound.currentTime = 0;
      }
    }
  };
  
  // Toggle ambient sound
  const toggleAmbientSound = () => {
    const newState = !ambientSoundEnabled;
    setAmbientSoundEnabled(newState);
    
    if (newState && focusModeEnabled) {
      playAmbientSound();
    } else if (ambientSound) {
      ambientSound.pause();
      ambientSound.currentTime = 0;
    }
  };
  
  // Play ambient sound
  const playAmbientSound = () => {
    if (!ambientSound) {
      // Create a new audio element with a looping ambient sound
      const audio = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_d1741b0d5f.mp3?filename=coffee-shop-ambience-6362.mp3");
      audio.loop = true;
      audio.volume = ambientSoundVolume / 100;
      setAmbientSound(audio);
      audio.play();
    } else {
      ambientSound.volume = ambientSoundVolume / 100;
      ambientSound.play();
    }
  };
  
  // Update ambient sound volume
  useEffect(() => {
    if (ambientSound) {
      ambientSound.volume = ambientSoundVolume / 100;
    }
  }, [ambientSoundVolume, ambientSound]);
  
  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (ambientSound) {
        ambientSound.pause();
        ambientSound.currentTime = 0;
      }
    };
  }, [ambientSound]);
  
  // Start countdown
  const startCountdown = () => {
    setCountdown(countdownTime);
    setIsCountdownRunning(true);
  };
  
  // Stop countdown
  const stopCountdown = () => {
    setIsCountdownRunning(false);
  };
  
  // Countdown timer
  useEffect(() => {
    let intervalId: number | null = null;
    
    if (isCountdownRunning && countdown > 0) {
      intervalId = window.setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            // Time's up!
            if (intervalId) window.clearInterval(intervalId);
            setIsCountdownRunning(false);
            setFocusModeEnabled(false);
            
            // Stop ambient sound
            if (ambientSound) {
              ambientSound.pause();
              ambientSound.currentTime = 0;
            }
            
            // Show notification
            alert("Focus session complete! Great job staying focused.");
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalId) {
      window.clearInterval(intervalId);
    }
    
    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [isCountdownRunning, countdown, ambientSound]);
  
  // Format the countdown time
  const formatCountdown = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Card className={cn(
      "border-2 transition-colors",
      focusModeEnabled 
        ? "border-primary-500 bg-primary-50" 
        : "border-neutral-200"
    )}>
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center">
          <span className="material-icons mr-2">do_not_disturb</span>
          Focus Mode
        </CardTitle>
        <CardDescription>
          Eliminate distractions and focus on your work
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Focus Mode Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="focus-mode" className="text-base font-medium">
              Focus Mode
            </Label>
            <p className="text-sm text-neutral-500">
              Block distractions and track your focused time
            </p>
          </div>
          <Switch 
            id="focus-mode" 
            checked={focusModeEnabled}
            onCheckedChange={toggleFocusMode}
          />
        </div>
        
        {/* Countdown Timer */}
        {focusModeEnabled && (
          <div className="bg-primary-100 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-primary-800 mb-2">
              {formatCountdown(countdown)}
            </div>
            <p className="text-sm text-primary-600">
              Remaining in focus session
            </p>
          </div>
        )}
        
        {/* Active Task */}
        {focusModeEnabled && activeTask && (
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">Current Task</h3>
                <p className="font-bold text-lg">{activeTask.title}</p>
                <div className="mt-1 text-sm text-neutral-600">
                  <span className="material-icons text-xs mr-1 align-text-top">schedule</span>
                  Time spent: {formatTime(elapsedTime)}
                </div>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={onStopTimeTracking}
              >
                <span className="material-icons mr-1 text-sm">stop</span>
                Stop
              </Button>
            </div>
          </div>
        )}
        
        {/* Recommended Task */}
        {focusModeEnabled && !activeTask && recommendedTask && (
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">Recommended Task</h3>
                <p className="font-bold text-lg">{recommendedTask.title}</p>
                {recommendedTask.description && (
                  <p className="text-sm text-neutral-600 mt-1">{recommendedTask.description}</p>
                )}
              </div>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => onStartTimeTracking(recommendedTask)}
              >
                <span className="material-icons mr-1 text-sm">play_arrow</span>
                Start
              </Button>
            </div>
          </div>
        )}
        
        {/* Settings (only visible when focus mode is not enabled) */}
        {!focusModeEnabled && (
          <>
            {/* Session Length */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Session Length: {Math.floor(countdownTime / 60)} minutes
              </Label>
              <Slider 
                min={15 * 60} 
                max={120 * 60} 
                step={5 * 60}
                value={[countdownTime]}
                onValueChange={(value) => setCountdownTime(value[0])}
              />
            </div>
            
            {/* Ambient Sound */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="ambient-sound" className="text-sm font-medium">
                  Ambient Sound
                </Label>
                <p className="text-xs text-neutral-500">
                  Play background noise to help you focus
                </p>
              </div>
              <Switch 
                id="ambient-sound" 
                checked={ambientSoundEnabled}
                onCheckedChange={toggleAmbientSound}
              />
            </div>
            
            {/* Ambient Sound Volume */}
            {ambientSoundEnabled && (
              <div>
                <Label className="text-xs text-neutral-500 mb-1 block">
                  Volume: {ambientSoundVolume}%
                </Label>
                <Slider 
                  min={0} 
                  max={100} 
                  step={5}
                  value={[ambientSoundVolume]}
                  onValueChange={(value) => setAmbientSoundVolume(value[0])}
                />
              </div>
            )}
            
            {/* Website Blocking */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="website-blocking" className="text-sm font-medium">
                  Block Distracting Websites
                </Label>
                <p className="text-xs text-neutral-500">
                  Prevent access to social media during focus mode
                </p>
              </div>
              <Switch 
                id="website-blocking" 
                checked={blockingEnabled}
                onCheckedChange={setBlockingEnabled}
              />
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        {focusModeEnabled ? (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={toggleFocusMode}
          >
            <span className="material-icons mr-2 text-sm">cancel</span>
            End Focus Session
          </Button>
        ) : (
          <Button 
            variant="default" 
            className="w-full"
            onClick={onStartPomodoro}
          >
            <span className="material-icons mr-2 text-sm">timer</span>
            Start Pomodoro Timer
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default FocusMode;