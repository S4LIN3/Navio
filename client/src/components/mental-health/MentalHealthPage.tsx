import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockMoodData } from "@/lib/mock-data";
import { Calendar } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MoodLog } from "@/types";
import { format } from "date-fns";
import MoodChart from "../dashboard/MoodChart";

const moodLogSchema = z.object({
  score: z.number().min(0).max(100),
  note: z.string().optional(),
});

export function MentalHealthPage() {
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>(mockMoodData);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [openDialog, setOpenDialog] = useState(false);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathCount, setBreathCount] = useState(0);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [breathingTime, setBreathingTime] = useState(0);

  const form = useForm<z.infer<typeof moodLogSchema>>({
    resolver: zodResolver(moodLogSchema),
    defaultValues: {
      score: 50,
      note: "",
    },
  });

  const onSubmit = (values: z.infer<typeof moodLogSchema>) => {
    const newMoodLog: MoodLog = {
      id: Math.max(...moodLogs.map(log => log.id), 0) + 1,
      userId: 1,
      score: values.score,
      note: values.note,
      date: new Date()
    };

    setMoodLogs([newMoodLog, ...moodLogs]);
    setOpenDialog(false);
    form.reset();
  };

  const getMoodEmoji = (score: number) => {
    if (score >= 80) return "sentiment_very_satisfied";
    if (score >= 60) return "sentiment_satisfied";
    if (score >= 40) return "sentiment_neutral";
    if (score >= 20) return "sentiment_dissatisfied";
    return "sentiment_very_dissatisfied";
  };

  const getMoodColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-teal-500";
    if (score >= 40) return "text-yellow-500";
    if (score >= 20) return "text-orange-500";
    return "text-red-500";
  };
  
  const startBreathingExercise = () => {
    setIsBreathing(true);
    setBreathCount(0);
    setBreathPhase('inhale');
    setBreathingTime(0);
    
    // Start the breathing cycle
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setBreathingTime(elapsed);
      
      // Calculate current phase based on time
      const cycleTime = elapsed % 12; // 4-second inhale, 2-second hold, 4-second exhale, 2-second rest
      
      if (cycleTime < 4) {
        setBreathPhase('inhale');
      } else if (cycleTime < 6) {
        setBreathPhase('hold');
      } else if (cycleTime < 10) {
        setBreathPhase('exhale');
      } else {
        setBreathPhase('rest');
        if (cycleTime === 11) {
          setBreathCount(prev => prev + 1);
        }
      }
      
      // Stop after 2 minutes (10 breath cycles)
      if (elapsed >= 120) {
        clearInterval(interval);
        setIsBreathing(false);
      }
    }, 1000);
    
    // Cleanup function
    return () => clearInterval(interval);
  };
  
  const stopBreathingExercise = () => {
    setIsBreathing(false);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Mental Health Tools</h1>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <span className="material-icons mr-2 text-sm">add</span>
              Log Today's Mood
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>How are you feeling today?</DialogTitle>
              <DialogDescription>
                Track your mood to gain insights into your emotional patterns.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mood Score (0-100)</FormLabel>
                      <div className="flex items-center space-x-4">
                        <span className={`material-icons text-2xl ${getMoodColor(field.value)}`}>
                          {getMoodEmoji(field.value)}
                        </span>
                        <FormControl>
                          <Slider
                            defaultValue={[field.value]}
                            max={100}
                            step={1}
                            onValueChange={(vals) => field.onChange(vals[0])}
                            className="w-full"
                          />
                        </FormControl>
                        <span className="font-medium w-8 text-center">{field.value}</span>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What's contributing to your mood today?"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit">Save Mood</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MoodChart moodData={moodLogs} />
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium text-neutral-800">Daily Mood Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {moodLogs.slice(0, 3).map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 pb-3 border-b border-neutral-200 last:border-0">
                    <div className={`mt-0.5 ${getMoodColor(log.score)}`}>
                      <span className="material-icons">{getMoodEmoji(log.score)}</span>
                    </div>
                    <div>
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-sm">{log.score}/100</p>
                        <p className="text-xs text-neutral-500">{format(new Date(log.date), 'MMM d, h:mm a')}</p>
                      </div>
                      {log.note && <p className="text-sm text-neutral-600 mt-1">{log.note}</p>}
                    </div>
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setOpenDialog(true)}
                >
                  <span className="material-icons mr-2 text-sm">add</span>
                  Log New Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-8">
        <Tabs defaultValue="resources">
          <TabsList>
            <TabsTrigger value="resources">Resource Library</TabsTrigger>
            <TabsTrigger value="calendar">Mood Calendar</TabsTrigger>
            <TabsTrigger value="exercises">Breathing Exercises</TabsTrigger>
            <TabsTrigger value="focus">Focus Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="resources">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Guided Meditation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600 mb-4">Short guided meditation sessions to help reduce stress and anxiety.</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="material-icons text-primary-500 mr-2">play_circle</span>
                        <span className="text-sm">5-Minute Breathing</span>
                      </div>
                      <span className="text-xs text-neutral-500">5:00</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="material-icons text-primary-500 mr-2">play_circle</span>
                        <span className="text-sm">Body Scan Relaxation</span>
                      </div>
                      <span className="text-xs text-neutral-500">10:00</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="material-icons text-primary-500 mr-2">play_circle</span>
                        <span className="text-sm">Stress Relief</span>
                      </div>
                      <span className="text-xs text-neutral-500">8:00</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Stress Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600 mb-4">Techniques to help you manage stress in daily life.</p>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="material-icons text-secondary-500 mr-2">article</span>
                      <span className="text-sm">Understanding Stress Triggers</span>
                    </div>
                    <div className="flex items-center">
                      <span className="material-icons text-secondary-500 mr-2">article</span>
                      <span className="text-sm">Quick Relaxation Techniques</span>
                    </div>
                    <div className="flex items-center">
                      <span className="material-icons text-secondary-500 mr-2">video_library</span>
                      <span className="text-sm">Progressive Muscle Relaxation</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Mood Boosters</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600 mb-4">Activities to help improve your mood when feeling down.</p>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="material-icons text-accent-500 mr-2">lightbulb</span>
                      <span className="text-sm">5 Minute Positive Visualization</span>
                    </div>
                    <div className="flex items-center">
                      <span className="material-icons text-accent-500 mr-2">lightbulb</span>
                      <span className="text-sm">Gratitude Practice Guide</span>
                    </div>
                    <div className="flex items-center">
                      <span className="material-icons text-accent-500 mr-2">lightbulb</span>
                      <span className="text-sm">Physical Activity for Mental Health</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="calendar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium">Mood Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium">
                    {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDate && (
                    <div>
                      {moodLogs.filter(log => 
                        format(new Date(log.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                      ).length > 0 ? (
                        <div className="space-y-4">
                          {moodLogs.filter(log => 
                            format(new Date(log.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                          ).map(log => (
                            <div key={log.id} className="flex items-start space-x-3">
                              <div className={`mt-0.5 ${getMoodColor(log.score)}`}>
                                <span className="material-icons">{getMoodEmoji(log.score)}</span>
                              </div>
                              <div>
                                <div className="flex justify-between items-center">
                                  <p className="font-medium text-sm">{log.score}/100</p>
                                  <p className="text-xs text-neutral-500">{format(new Date(log.date), 'h:mm a')}</p>
                                </div>
                                {log.note && <p className="text-sm text-neutral-600 mt-1">{log.note}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-neutral-500">No mood entries for this date</p>
                          <Button 
                            variant="outline" 
                            className="mt-3"
                            onClick={() => setOpenDialog(true)}
                          >
                            Add Entry
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="exercises">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Breathing Exercise</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center">
                    <div className="relative w-64 h-64 rounded-full flex items-center justify-center">
                      <div 
                        className={`absolute inset-0 rounded-full transition-all duration-300
                          ${isBreathing ? 
                            (breathPhase === 'inhale' ? 'bg-blue-100 scale-110 animate-pulse' : 
                             breathPhase === 'hold' ? 'bg-teal-100 scale-110' : 
                             breathPhase === 'exhale' ? 'bg-blue-100 scale-90 animate-pulse' : 
                             'bg-slate-100 scale-90') 
                            : 'bg-slate-100'}`}
                      ></div>
                      
                      <div className="relative z-10 text-center">
                        {isBreathing ? (
                          <>
                            <div className="text-4xl font-bold text-primary-700">
                              {breathPhase === 'inhale' ? 'Inhale' : 
                               breathPhase === 'hold' ? 'Hold' : 
                               breathPhase === 'exhale' ? 'Exhale' : 
                               'Rest'}
                            </div>
                            <div className="text-lg font-medium mt-2 text-primary-600">
                              Breath {breathCount + 1} of 10
                            </div>
                            <div className="mt-4 text-sm text-neutral-600">
                              {Math.floor(breathingTime / 60)}:{(breathingTime % 60).toString().padStart(2, '0')}
                            </div>
                          </>
                        ) : (
                          <div className="text-xl font-medium text-neutral-700">
                            Start a guided breathing exercise
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      {!isBreathing ? (
                        <Button 
                          className="w-full"
                          onClick={startBreathingExercise}
                        >
                          <span className="material-icons mr-2">play_arrow</span>
                          Start Exercise
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={stopBreathingExercise}
                        >
                          <span className="material-icons mr-2">stop</span>
                          Stop Exercise
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Breathing Techniques</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-base mb-2">4-7-8 Breathing</h3>
                      <p className="text-sm text-neutral-600">
                        Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds. 
                        This technique helps reduce anxiety and helps with sleep.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-base mb-2">Box Breathing</h3>
                      <p className="text-sm text-neutral-600">
                        Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, 
                        hold for 4 seconds. Used by Navy SEALs to remain calm in stressful situations.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-base mb-2">Diaphragmatic Breathing</h3>
                      <p className="text-sm text-neutral-600">
                        Deep breathing that engages the diaphragm, helping to reduce stress 
                        and control breathing patterns. Place one hand on your chest and one on your belly.
                      </p>
                    </div>
                    
                    <div className="pt-2">
                      <Button variant="outline" className="w-full">
                        <span className="material-icons mr-2 text-sm">menu_book</span>
                        View More Techniques
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="focus">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Focus Timer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center">
                    <div className="relative w-48 h-48 rounded-full flex items-center justify-center border-8 border-primary-200">
                      <div className="text-4xl font-bold text-primary-700">
                        25:00
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 w-full mt-8">
                      <Button className="w-full">
                        <span className="material-icons mr-2">play_arrow</span>
                        Start
                      </Button>
                      <Button variant="outline" className="w-full">
                        <span className="material-icons mr-2">restart_alt</span>
                        Reset
                      </Button>
                    </div>
                    
                    <div className="mt-6 w-full">
                      <h3 className="text-sm font-medium mb-2">Duration</h3>
                      <div className="flex justify-between gap-3">
                        <Button variant="outline" size="sm" className="flex-1">15 min</Button>
                        <Button variant="secondary" size="sm" className="flex-1">25 min</Button>
                        <Button variant="outline" size="sm" className="flex-1">50 min</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Focus Techniques</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-base mb-2">Pomodoro Technique</h3>
                      <p className="text-sm text-neutral-600">
                        Work for 25 minutes, then take a 5-minute break. After four pomodoros, 
                        take a longer 15-30 minute break. Great for maintaining focus and avoiding burnout.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-base mb-2">Time Blocking</h3>
                      <p className="text-sm text-neutral-600">
                        Dedicate specific blocks of time to specific tasks. This reduces 
                        task-switching and helps maintain deep focus on one task at a time.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-base mb-2">52/17 Method</h3>
                      <p className="text-sm text-neutral-600">
                        Work for 52 minutes, then take a 17-minute break. Studies show this 
                        creates an optimal balance of productivity and rest for many people.
                      </p>
                    </div>
                    
                    <div className="pt-2">
                      <Button variant="outline" className="w-full">
                        <span className="material-icons mr-2 text-sm">menu_book</span>
                        View More Techniques
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default MentalHealthPage;
