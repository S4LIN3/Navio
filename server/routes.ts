import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  getPlaceSuggestions, 
  addCalendarEvent, 
  getMoodSuggestions, 
  getDashboardInsights 
} from "./google-api";
import { 
  insertUserSchema, insertGoalSchema, insertMoodLogSchema, 
  insertTaskSchema, insertSocialConnectionSchema,
  insertLearningResourceSchema, insertAssessmentSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // User routes
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      
      // Don't send password back to client
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password back to client
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  
  app.delete("/api/account", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.user.id;
      const success = await storage.deleteUser(userId);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to delete account" });
      }
      
      // Log the user out
      req.logout((err) => {
        if (err) {
          console.error("Error during logout after account deletion:", err);
        }
        
        res.status(200).json({ message: "Account successfully deleted" });
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ message: "An error occurred while deleting your account" });
    }
  });
  
  // Goal routes
  app.post("/api/goals", async (req: Request, res: Response) => {
    try {
      const goalData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(goalData);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create goal" });
    }
  });
  
  app.get("/api/users/:userId/goals", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const goals = await storage.getGoalsByUserId(userId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to get goals" });
    }
  });
  
  app.put("/api/goals/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid goal ID" });
      }
      
      const updates = req.body;
      const updatedGoal = await storage.updateGoal(id, updates);
      
      if (!updatedGoal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      res.json(updatedGoal);
    } catch (error) {
      res.status(500).json({ message: "Failed to update goal" });
    }
  });
  
  app.delete("/api/goals/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid goal ID" });
      }
      
      const success = await storage.deleteGoal(id);
      if (!success) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });
  
  // Mood routes
  app.post("/api/moods", async (req: Request, res: Response) => {
    try {
      const moodData = insertMoodLogSchema.parse(req.body);
      const mood = await storage.createMoodLog(moodData);
      res.status(201).json(mood);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid mood data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create mood log" });
    }
  });
  
  app.get("/api/users/:userId/moods", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const moods = await storage.getMoodLogsByUserId(userId);
      res.json(moods);
    } catch (error) {
      res.status(500).json({ message: "Failed to get mood logs" });
    }
  });
  
  // Task routes
  app.post("/api/tasks", async (req: Request, res: Response) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });
  
  app.get("/api/users/:userId/tasks", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const tasks = await storage.getTasksByUserId(userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to get tasks" });
    }
  });
  
  app.put("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const updates = req.body;
      const updatedTask = await storage.updateTask(id, updates);
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task" });
    }
  });
  
  app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const success = await storage.deleteTask(id);
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });
  
  // Social connection routes
  app.post("/api/social-connections", async (req: Request, res: Response) => {
    try {
      const connectionData = insertSocialConnectionSchema.parse(req.body);
      const connection = await storage.createSocialConnection(connectionData);
      res.status(201).json(connection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid connection data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create social connection" });
    }
  });
  
  app.get("/api/users/:userId/social-connections", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const connections = await storage.getSocialConnectionsByUserId(userId);
      res.json(connections);
    } catch (error) {
      res.status(500).json({ message: "Failed to get social connections" });
    }
  });
  
  app.put("/api/social-connections/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid connection ID" });
      }
      
      const updates = req.body;
      const updatedConnection = await storage.updateSocialConnection(id, updates);
      
      if (!updatedConnection) {
        return res.status(404).json({ message: "Social connection not found" });
      }
      
      res.json(updatedConnection);
    } catch (error) {
      res.status(500).json({ message: "Failed to update social connection" });
    }
  });
  
  // Learning resource routes
  app.post("/api/learning-resources", async (req: Request, res: Response) => {
    try {
      const resourceData = insertLearningResourceSchema.parse(req.body);
      const resource = await storage.createLearningResource(resourceData);
      res.status(201).json(resource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid resource data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create learning resource" });
    }
  });
  
  app.get("/api/users/:userId/learning-resources", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const resources = await storage.getLearningResourcesByUserId(userId);
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to get learning resources" });
    }
  });
  
  app.put("/api/learning-resources/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid resource ID" });
      }
      
      const updates = req.body;
      const updatedResource = await storage.updateLearningResource(id, updates);
      
      if (!updatedResource) {
        return res.status(404).json({ message: "Learning resource not found" });
      }
      
      res.json(updatedResource);
    } catch (error) {
      res.status(500).json({ message: "Failed to update learning resource" });
    }
  });
  
  // Assessment routes
  app.post("/api/assessments", async (req: Request, res: Response) => {
    try {
      const assessmentData = insertAssessmentSchema.parse(req.body);
      const assessment = await storage.createAssessment(assessmentData);
      res.status(201).json(assessment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid assessment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create assessment" });
    }
  });
  
  app.get("/api/users/:userId/assessment", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const assessment = await storage.getAssessmentByUserId(userId);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      
      res.json(assessment);
    } catch (error) {
      res.status(500).json({ message: "Failed to get assessment" });
    }
  });

  // Google API routes
  app.get("/api/google/places", getPlaceSuggestions);
  app.post("/api/google/calendar", addCalendarEvent);
  app.post("/api/google/mood-suggestions", getMoodSuggestions);
  app.post("/api/google/insights", getDashboardInsights);

  const httpServer = createServer(app);
  return httpServer;
}
