import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { z } from "zod";
import { cn } from "@/lib/utils";

// We're reusing the same Task type from ProductivityPage
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

// Template is like a task but without id and completion status
interface TaskTemplate {
  id: number;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  estimatedMinutes?: number;
}

interface TaskTemplatesProps {
  onCreateTaskFromTemplate: (template: TaskTemplate) => void;
  getPriorityColor: (priority: string) => string;
  getCategoryColor: (category: string) => string;
}

export function TaskTemplates({ onCreateTaskFromTemplate, getPriorityColor, getCategoryColor }: TaskTemplatesProps) {
  const [templates, setTemplates] = useState<TaskTemplate[]>(() => {
    const savedTemplates = localStorage.getItem('userTaskTemplates');
    if (savedTemplates) {
      try {
        return JSON.parse(savedTemplates);
      } catch (e) {
        console.error('Failed to parse saved task templates', e);
        return [];
      }
    }
    return [];
  });
  
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<TaskTemplate | null>(null);
  
  // Save templates whenever they change
  useEffect(() => {
    localStorage.setItem('userTaskTemplates', JSON.stringify(templates));
  }, [templates]);
  
  const handleDeleteTemplate = () => {
    if (!templateToDelete) return;
    
    const updatedTemplates = templates.filter(t => t.id !== templateToDelete.id);
    setTemplates(updatedTemplates);
    setTemplateToDelete(null);
    setOpenDeleteDialog(false);
  };
  
  const handleCreateFromTemplate = (template: TaskTemplate) => {
    // Pass the template up to the parent component to handle creating the task
    onCreateTaskFromTemplate(template);
  };
  
  const saveCurrentTaskAsTemplate = (task: Task) => {
    // Convert a Task to a TaskTemplate
    const newTemplate: TaskTemplate = {
      id: Math.max(...templates.map(t => t.id), 0) + 1,
      title: task.title,
      description: task.description,
      priority: task.priority,
      category: task.category,
      estimatedMinutes: task.estimatedMinutes
    };
    
    setTemplates([...templates, newTemplate]);
  };
  
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center">
            <span className="material-icons mr-2">bookmark</span>
            Task Templates
          </CardTitle>
          <CardDescription>
            Save and reuse common task templates to save time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {templates.length === 0 ? (
            <div className="text-center py-6 text-neutral-500">
              <span className="material-icons text-3xl mb-2">bookmarks</span>
              <p>No task templates yet</p>
              <p className="text-sm mt-1">Save tasks as templates to quickly create common tasks</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map(template => (
                <div 
                  key={template.id} 
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-base">{template.title}</h3>
                      {template.description && (
                        <p className="text-sm text-neutral-600 mt-1">{template.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className={getPriorityColor(template.priority)}>
                          {template.priority}
                        </Badge>
                        <Badge variant="outline" className={getCategoryColor(template.category)}>
                          {template.category}
                        </Badge>
                        {template.estimatedMinutes && (
                          <Badge variant="outline">
                            <span className="material-icons text-xs mr-1">schedule</span>
                            {template.estimatedMinutes} min
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setTemplateToDelete(template);
                          setOpenDeleteDialog(true);
                        }}
                      >
                        <span className="material-icons text-neutral-600 text-sm">delete</span>
                      </Button>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={() => handleCreateFromTemplate(template)}
                  >
                    <span className="material-icons mr-2 text-sm">add_task</span>
                    Create Task
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the "{templateToDelete?.title}" template.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTemplate} 
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

export default TaskTemplates;