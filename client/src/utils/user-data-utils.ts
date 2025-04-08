import { 
  mockGoals, 
  mockMoodData, 
  mockTasks, 
  mockSocialConnections, 
  mockLearningResources 
} from "@/lib/mock-data";

/**
 * Clears all user-specific data from localStorage
 * Used when a new user logs in to provide a fresh experience
 */
export function clearUserData() {
  // Clear all user-specific localStorage data to ensure a totally clean state
  localStorage.removeItem('userGoals');
  localStorage.removeItem('userMoodLogs');
  localStorage.removeItem('userTasks');
  localStorage.removeItem('userConnections');
  localStorage.removeItem('userLearningResources');
  localStorage.removeItem('hasCompletedAssessment');
  localStorage.removeItem('userFinancialGoals');
  localStorage.removeItem('userFinancialTransactions');
  localStorage.removeItem('userProductivityTasks');
  localStorage.removeItem('userTimeEntries');
  localStorage.removeItem('userPomodoroSettings');
  localStorage.removeItem('userSettings');
  localStorage.removeItem('userNotifications');
  localStorage.removeItem('userAccessibility');
  localStorage.removeItem('userAppearance');
  localStorage.removeItem('userAssessmentResults');
  localStorage.removeItem('userActivityHistory');
  
  // Additional app-specific items
  localStorage.removeItem('lastVisitedPage');
  localStorage.removeItem('completedTutorials');
  localStorage.removeItem('savedDrafts');
  localStorage.removeItem('recentSearches');
  
  // Set default data if needed
  resetUserDataToDefaults();
}

/**
 * Resets user data to default values for the current user
 */
export function resetUserDataToDefaults() {
  // Get current user id
  const currentUserStr = localStorage.getItem('currentUser');
  if (!currentUserStr) return;
  
  const currentUser = JSON.parse(currentUserStr);
  const userId = currentUser.id;

  // Set initial data with the correct user ID
  const goals = mockGoals.map(goal => ({ ...goal, userId }));
  const moodLogs = mockMoodData.map(log => ({ ...log, userId }));
  const tasks = mockTasks.map(task => ({ ...task, userId }));
  const connections = mockSocialConnections.map(conn => ({ ...conn, userId }));
  const learningResources = mockLearningResources.map(resource => ({ ...resource, userId }));

  // Store in localStorage
  localStorage.setItem('userGoals', JSON.stringify(goals));
  localStorage.setItem('userMoodLogs', JSON.stringify(moodLogs));
  localStorage.setItem('userTasks', JSON.stringify(tasks));
  localStorage.setItem('userConnections', JSON.stringify(connections));
  localStorage.setItem('userLearningResources', JSON.stringify(learningResources));
  
  // Initialize financial data with defaults
  localStorage.setItem('userFinancialGoals', JSON.stringify([
    { id: 1, userId, title: "Emergency Fund", target: 10000, current: 2500, deadline: new Date(Date.now() + 15552000000) },
    { id: 2, userId, title: "Pay off Credit Card", target: 5000, current: 1000, deadline: new Date(Date.now() + 7776000000) }
  ]));
  
  localStorage.setItem('userFinancialTransactions', JSON.stringify([
    { id: 1, userId, type: "income", amount: 2500, category: "Salary", date: new Date(Date.now() - 2592000000) },
    { id: 2, userId, type: "expense", amount: 800, category: "Rent", date: new Date(Date.now() - 1728000000) },
    { id: 3, userId, type: "expense", amount: 150, category: "Groceries", date: new Date(Date.now() - 864000000) }
  ]));
  
  // Set default user preferences
  localStorage.setItem('userSettings', JSON.stringify({
    theme: 'system',
    emailNotifications: true,
    appNotifications: true,
    goalReminders: true,
    socialReminders: false
  }));
  
  // Set default accessibility settings
  localStorage.setItem('userAccessibility', JSON.stringify({
    fontSize: 'medium',
    contrast: 'normal',
    reducedMotion: false,
    screenReader: false
  }));
  
  // Initialize productivity data
  localStorage.setItem('userProductivityTasks', JSON.stringify([
    { id: 1, userId, title: "Complete project proposal", description: "Draft the initial proposal for the client project", isCompleted: false, priority: "high", category: "Work", estimatedMinutes: 120 },
    { id: 2, userId, title: "Schedule dentist appointment", description: "Book regular checkup", isCompleted: false, priority: "medium", category: "Health", dueDate: new Date(Date.now() + 604800000) },
    { id: 3, userId, title: "Read chapter 5 of textbook", description: "Complete reading assignment", isCompleted: false, priority: "medium", category: "Education", estimatedMinutes: 45 }
  ]));
  
  localStorage.setItem('userTimeEntries', JSON.stringify([]));
  
  localStorage.setItem('userPomodoroSettings', JSON.stringify({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false
  }));
  
  // Set assessment as not completed for new users
  localStorage.setItem('hasCompletedAssessment', 'false');
}

/**
 * Loads data for the Social Connections section
 * @returns Array of social connections for the current user
 */
export function loadUserConnections(): any[] {
  const connectionsStr = localStorage.getItem('userConnections');
  if (connectionsStr) {
    try {
      return JSON.parse(connectionsStr);
    } catch (e) {
      console.error('Failed to parse user connections from localStorage', e);
    }
  }
  
  // If no data is found, use default data with the current user ID
  const currentUserStr = localStorage.getItem('currentUser');
  if (!currentUserStr) return mockSocialConnections;
  
  const currentUser = JSON.parse(currentUserStr);
  const userId = currentUser.id;
  
  const connections = mockSocialConnections.map(conn => ({ ...conn, userId }));
  localStorage.setItem('userConnections', JSON.stringify(connections));
  return connections;
}

/**
 * Saves connections data to localStorage
 * @param connections Array of social connections to save
 */
export function saveUserConnections(connections: any[]) {
  localStorage.setItem('userConnections', JSON.stringify(connections));
}

/**
 * Loads data for the Learning Resources section
 * @returns Array of learning resources for the current user
 */
export function loadUserLearningResources(): any[] {
  const resourcesStr = localStorage.getItem('userLearningResources');
  if (resourcesStr) {
    try {
      return JSON.parse(resourcesStr);
    } catch (e) {
      console.error('Failed to parse user learning resources from localStorage', e);
    }
  }
  
  // If no data is found, use default data with the current user ID
  const currentUserStr = localStorage.getItem('currentUser');
  if (!currentUserStr) return mockLearningResources;
  
  const currentUser = JSON.parse(currentUserStr);
  const userId = currentUser.id;
  
  const resources = mockLearningResources.map(resource => ({ ...resource, userId }));
  localStorage.setItem('userLearningResources', JSON.stringify(resources));
  return resources;
}

/**
 * Saves learning resources data to localStorage
 * @param resources Array of learning resources to save
 */
export function saveUserLearningResources(resources: any[]) {
  localStorage.setItem('userLearningResources', JSON.stringify(resources));
}

/**
 * Loads data for the Productivity tasks
 * @returns Array of productivity tasks for the current user
 */
export function loadUserProductivityTasks(): any[] {
  const tasksStr = localStorage.getItem('userProductivityTasks');
  if (tasksStr) {
    try {
      const parsedTasks = JSON.parse(tasksStr);
      // Convert date strings back to Date objects
      return parsedTasks.map((task: any) => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined
      }));
    } catch (e) {
      console.error('Failed to parse user productivity tasks from localStorage', e);
    }
  }
  
  // If no data is found, use default data with the current user ID
  const currentUserStr = localStorage.getItem('currentUser');
  if (!currentUserStr) return [];
  
  const currentUser = JSON.parse(currentUserStr);
  const userId = currentUser.id;
  
  const defaultTasks = [
    { id: 1, userId, title: "Complete project proposal", description: "Draft the initial proposal for the client project", isCompleted: false, priority: "high", category: "Work", estimatedMinutes: 120 },
    { id: 2, userId, title: "Schedule dentist appointment", description: "Book regular checkup", isCompleted: false, priority: "medium", category: "Health", dueDate: new Date(Date.now() + 604800000) },
    { id: 3, userId, title: "Read chapter 5 of textbook", description: "Complete reading assignment", isCompleted: false, priority: "medium", category: "Education", estimatedMinutes: 45 }
  ];
  
  localStorage.setItem('userProductivityTasks', JSON.stringify(defaultTasks));
  return defaultTasks;
}

/**
 * Saves productivity tasks data to localStorage
 * @param tasks Array of productivity tasks to save
 */
export function saveUserProductivityTasks(tasks: any[]) {
  localStorage.setItem('userProductivityTasks', JSON.stringify(tasks));
}

/**
 * Loads time tracking entries
 * @returns Array of time tracking entries for the current user
 */
export function loadUserTimeEntries(): any[] {
  const entriesStr = localStorage.getItem('userTimeEntries');
  if (entriesStr) {
    try {
      const parsedEntries = JSON.parse(entriesStr);
      // Convert date strings back to Date objects
      return parsedEntries.map((entry: any) => ({
        ...entry,
        startTime: new Date(entry.startTime),
        endTime: entry.endTime ? new Date(entry.endTime) : undefined
      }));
    } catch (e) {
      console.error('Failed to parse user time entries from localStorage', e);
    }
  }
  
  // Default to empty array if nothing found
  localStorage.setItem('userTimeEntries', JSON.stringify([]));
  return [];
}

/**
 * Saves time tracking entries to localStorage
 * @param entries Array of time tracking entries to save
 */
export function saveUserTimeEntries(entries: any[]) {
  localStorage.setItem('userTimeEntries', JSON.stringify(entries));
}

/**
 * Loads pomodoro settings
 * @returns Pomodoro settings for the current user
 */
export function loadUserPomodoroSettings(): any {
  const settingsStr = localStorage.getItem('userPomodoroSettings');
  if (settingsStr) {
    try {
      return JSON.parse(settingsStr);
    } catch (e) {
      console.error('Failed to parse user pomodoro settings from localStorage', e);
    }
  }
  
  // Default settings
  const defaultSettings = {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false
  };
  
  localStorage.setItem('userPomodoroSettings', JSON.stringify(defaultSettings));
  return defaultSettings;
}

/**
 * Saves pomodoro settings to localStorage
 * @param settings Pomodoro settings to save
 */
export function saveUserPomodoroSettings(settings: any) {
  localStorage.setItem('userPomodoroSettings', JSON.stringify(settings));
}