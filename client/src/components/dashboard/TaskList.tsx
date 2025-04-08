import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Task } from "@/types";
import { formatDate } from "@/utils/date-utils";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface TaskListProps {
  tasks: Task[];
  onTaskToggle: (taskId: number, isCompleted: boolean) => void;
  onAddTask: () => void;
}

const getCategoryColor = (category?: string) => {
  switch (category?.toLowerCase()) {
    case 'learning':
      return 'bg-primary-100 text-primary-800';
    case 'social':
      return 'bg-secondary-100 text-secondary-800';
    case 'fitness':
      return 'bg-accent-100 text-accent-800';
    case 'finance':
      return 'bg-neutral-100 text-neutral-800';
    default:
      return 'bg-neutral-100 text-neutral-800';
  }
};

export function TaskList({ tasks, onTaskToggle, onAddTask }: TaskListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium text-neutral-800">Upcoming Tasks</CardTitle>
        <Button variant="link" className="text-primary-600 hover:text-primary-700 text-sm font-medium p-0">
          View All
        </Button>
      </CardHeader>
      <CardContent className="pt-2">
        {tasks.map((task) => (
          <div key={task.id} className="mb-4 last:mb-0">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <Checkbox 
                  id={`task-${task.id}`}
                  checked={task.isCompleted}
                  onCheckedChange={(checked) => onTaskToggle(task.id, checked as boolean)}
                  className="h-4 w-4"
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-neutral-800">{task.title}</p>
                <div className="mt-1 flex items-center text-xs text-neutral-500">
                  <span className="material-icons text-xs mr-1">schedule</span>
                  {formatDate(task.dueDate, true)}
                  {task.category && (
                    <Badge variant="outline" className={`ml-2 ${getCategoryColor(task.category)}`}>
                      {task.category}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <div className="mt-6">
          <Button 
            onClick={onAddTask}
            variant="outline" 
            className="w-full px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 border-primary-100 hover:bg-primary-100"
          >
            <span className="material-icons text-sm mr-1">add</span>
            Add New Task
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default TaskList;
