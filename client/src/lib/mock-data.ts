import { Goal, MoodLog, Task, SocialConnection, LearningResource, User } from "@/types";

// Current user
export const currentUser: User = {
  id: 1,
  username: "demo",
  name: "Alex Morgan",
  age: 32,
  occupation: "Software Developer",
  assessmentCompleted: true
};

// Mock mood data for the past week
export const mockMoodData: MoodLog[] = [
  { id: 1, userId: 1, score: 65, date: new Date(Date.now() - 6 * 86400000), note: "Feeling tired" },
  { id: 2, userId: 1, score: 59, date: new Date(Date.now() - 5 * 86400000), note: "Stressed about project" },
  { id: 3, userId: 1, score: 80, date: new Date(Date.now() - 4 * 86400000), note: "Great meeting" },
  { id: 4, userId: 1, score: 81, date: new Date(Date.now() - 3 * 86400000), note: "Productive day" },
  { id: 5, userId: 1, score: 75, date: new Date(Date.now() - 2 * 86400000), note: "Good progress" },
  { id: 6, userId: 1, score: 85, date: new Date(Date.now() - 1 * 86400000), note: "Weekend plans" },
  { id: 7, userId: 1, score: 82, date: new Date(), note: "Feeling optimistic" }
];

// Mock goals
export const mockGoals: Goal[] = [
  {
    id: 1,
    userId: 1,
    title: "Learn Python",
    description: "Complete Python programming basics course",
    progress: 45,
    isCompleted: false,
    category: "Learning",
    steps: [
      { id: 1, title: "Variables & Data Types", isCompleted: true },
      { id: 2, title: "Control Flow", isCompleted: true },
      { id: 3, title: "Functions", isCompleted: false },
      { id: 4, title: "Classes & OOP", isCompleted: false }
    ]
  },
  {
    id: 2,
    userId: 1,
    title: "Fitness",
    description: "Run 5km three times a week",
    progress: 72,
    isCompleted: false,
    category: "Health",
    steps: [
      { id: 1, title: "Week 1: 3 runs", isCompleted: true },
      { id: 2, title: "Week 2: 3 runs", isCompleted: true },
      { id: 3, title: "Week 3: 3 runs", isCompleted: true },
      { id: 4, title: "Week 4: 3 runs", isCompleted: false }
    ]
  },
  {
    id: 3,
    userId: 1,
    title: "Reading",
    description: "Read 12 books this year",
    progress: 23,
    isCompleted: false,
    category: "Personal",
    steps: [
      { id: 1, title: "Book 1", isCompleted: true },
      { id: 2, title: "Book 2", isCompleted: true },
      { id: 3, title: "Book 3", isCompleted: false }
    ]
  }
];

// Mock tasks
export const mockTasks: Task[] = [
  {
    id: 1,
    userId: 1,
    title: "Complete Python basics lesson",
    isCompleted: false,
    dueDate: new Date(new Date().setHours(14, 0, 0, 0)),
    category: "Learning",
    goalId: 1
  },
  {
    id: 2,
    userId: 1,
    title: "Call Sarah for coffee",
    isCompleted: false,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    category: "Social"
  },
  {
    id: 3,
    userId: 1,
    title: "30 minute evening run",
    isCompleted: false,
    dueDate: new Date(new Date().setHours(18, 30, 0, 0)),
    category: "Fitness",
    goalId: 2
  },
  {
    id: 4,
    userId: 1,
    title: "Review monthly budget",
    isCompleted: false,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 3)),
    category: "Finance"
  }
];

// Mock social connections
export const mockSocialConnections: SocialConnection[] = [
  {
    id: 1,
    userId: 1,
    name: "Sarah Johnson",
    relationship: "Friend",
    lastContactDate: new Date(Date.now() - 3 * 86400000),
    contactFrequency: 7,
    phoneNumber: "+1 (555) 123-4567"
  },
  {
    id: 2,
    userId: 1,
    name: "John Smith",
    relationship: "Colleague",
    lastContactDate: new Date(Date.now() - 1 * 86400000),
    contactFrequency: 14,
    phoneNumber: "+1 (555) 234-5678"
  },
  {
    id: 3,
    userId: 1,
    name: "Maria Rodriguez",
    relationship: "Family",
    lastContactDate: new Date(Date.now() - 5 * 86400000),
    contactFrequency: 7,
    phoneNumber: "+1 (555) 345-6789"
  },
  {
    id: 4,
    userId: 1,
    name: "David Lee",
    relationship: "Friend",
    lastContactDate: new Date(Date.now() - 10 * 86400000),
    contactFrequency: 30,
    phoneNumber: "+1 (555) 456-7890"
  },
  {
    id: 5,
    userId: 1,
    name: "Emma Wilson",
    relationship: "Friend",
    lastContactDate: new Date(Date.now() - 15 * 86400000),
    contactFrequency: 14,
    phoneNumber: "+1 (555) 567-8901"
  },
  {
    id: 6,
    userId: 1,
    name: "James Brown",
    relationship: "Colleague",
    lastContactDate: new Date(Date.now() - 7 * 86400000),
    contactFrequency: 30,
    phoneNumber: "+1 (555) 678-9012"
  },
  {
    id: 7,
    userId: 1,
    name: "Olivia Davis",
    relationship: "Friend",
    lastContactDate: new Date(Date.now() - 20 * 86400000),
    contactFrequency: 30,
    phoneNumber: "+1 (555) 789-0123"
  },
  {
    id: 8,
    userId: 1,
    name: "Michael Taylor",
    relationship: "Colleague",
    lastContactDate: new Date(Date.now() - 18 * 86400000),
    contactFrequency: 14,
    phoneNumber: "+1 (555) 890-1234"
  }
];

// Mock learning resources
export const mockLearningResources: LearningResource[] = [
  {
    id: 1,
    userId: 1,
    title: "Python Programming Fundamentals",
    category: "Technology",
    url: "https://www.coursera.org/learn/python-programming",
    isCompleted: false,
    progress: 45
  },
  {
    id: 2,
    userId: 1,
    title: "Building Resilience in the Workplace",
    category: "Career",
    url: "https://www.linkedin.com/learning/building-resilience",
    isCompleted: false,
    progress: 20
  },
  {
    id: 3,
    userId: 1,
    title: "The Science of Well-Being",
    category: "Health",
    url: "https://www.coursera.org/learn/the-science-of-well-being",
    isCompleted: false,
    progress: 75
  }
];

// Mock metrics for the dashboard
export const mockMetrics = {
  mentalHealth: {
    score: 82,
    trend: {
      direction: 'up' as const,
      value: 4
    }
  },
  productivity: {
    score: 68,
    trend: {
      direction: 'up' as const,
      value: 12
    },
    tasksCompleted: 15,
    totalTasks: 22
  },
  goals: {
    active: 3,
    completed: 5
  },
  socialConnections: {
    active: 8,
    new: 2
  }
};
