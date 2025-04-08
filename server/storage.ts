import {
  users, User, InsertUser,
  goals, Goal, InsertGoal,
  moodLogs, MoodLog, InsertMoodLog,
  tasks, Task, InsertTask,
  socialConnections, SocialConnection, InsertSocialConnection,
  learningResources, LearningResource, InsertLearningResource,
  assessments, Assessment, InsertAssessment,
  sessions
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import createMemoryStore from "memorystore";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Goal operations
  createGoal(goal: InsertGoal): Promise<Goal>;
  getGoalsByUserId(userId: number): Promise<Goal[]>;
  getGoal(id: number): Promise<Goal | undefined>;
  updateGoal(id: number, updates: Partial<Goal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;
  
  // Mood operations
  createMoodLog(moodLog: InsertMoodLog): Promise<MoodLog>;
  getMoodLogsByUserId(userId: number): Promise<MoodLog[]>;
  
  // Task operations
  createTask(task: InsertTask): Promise<Task>;
  getTasksByUserId(userId: number): Promise<Task[]>;
  updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Social connection operations
  createSocialConnection(connection: InsertSocialConnection): Promise<SocialConnection>;
  getSocialConnectionsByUserId(userId: number): Promise<SocialConnection[]>;
  updateSocialConnection(id: number, updates: Partial<SocialConnection>): Promise<SocialConnection | undefined>;
  
  // Learning resource operations
  createLearningResource(resource: InsertLearningResource): Promise<LearningResource>;
  getLearningResourcesByUserId(userId: number): Promise<LearningResource[]>;
  updateLearningResource(id: number, updates: Partial<LearningResource>): Promise<LearningResource | undefined>;
  
  // Assessment operations
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  getAssessmentByUserId(userId: number): Promise<Assessment | undefined>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private goals: Map<number, Goal>;
  private moodLogs: Map<number, MoodLog>;
  private tasks: Map<number, Task>;
  private socialConnections: Map<number, SocialConnection>;
  private learningResources: Map<number, LearningResource>;
  private assessments: Map<number, Assessment>;
  
  private userId: number;
  private goalId: number;
  private moodLogId: number;
  private taskId: number;
  private socialConnectionId: number;
  private learningResourceId: number;
  private assessmentId: number;

  constructor() {
    this.users = new Map();
    this.goals = new Map();
    this.moodLogs = new Map();
    this.tasks = new Map();
    this.socialConnections = new Map();
    this.learningResources = new Map();
    this.assessments = new Map();
    
    this.userId = 1;
    this.goalId = 1;
    this.moodLogId = 1;
    this.taskId = 1;
    this.socialConnectionId = 1;
    this.learningResourceId = 1;
    this.assessmentId = 1;
    
    // Initialize with a demo user - commented out due to schema changes
    /*
    this.createUser({
      username: "demo",
      email: "demo@example.com",
      password: "password",
      name: "Alex Morgan",
      age: 32,
      occupation: "Software Developer"
    });
    */
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id, assessmentCompleted: false };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    // Delete all user-related data first
    // Goals
    const userGoals = await this.getGoalsByUserId(id);
    for (const goal of userGoals) {
      await this.deleteGoal(goal.id);
    }
    
    // Tasks
    const userTasks = await this.getTasksByUserId(id);
    for (const task of userTasks) {
      await this.deleteTask(task.id);
    }
    
    // Mood logs 
    const userMoodLogs = await this.getMoodLogsByUserId(id);
    for (const log of userMoodLogs) {
      this.moodLogs.delete(log.id);
    }
    
    // Social connections
    const userConnections = await this.getSocialConnectionsByUserId(id);
    for (const connection of userConnections) {
      this.socialConnections.delete(connection.id);
    }
    
    // Learning resources
    const userResources = await this.getLearningResourcesByUserId(id);
    for (const resource of userResources) {
      this.learningResources.delete(resource.id);
    }
    
    // Assessment
    const userAssessment = await this.getAssessmentByUserId(id);
    if (userAssessment) {
      this.assessments.delete(userAssessment.id);
    }
    
    // Finally delete the user
    return this.users.delete(id);
  }

  // Goal operations
  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = this.goalId++;
    const goal: Goal = { 
      ...insertGoal, 
      id, 
      progress: 0, 
      isCompleted: false,
      steps: insertGoal.steps || []
    };
    this.goals.set(id, goal);
    return goal;
  }
  
  async getGoalsByUserId(userId: number): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(
      (goal) => goal.userId === userId
    );
  }
  
  async getGoal(id: number): Promise<Goal | undefined> {
    return this.goals.get(id);
  }
  
  async updateGoal(id: number, updates: Partial<Goal>): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (!goal) return undefined;
    
    const updatedGoal = { ...goal, ...updates };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }
  
  async deleteGoal(id: number): Promise<boolean> {
    return this.goals.delete(id);
  }

  // Mood log operations
  async createMoodLog(insertMoodLog: InsertMoodLog): Promise<MoodLog> {
    const id = this.moodLogId++;
    const moodLog: MoodLog = { 
      ...insertMoodLog, 
      id, 
      date: new Date() 
    };
    this.moodLogs.set(id, moodLog);
    return moodLog;
  }
  
  async getMoodLogsByUserId(userId: number): Promise<MoodLog[]> {
    return Array.from(this.moodLogs.values())
      .filter((log) => log.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime()); // Newest first
  }

  // Task operations
  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskId++;
    const task: Task = { 
      ...insertTask, 
      id, 
      isCompleted: false 
    };
    this.tasks.set(id, task);
    return task;
  }
  
  async getTasksByUserId(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId
    );
  }
  
  async updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...updates };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Social connection operations
  async createSocialConnection(insertConnection: InsertSocialConnection): Promise<SocialConnection> {
    const id = this.socialConnectionId++;
    const connection: SocialConnection = { ...insertConnection, id };
    this.socialConnections.set(id, connection);
    return connection;
  }
  
  async getSocialConnectionsByUserId(userId: number): Promise<SocialConnection[]> {
    return Array.from(this.socialConnections.values()).filter(
      (connection) => connection.userId === userId
    );
  }
  
  async updateSocialConnection(id: number, updates: Partial<SocialConnection>): Promise<SocialConnection | undefined> {
    const connection = this.socialConnections.get(id);
    if (!connection) return undefined;
    
    const updatedConnection = { ...connection, ...updates };
    this.socialConnections.set(id, updatedConnection);
    return updatedConnection;
  }

  // Learning resource operations
  async createLearningResource(insertResource: InsertLearningResource): Promise<LearningResource> {
    const id = this.learningResourceId++;
    const resource: LearningResource = { 
      ...insertResource, 
      id, 
      isCompleted: false,
      progress: 0
    };
    this.learningResources.set(id, resource);
    return resource;
  }
  
  async getLearningResourcesByUserId(userId: number): Promise<LearningResource[]> {
    return Array.from(this.learningResources.values()).filter(
      (resource) => resource.userId === userId
    );
  }
  
  async updateLearningResource(id: number, updates: Partial<LearningResource>): Promise<LearningResource | undefined> {
    const resource = this.learningResources.get(id);
    if (!resource) return undefined;
    
    const updatedResource = { ...resource, ...updates };
    this.learningResources.set(id, updatedResource);
    return updatedResource;
  }

  // Assessment operations
  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const id = this.assessmentId++;
    const assessment: Assessment = { 
      ...insertAssessment, 
      id, 
      createdAt: new Date() 
    };
    this.assessments.set(id, assessment);
    
    // Update user's assessment status
    const user = this.users.get(insertAssessment.userId);
    if (user) {
      this.users.set(user.id, {
        ...user,
        assessmentCompleted: true
      });
    }
    
    return assessment;
  }
  
  async getAssessmentByUserId(userId: number): Promise<Assessment | undefined> {
    return Array.from(this.assessments.values()).find(
      (assessment) => assessment.userId === userId
    );
  }
}

// In-memory store implementation for MemStorage using memorystore
const MemoryStore = createMemoryStore(session);

// Add session store to MemStorage
Object.defineProperty(MemStorage.prototype, 'sessionStore', {
  get: function() {
    if (!this._sessionStore) {
      this._sessionStore = new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      });
    }
    return this._sessionStore;
  }
});

// PostgreSQL database implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Create session store
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true,
      tableName: 'sessions'
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    try {
      // Delete user data in related tables (in a transaction for atomicity)
      await db.transaction(async (tx) => {
        // Delete goals
        await tx.delete(goals).where(eq(goals.userId, id));
        
        // Delete tasks
        await tx.delete(tasks).where(eq(tasks.userId, id));
        
        // Delete mood logs
        await tx.delete(moodLogs).where(eq(moodLogs.userId, id));
        
        // Delete social connections
        await tx.delete(socialConnections).where(eq(socialConnections.userId, id));
        
        // Delete learning resources
        await tx.delete(learningResources).where(eq(learningResources.userId, id));
        
        // Delete assessment
        await tx.delete(assessments).where(eq(assessments.userId, id));
        
        // Delete sessions for this user (important for security)
        // Note: This query depends on the specific database implementation
        // For PostgreSQL, we can use jsonb operators
        await tx.execute(
          sql`DELETE FROM ${sessions} WHERE sess->>'passport' IS NOT NULL AND (sess->'passport'->>'user')::int = ${id}`
        );
        
        // Finally delete the user
        await tx.delete(users).where(eq(users.id, id));
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }

  // Goal operations
  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const [goal] = await db
      .insert(goals)
      .values({
        ...insertGoal,
        progress: 0, 
        isCompleted: false,
      })
      .returning();
    return goal;
  }

  async getGoalsByUserId(userId: number): Promise<Goal[]> {
    return await db.select().from(goals).where(eq(goals.userId, userId));
  }

  async getGoal(id: number): Promise<Goal | undefined> {
    const [goal] = await db.select().from(goals).where(eq(goals.id, id));
    return goal || undefined;
  }

  async updateGoal(id: number, updates: Partial<Goal>): Promise<Goal | undefined> {
    const [updatedGoal] = await db
      .update(goals)
      .set(updates)
      .where(eq(goals.id, id))
      .returning();
    return updatedGoal || undefined;
  }

  async deleteGoal(id: number): Promise<boolean> {
    await db.delete(goals).where(eq(goals.id, id));
    return true;
  }

  // Mood operations
  async createMoodLog(insertMoodLog: InsertMoodLog): Promise<MoodLog> {
    const [moodLog] = await db
      .insert(moodLogs)
      .values(insertMoodLog)
      .returning();
    return moodLog;
  }

  async getMoodLogsByUserId(userId: number): Promise<MoodLog[]> {
    return await db
      .select()
      .from(moodLogs)
      .where(eq(moodLogs.userId, userId))
      .orderBy(desc(moodLogs.date));
  }

  // Task operations
  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values({
        ...insertTask,
        isCompleted: false
      })
      .returning();
    return task;
  }

  async getTasksByUserId(userId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask || undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    await db.delete(tasks).where(eq(tasks.id, id));
    return true;
  }

  // Social connection operations
  async createSocialConnection(insertConnection: InsertSocialConnection): Promise<SocialConnection> {
    const [connection] = await db
      .insert(socialConnections)
      .values(insertConnection)
      .returning();
    return connection;
  }

  async getSocialConnectionsByUserId(userId: number): Promise<SocialConnection[]> {
    return await db
      .select()
      .from(socialConnections)
      .where(eq(socialConnections.userId, userId));
  }

  async updateSocialConnection(id: number, updates: Partial<SocialConnection>): Promise<SocialConnection | undefined> {
    const [updatedConnection] = await db
      .update(socialConnections)
      .set(updates)
      .where(eq(socialConnections.id, id))
      .returning();
    return updatedConnection || undefined;
  }

  // Learning resource operations
  async createLearningResource(insertResource: InsertLearningResource): Promise<LearningResource> {
    const [resource] = await db
      .insert(learningResources)
      .values({
        ...insertResource,
        isCompleted: false,
        progress: 0
      })
      .returning();
    return resource;
  }

  async getLearningResourcesByUserId(userId: number): Promise<LearningResource[]> {
    return await db
      .select()
      .from(learningResources)
      .where(eq(learningResources.userId, userId));
  }

  async updateLearningResource(id: number, updates: Partial<LearningResource>): Promise<LearningResource | undefined> {
    const [updatedResource] = await db
      .update(learningResources)
      .set(updates)
      .where(eq(learningResources.id, id))
      .returning();
    return updatedResource || undefined;
  }

  // Assessment operations
  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const [assessment] = await db
      .insert(assessments)
      .values(insertAssessment)
      .returning();
    
    // Update user's assessment status
    await db
      .update(users)
      .set({ assessmentCompleted: true })
      .where(eq(users.id, insertAssessment.userId));
    
    return assessment;
  }

  async getAssessmentByUserId(userId: number): Promise<Assessment | undefined> {
    const [assessment] = await db
      .select()
      .from(assessments)
      .where(eq(assessments.userId, userId));
    return assessment || undefined;
  }
}

// Use Database Storage instead of memory storage
export const storage = new DatabaseStorage();
