/**
 * Google API utilities for the Personal Life Navigator
 */

// Types for calendar events
export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  location?: string;
  status: string;
}

// Types for location data
export interface LocationData {
  name: string;
  address: string;
  placeId: string;
  location: {
    lat: number;
    lng: number;
  };
  types: string[];
}

// Get location suggestions based on text input
export async function getLocationSuggestions(input: string): Promise<LocationData[]> {
  try {
    const response = await fetch(`/api/google/places?query=${encodeURIComponent(input)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch location suggestions');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching location suggestions:', error);
    return [];
  }
}

// Convert a goal to a Google Calendar event
export function goalToCalendarEvent(goal: any): Partial<CalendarEvent> {
  // Calculate end time (default: 1 hour after start)
  const startTime = goal.dueDate ? new Date(goal.dueDate) : new Date();
  const endTime = new Date(startTime);
  endTime.setHours(endTime.getHours() + 1);
  
  return {
    summary: goal.title,
    description: goal.description || '',
    start: {
      dateTime: startTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    location: goal.location || '',
    status: 'confirmed'
  };
}

// Add a goal to Google Calendar
export async function addGoalToCalendar(goal: any): Promise<{ success: boolean, eventId?: string, error?: string }> {
  try {
    const event = goalToCalendarEvent(goal);
    const response = await fetch('/api/google/calendar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add event to calendar');
    }
    
    const result = await response.json();
    return { success: true, eventId: result.id };
  } catch (error) {
    console.error('Error adding goal to calendar:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Get suggestions for mood-improving activities based on mood data
export async function getMoodSuggestions(moodScore: number, notes: string): Promise<string[]> {
  try {
    const response = await fetch('/api/google/mood-suggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        moodScore,
        notes
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get mood suggestions');
    }
    
    const result = await response.json();
    return result.suggestions;
  } catch (error) {
    console.error('Error getting mood suggestions:', error);
    return [
      'Take a short walk outside',
      'Practice deep breathing for 5 minutes',
      'Write in your journal',
      'Listen to uplifting music',
      'Call a friend or family member'
    ];
  }
}

// Get personalized insights for the dashboard
export async function getDashboardInsights(userData: any): Promise<{ 
  insights: string[], 
  focusAreas: Array<{ area: string, score: number }> 
}> {
  try {
    const response = await fetch('/api/google/insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get dashboard insights');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting dashboard insights:', error);
    return {
      insights: [
        'Consider adding more specific steps to your goals',
        'Your consistency in logging moods is helping build a useful pattern',
        'Try to balance your focus across different life areas'
      ],
      focusAreas: [
        { area: 'Physical Health', score: 65 },
        { area: 'Mental Wellbeing', score: 72 },
        { area: 'Career Growth', score: 58 },
        { area: 'Social Connections', score: 80 }
      ]
    };
  }
}