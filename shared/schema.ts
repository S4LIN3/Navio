import { pgTable, text, serial, integer, boolean, timestamp, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session table for authentication
export const sessions = pgTable("sessions", {
  sid: text("sid").notNull().primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire", { mode: "date" }).notNull(),
});

// User Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  name: text("name"),
  age: integer("age"),
  occupation: text("occupation"),
  location: text("location"),
  bio: text("bio"),
  phoneNumber: text("phone_number"),
  dateJoined: timestamp("date_joined").defaultNow(),
  assessmentCompleted: boolean("assessment_completed").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  name: true,
  age: true,
  occupation: true,
  location: true,
  bio: true,
  phoneNumber: true,
});

// Goals Table
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  progress: integer("progress").default(0),
  isCompleted: boolean("is_completed").default(false),
  dueDate: timestamp("due_date"),
  category: text("category"),
  location: text("location"),
  steps: jsonb("steps")
});

export const insertGoalSchema = createInsertSchema(goals).pick({
  userId: true,
  title: true,
  description: true,
  dueDate: true,
  category: true,
  location: true,
  steps: true,
});

// Mood Logs Table
export const moodLogs = pgTable("mood_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  score: integer("score").notNull(),
  note: text("note"),
  date: timestamp("date").defaultNow(),
});

export const insertMoodLogSchema = createInsertSchema(moodLogs).pick({
  userId: true,
  score: true,
  note: true,
});

// Tasks Table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  isCompleted: boolean("is_completed").default(false),
  dueDate: timestamp("due_date"),
  category: text("category"),
  goalId: integer("goal_id"),
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  userId: true,
  title: true,
  dueDate: true,
  category: true,
  goalId: true,
});

// Social Connections Table
export const socialConnections = pgTable("social_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  relationship: text("relationship"),
  lastContactDate: timestamp("last_contact_date"),
  contactFrequency: integer("contact_frequency"),
  phoneNumber: text("phone_number"),
});

export const insertSocialConnectionSchema = createInsertSchema(socialConnections).pick({
  userId: true,
  name: true,
  relationship: true,
  lastContactDate: true,
  contactFrequency: true,
  phoneNumber: true,
});

// Learning Resources Table
export const learningResources = pgTable("learning_resources", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  category: text("category"),
  url: text("url"),
  isCompleted: boolean("is_completed").default(false),
  progress: integer("progress").default(0),
});

export const insertLearningResourceSchema = createInsertSchema(learningResources).pick({
  userId: true,
  title: true,
  category: true,
  url: true,
});

// Assessment Table
export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  careerGoals: text("career_goals"),
  personalGoals: text("personal_goals"),
  interests: jsonb("interests"),
  challenges: jsonb("challenges"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAssessmentSchema = createInsertSchema(assessments).pick({
  userId: true,
  careerGoals: true,
  personalGoals: true,
  interests: true,
  challenges: true,
});

// Define table relations
export const usersRelations = relations(users, ({ many }) => ({
  goals: many(goals),
  moodLogs: many(moodLogs),
  tasks: many(tasks),
  socialConnections: many(socialConnections),
  learningResources: many(learningResources),
  assessment: many(assessments),
}));

export const goalsRelations = relations(goals, ({ one, many }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id],
  }),
  tasks: many(tasks),
}));

export const moodLogsRelations = relations(moodLogs, ({ one }) => ({
  user: one(users, {
    fields: [moodLogs.userId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
  goal: one(goals, {
    fields: [tasks.goalId],
    references: [goals.id],
  }),
}));

export const socialConnectionsRelations = relations(socialConnections, ({ one }) => ({
  user: one(users, {
    fields: [socialConnections.userId],
    references: [users.id],
  }),
}));

export const learningResourcesRelations = relations(learningResources, ({ one }) => ({
  user: one(users, {
    fields: [learningResources.userId],
    references: [users.id],
  }),
}));

export const assessmentsRelations = relations(assessments, ({ one }) => ({
  user: one(users, {
    fields: [assessments.userId],
    references: [users.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;

export type MoodLog = typeof moodLogs.$inferSelect;
export type InsertMoodLog = z.infer<typeof insertMoodLogSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type SocialConnection = typeof socialConnections.$inferSelect;
export type InsertSocialConnection = z.infer<typeof insertSocialConnectionSchema>;

export type LearningResource = typeof learningResources.$inferSelect;
export type InsertLearningResource = z.infer<typeof insertLearningResourceSchema>;

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
