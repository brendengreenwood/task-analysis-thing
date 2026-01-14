import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Projects
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  phase: text('phase', { enum: ['discovery', 'product'] }).default('discovery'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// Personas
export const personas = sqliteTable('personas', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  role: text('role'),
  description: text('description'),
  goals: text('goals', { mode: 'json' }).$type<string[]>().default([]),
  frustrations: text('frustrations', { mode: 'json' }).$type<string[]>().default([]),
  tools: text('tools', { mode: 'json' }).$type<string[]>().default([]),
  quote: text('quote'),
  avatarUrl: text('avatar_url'),
  skills: text('skills', { mode: 'json' }).$type<string[]>().default([]),
  environment: text('environment'),
  experienceLevel: text('experience_level', { enum: ['beginner', 'intermediate', 'advanced', 'expert'] }),
  usageFrequency: text('usage_frequency', { enum: ['daily', 'weekly', 'monthly', 'occasionally'] }),
  influence: text('influence', { enum: ['low', 'medium', 'high'] }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// Research Sessions
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['interview', 'observation', 'usability_test', 'survey', 'analytics', 'diary'] }).notNull(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  participantName: text('participant_name'),
  personaId: text('persona_id').references(() => personas.id),
  duration: integer('duration'), // minutes
  notes: text('notes'),
  transcript: text('transcript'), // imported or pasted transcript with timestamps
  recordingUrl: text('recording_url'),
});

// Activities (existing, enhanced)
export const activities = sqliteTable('activities', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  overview: text('overview'),
  frequency: text('frequency', { enum: ['daily', 'weekly', 'monthly', 'quarterly', 'rarely'] }),
  importance: text('importance', { enum: ['low', 'medium', 'high', 'critical'] }),
  order: integer('order').notNull().default(0),
});

// Persona-Activity junction (many-to-many)
export const personaActivities = sqliteTable('persona_activities', {
  personaId: text('persona_id').notNull().references(() => personas.id, { onDelete: 'cascade' }),
  activityId: text('activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }),
});

// Tasks (existing)
export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  activityId: text('activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  goal: text('goal'),
  order: integer('order').notNull().default(0),
});

// Operations (existing, enhanced)
export const operations = sqliteTable('operations', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  details: text('details'),
  toolsUsed: text('tools_used', { mode: 'json' }).$type<string[]>().default([]),
  order: integer('order').notNull().default(0),
});

// Insights
export const insights = sqliteTable('insights', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  sessionId: text('session_id').references(() => sessions.id),
  content: text('content').notNull(),
  type: text('type', { enum: ['observation', 'pattern', 'quote', 'pain_point'] }).default('observation'),
  severity: text('severity', { enum: ['low', 'medium', 'high', 'critical'] }), // for pain_points
  linkedEntityType: text('linked_entity_type', { enum: ['activity', 'task', 'operation', 'persona'] }),
  linkedEntityId: text('linked_entity_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// Mental Models
export const mentalModels = sqliteTable('mental_models', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  personaId: text('persona_id').references(() => personas.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// Concepts (nodes in the mental model canvas)
export const concepts = sqliteTable('concepts', {
  id: text('id').primaryKey(),
  mentalModelId: text('mental_model_id').notNull().references(() => mentalModels.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  userLanguage: text('user_language'),
  systemEquivalent: text('system_equivalent'),
  x: integer('x').notNull().default(0),
  y: integer('y').notNull().default(0),
});

// Beliefs (user assumptions vs reality)
export const beliefs = sqliteTable('beliefs', {
  id: text('id').primaryKey(),
  mentalModelId: text('mental_model_id').notNull().references(() => mentalModels.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  reality: text('reality'),
  isMismatch: integer('is_mismatch', { mode: 'boolean' }).default(false),
  severity: text('severity', { enum: ['low', 'medium', 'high', 'critical'] }),
  insightIds: text('insight_ids', { mode: 'json' }).$type<string[]>().default([]),
});

// Concept Relationships (edges in the mental model canvas)
export const conceptRelationships = sqliteTable('concept_relationships', {
  id: text('id').primaryKey(),
  mentalModelId: text('mental_model_id').notNull().references(() => mentalModels.id, { onDelete: 'cascade' }),
  fromConceptId: text('from_concept_id').notNull().references(() => concepts.id, { onDelete: 'cascade' }),
  toConceptId: text('to_concept_id').notNull().references(() => concepts.id, { onDelete: 'cascade' }),
  relationshipType: text('relationship_type'),
  label: text('label'),
});
