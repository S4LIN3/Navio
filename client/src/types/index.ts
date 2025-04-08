export interface User {
  id: number;
  username: string;
  name?: string;
  age?: number;
  occupation?: string;
  assessmentCompleted: boolean;
}

export interface Goal {
  id: number;
  userId: number;
  title: string;
  description?: string;
  progress: number;
  isCompleted: boolean;
  dueDate?: Date;
  category?: string;
  location?: string;
  steps?: any[];
}

export interface MoodLog {
  id: number;
  userId: number;
  score: number;
  note?: string;
  date: Date;
}

export interface Task {
  id: number;
  userId: number;
  title: string;
  isCompleted: boolean;
  dueDate?: Date;
  category?: string;
  goalId?: number;
}

export interface SocialConnection {
  id: number;
  userId: number;
  name: string;
  relationship?: string;
  lastContactDate?: Date;
  contactFrequency?: number;
  phoneNumber?: string;
}

export interface LearningResource {
  id: number;
  userId: number;
  title: string;
  category?: string;
  url?: string;
  isCompleted: boolean;
  progress: number;
}

export interface Assessment {
  id: number;
  userId: number;
  careerGoals?: string;
  personalGoals?: string;
  interests?: string[];
  challenges?: string[];
  createdAt: Date;
}

// Dashboard metric types
export interface MetricCardProps {
  title: string;
  value: number | string;
  maxValue?: number | string;
  progress?: number;
  trend?: {
    direction: 'up' | 'down';
    value: number | string;
  };
  icon: string;
  footnote?: string;
  color?: 'primary' | 'secondary' | 'accent';
}

export interface ModuleCardProps {
  title: string;
  description: string;
  icon: string;
  buttonText: string;
  gradient: string;
  onClick: () => void;
}

export interface TaskItemProps {
  task: Task;
  onToggle: (id: number, completed: boolean) => void;
}
