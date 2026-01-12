# UX Research Tool — MVP Specification

> This is the focused build spec for initial implementation. See `ux-research-tool-spec.md` for full roadmap.

## Goal

Get a working research tool that can:
1. Document user workflows (existing task analysis, enhanced)
2. Capture research sessions and insights
3. Model personas and link them to workflows
4. Export structured JSON for AI agent context

## Tech Stack

| Layer | Tech | Notes |
|-------|------|-------|
| Frontend | React 18, Vite, Zustand, Tailwind | Existing |
| Backend | Hono + Mastra | Existing |
| Database | SQLite + Drizzle ORM | NEW — replace localStorage |
| AI | Mastra agents | Existing task builder, extend later |

---

## Database Schema

### Setup

```bash
# In apps/server
pnpm add drizzle-orm better-sqlite3
pnpm add -D drizzle-kit @types/better-sqlite3
```

### Schema (apps/server/src/db/schema.ts)

```typescript
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
```

### Database Config (apps/server/src/db/index.ts)

```typescript
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

const sqlite = new Database('research.db');
export const db = drizzle(sqlite, { schema });
```

### Drizzle Config (apps/server/drizzle.config.ts)

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'research.db',
  },
} satisfies Config;
```

---

## API Endpoints

### Projects
- `GET /api/projects` — List all projects
- `POST /api/projects` — Create project
- `GET /api/projects/:id` — Get project with all nested data
- `PUT /api/projects/:id` — Update project
- `DELETE /api/projects/:id` — Delete project (cascades)

### Personas
- `GET /api/projects/:projectId/personas` — List personas
- `POST /api/projects/:projectId/personas` — Create persona
- `PUT /api/personas/:id` — Update persona
- `DELETE /api/personas/:id` — Delete persona
- `POST /api/personas/:id/activities` — Link persona to activity
- `DELETE /api/personas/:personaId/activities/:activityId` — Unlink

### Sessions
- `GET /api/projects/:projectId/sessions` — List sessions
- `POST /api/projects/:projectId/sessions` — Create session
- `PUT /api/sessions/:id` — Update session
- `DELETE /api/sessions/:id` — Delete session

### Activities/Tasks/Operations (enhance existing)
- Keep existing endpoints
- Add `personaIds` to activity responses
- Add `toolsUsed` to operation responses

### Insights
- `GET /api/projects/:projectId/insights` — List all insights (filterable)
- `POST /api/projects/:projectId/insights` — Create insight
- `PUT /api/insights/:id` — Update insight (including linking)
- `DELETE /api/insights/:id` — Delete insight
- `GET /api/insights/unlinked` — Get insights not linked to any entity

### Export
- `GET /api/projects/:id/export` — Full JSON export for agent context

---

## Frontend Updates

### New Stores

**personaStore.ts**
```typescript
interface PersonaStore {
  personas: Persona[];
  loading: boolean;
  fetchPersonas: (projectId: string) => Promise<void>;
  createPersona: (projectId: string, data: CreatePersonaInput) => Promise<Persona>;
  updatePersona: (id: string, data: UpdatePersonaInput) => Promise<void>;
  deletePersona: (id: string) => Promise<void>;
  linkToActivity: (personaId: string, activityId: string) => Promise<void>;
  unlinkFromActivity: (personaId: string, activityId: string) => Promise<void>;
}
```

**sessionStore.ts**
```typescript
interface SessionStore {
  sessions: ResearchSession[];
  loading: boolean;
  fetchSessions: (projectId: string) => Promise<void>;
  createSession: (projectId: string, data: CreateSessionInput) => Promise<ResearchSession>;
  updateSession: (id: string, data: UpdateSessionInput) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
}
```

**insightStore.ts**
```typescript
interface InsightStore {
  insights: Insight[];
  loading: boolean;
  fetchInsights: (projectId: string) => Promise<void>;
  createInsight: (projectId: string, data: CreateInsightInput) => Promise<Insight>;
  updateInsight: (id: string, data: UpdateInsightInput) => Promise<void>;
  deleteInsight: (id: string) => Promise<void>;
  linkInsight: (id: string, entityType: string, entityId: string) => Promise<void>;
}
```

### New Pages/Components

```
pages/
├── Sessions.tsx          # Session list + session editor panel
├── Personas.tsx          # Persona cards grid + editor modal
└── Insights.tsx          # Insight list with filters + quick-link UI

components/
├── sessions/
│   ├── SessionList.tsx
│   ├── SessionCard.tsx
│   └── SessionEditor.tsx
├── personas/
│   ├── PersonaGrid.tsx
│   ├── PersonaCard.tsx
│   └── PersonaEditor.tsx
├── insights/
│   ├── InsightList.tsx
│   ├── InsightCard.tsx
│   ├── InsightEditor.tsx
│   └── QuickInsightCapture.tsx  # Floating button for inline capture
└── export/
    └── ExportButton.tsx         # Triggers JSON download
```

### Navigation Update

Add to sidebar:
- Sessions (new)
- Personas (new)  
- Tasks (existing, rename from "Projects" if needed)
- Insights (new)

### Task View Enhancements

- Show linked personas as avatars/chips on Activity cards
- Show insight count indicator (yellow dot) on any entity with linked insights
- Add "Add Insight" quick action in entity context menu or hover state
- Show `toolsUsed` chips on Operation cards

---

## JSON Export Format

```json
{
  "exportedAt": "2025-01-11T...",
  "project": {
    "id": "proj-1",
    "name": "Enterprise CRM Research",
    "phase": "discovery"
  },
  "personas": [
    {
      "id": "persona-1",
      "name": "Senior Sales Rep",
      "role": "Account Executive",
      "goals": ["Close deals faster", "Reduce admin work"],
      "frustrations": ["Too many tools", "Data entry duplication"],
      "tools": ["Salesforce", "Excel", "Outlook"],
      "activities": ["activity-1", "activity-2"]
    }
  ],
  "workflows": [
    {
      "activityId": "activity-1",
      "name": "Prepare for client call",
      "overview": "Gathering context before speaking with a prospect",
      "frequency": "daily",
      "importance": "high",
      "performedBy": ["persona-1"],
      "tasks": [
        {
          "taskId": "task-1",
          "name": "Review account history",
          "goal": "Understand past interactions",
          "operations": [
            {
              "operationId": "op-1",
              "name": "Open Salesforce account page",
              "details": "Navigate to account, scan recent activities",
              "toolsUsed": ["Salesforce"]
            },
            {
              "operationId": "op-2",
              "name": "Check email thread",
              "details": "Search Outlook for recent correspondence",
              "toolsUsed": ["Outlook"]
            }
          ]
        }
      ]
    }
  ],
  "insights": [
    {
      "id": "insight-1",
      "content": "Users often have 4+ browser tabs open just to prepare for one call",
      "type": "observation",
      "linkedTo": { "type": "activity", "id": "activity-1" }
    },
    {
      "id": "insight-2", 
      "content": "Copy-pasting between systems is the #1 complaint",
      "type": "pain_point",
      "severity": "high",
      "linkedTo": { "type": "operation", "id": "op-2" }
    }
  ],
  "sessions": [
    {
      "id": "session-1",
      "type": "interview",
      "date": "2025-01-10",
      "participantName": "P1",
      "persona": "persona-1",
      "insightCount": 5
    }
  ]
}
```

---

## Implementation Order

### Step 1: Database Foundation
1. Add Drizzle + SQLite dependencies
2. Create schema file
3. Create db connection
4. Run initial migration (`pnpm drizzle-kit generate` + `pnpm drizzle-kit migrate`)
5. Create migration script to import any existing localStorage data

### Step 2: API Layer
1. Create route files for each entity
2. Implement CRUD endpoints
3. Implement export endpoint
4. Test with curl/Postman

### Step 3: Frontend - Stores
1. Update existing task store to use API
2. Create persona store
3. Create session store
4. Create insight store

### Step 4: Frontend - Personas UI
1. PersonaGrid and PersonaCard components
2. PersonaEditor modal
3. Personas page
4. Link personas to activities in task view

### Step 5: Frontend - Sessions UI
1. SessionList and SessionCard components
2. SessionEditor (rich text notes)
3. Sessions page

### Step 6: Frontend - Insights UI
1. InsightList and InsightCard components
2. InsightEditor with entity linking
3. Insights page
4. QuickInsightCapture floating action
5. Insight indicators in task view

### Step 7: Export
1. ExportButton component
2. Wire up to export endpoint
3. Download as .json file

---

## Out of Scope for MVP

These features are documented in `ux-research-tool-spec.md` for future implementation:

- [ ] Artifacts/file uploads (use links for now)
- [ ] Tags system
- [ ] Affinity mapping board
- [ ] AI-assisted insight extraction
- [ ] AI-assisted persona generation
- [ ] Pattern detection
- [ ] Pain Points as separate entity (captured as insight type)
- [ ] Visual journey maps
- [ ] Workflow diagrams
- [ ] Git auto-export on save
- [ ] Search across entities
- [ ] Dashboard/metrics

---

## Success Criteria

MVP is complete when you can:

1. ✅ Create a project
2. ✅ Add personas with goals/frustrations
3. ✅ Create research sessions with notes
4. ✅ Build activity → task → operation hierarchy (existing)
5. ✅ Link personas to activities
6. ✅ Capture insights and link them to any entity
7. ✅ Export full project as structured JSON
8. ✅ Data persists in SQLite (survives restart)
