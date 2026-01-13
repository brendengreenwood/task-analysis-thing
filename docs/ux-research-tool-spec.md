# UX Research Tool — Product Specification

## Overview

A comprehensive UX research platform for product designers building enterprise tools. The tool serves two primary purposes:

1. **Human Research Ops** — Intake, analyze, and share user research findings with cross-functional teams
2. **Agent Context System** — Maintain structured user context that can power AI agents in enterprise applications

### Strategic Value

This tool exists at the intersection of traditional UX research and AI-native product development. Most research tools output static deliverables (personas PDFs, journey map posters). This one outputs **structured context that makes AI agents actually useful**.

The workflow:
1. Do rigorous user research (interviews, observations, task analysis)
2. Build a rich model of how users work and think
3. Export that model as structured data for AI agents
4. Agents can now understand user context, goals, and workflows

This positions the designer as the bridge between user understanding and AI capability — a role that's becoming critical as products add agentic features.

### Two-Phase Usage Model

| Phase 1: Discovery | Phase 2: Product Research |
|---|---|
| Understanding how people work today | Evaluating how the product serves them |
| Mental models, workflows, goals, constraints | Usability issues, friction points, feature gaps |
| Foundational context for agent design | Continuous feedback loop for iteration |

The data model supports both phases; UI for phase-switching is deferred.

---

## Current State (task-analyzer v1.0)

### Tech Stack
- **Frontend:** React 18, Vite, Zustand, Tailwind CSS, dnd-kit, Framer Motion
- **Backend:** Hono + Mastra (AI orchestration)
- **Data:** Zustand (likely localStorage persistence)
- **Monorepo:** pnpm workspaces (`@task-analyzer/web`, `@task-analyzer/server`)

### Existing Data Model
```
Project
  └── Activity (high-level goal)
        └── Task (specific step to achieve goal)
              └── Operation (smallest action within task)
```

Each level has: name, description/details, and hierarchical nesting.

### What Works Well
- Clean Activity → Task → Operation hierarchy (classic HTA)
- Drag-and-drop reordering
- Mastra agent integration for chat-assisted task building
- Visual nesting with color-coded levels

---

## Expanded Data Model

### Core Entities

```
┌─────────────────────────────────────────────────────────────────┐
│                         PROJECT                                  │
│  id, name, description, phase (discovery|product), createdAt    │
└─────────────────────────────────────────────────────────────────┘
          │
          ├──────────────────────────────────────┐
          │                                      │
          ▼                                      ▼
┌─────────────────────┐              ┌─────────────────────┐
│      PERSONA        │              │  RESEARCH SESSION   │
│  id, name, role,    │              │  id, type, date,    │
│  description,       │              │  participant,       │
│  goals, frustrations│              │  notes, recordingUrl│
└─────────────────────┘              └─────────────────────┘
          │                                      │
          │                                      │
          ▼                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                         ACTIVITY                                 │
│  id, name, overview, personaIds[], frequency, importance        │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                           TASK                                   │
│  id, name, goal, activityId, order                              │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                        OPERATION                                 │
│  id, name, details, taskId, order, toolsUsed[], painPoints[]    │
└─────────────────────────────────────────────────────────────────┘
```

### Supporting Entities

```
┌─────────────────────────────────────────────────────────────────┐
│                         INSIGHT                                  │
│  id, content, type (observation|pattern|quote), severity,       │
│  sessionId, linkedEntityType, linkedEntityId, tags[]            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       PAIN POINT                                 │
│  id, description, severity (low|medium|high|critical),          │
│  frequency, linkedEntityType, linkedEntityId, insightIds[]      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        ARTIFACT                                  │
│  id, type (screenshot|recording|document|diagram), url,         │
│  caption, sessionId, linkedEntityType, linkedEntityId           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                           TAG                                    │
│  id, name, color, category (theme|feature|emotion|custom)       │
└─────────────────────────────────────────────────────────────────┘
```

### Entity Relationships

| Relationship | Type | Description |
|--------------|------|-------------|
| Project → Personas | 1:many | A project has multiple user personas |
| Project → Sessions | 1:many | Research sessions belong to a project |
| Project → Activities | 1:many | Activities scoped to project |
| Persona → Activities | many:many | Which personas perform which activities |
| Session → Insights | 1:many | Insights extracted from sessions |
| Insight → Any Entity | polymorphic | Insights can link to Activity, Task, Operation, or Persona |
| Pain Point → Any Entity | polymorphic | Pain points can attach to any workflow entity |
| Artifact → Session | many:1 | Artifacts captured during a session |
| Artifact → Any Entity | polymorphic | Artifacts can also link to specific workflow entities |

---

## Feature Modules

### Module 1: Research Sessions (Intake Layer)

**Purpose:** Capture and organize raw research data from various sources.

**Session Types:**
- User Interview
- Contextual Inquiry / Observation
- Usability Test
- Survey Response
- Analytics Review
- Diary Study Entry

**Features:**
- Create session with metadata (date, participant, type, duration)
- Rich text notes with inline tagging
- Attach artifacts (upload files, paste screenshots, link recordings)
- Link session to existing personas or create new ones
- AI-assisted note cleanup and summarization
- Extract insights from session notes (AI-assisted)

**UI Considerations:**
- Session list view with filters (by type, date, participant, persona)
- Session detail view with split pane: notes on left, linked insights/artifacts on right
- Quick-add floating button for capturing insights while reviewing

---

### Module 2: Personas

**Purpose:** Document distinct user types and their characteristics.

**Fields:**
- Name (can be anonymized role-based: "Senior Analyst")
- Role / Job Title
- Description (background, context)
- Goals (what they're trying to achieve)
- Frustrations (general pain points)
- Tools they use
- Quote (representative voice)
- Photo/Avatar (optional)

**Features:**
- Create/edit persona cards
- Link personas to activities they perform
- View all insights and pain points associated with a persona
- AI-assisted persona generation from session notes

**UI Considerations:**
- Card-based grid view
- Detail view with linked activities and aggregated insights
- "Generate from sessions" button that analyzes session notes

---

### Module 3: Task Analysis (Enhanced — Existing Core)

**Purpose:** Document hierarchical breakdown of user work.

**Enhancements to Existing:**
- Add `personaIds[]` to Activity (who performs this)
- Add `frequency` and `importance` to Activity
- Add `toolsUsed[]` to Operation
- Add `painPoints[]` reference to Operation
- Add `insights[]` reference to any level
- Add `artifacts[]` reference to any level

**New Features:**
- Inline pain point capture at any level
- Inline insight linking
- View mode: show/hide pain points overlay
- View mode: show/hide linked insights
- Export as structured JSON for agent context

**UI Considerations:**
- Keep existing nested card UI
- Add subtle indicators for linked pain points (red dot), insights (yellow dot)
- Expand/collapse to show linked items inline
- Right-click context menu for quick linking

---

### Module 4: Insights & Pain Points (Analysis Layer)

**Purpose:** Surface patterns and problems across research.

**Insight Types:**
- Observation (single data point)
- Pattern (recurring theme across sessions)
- Quote (verbatim user statement)
- Hypothesis (interpretation to validate)

**Pain Point Severity:**
- Low (annoyance)
- Medium (friction, workaround needed)
- High (significant time/effort waste)
- Critical (blocker, failure)

**Features:**
- Insight/pain point list with filters
- Bulk tagging
- Affinity mapping view (drag insights into groups)
- Pattern detection (AI-assisted: "These 5 insights seem related")
- Link insights to workflow entities
- Merge duplicate insights

**UI Considerations:**
- Kanban-style board for affinity mapping
- List view with inline entity links
- "Unlinked insights" filter to surface orphans

---

### Module 5: Outputs & Sharing

**Purpose:** Generate deliverables for different audiences.

**Output Types:**

| Output | Audience | Format |
|--------|----------|--------|
| User Journey Map | Design, Product | Visual diagram |
| Workflow Diagram | Engineering | Flowchart/sequence |
| Persona Cards | All stakeholders | PDF/PNG cards |
| Research Summary | Leadership | Slide deck / doc |
| Agent Context Export | Engineering | JSON schema |
| Pain Point Report | Product | Prioritized list |

**Agent Context Export (Critical Feature):**
```json
{
  "project": { "name": "...", "phase": "discovery" },
  "personas": [
    {
      "id": "...",
      "name": "Senior Analyst",
      "goals": ["..."],
      "activities": ["activity-1", "activity-2"]
    }
  ],
  "workflows": [
    {
      "activityId": "activity-1",
      "name": "Generate Monthly Report",
      "tasks": [
        {
          "taskId": "task-1",
          "name": "Gather data from sources",
          "operations": [
            {
              "operationId": "op-1",
              "name": "Export from System A",
              "tools": ["System A", "Excel"],
              "painPoints": ["Manual copy-paste prone to errors"]
            }
          ]
        }
      ]
    }
  ],
  "painPoints": [...],
  "insights": [...]
}
```

**Features:**
- Template-based export
- Select which entities to include
- Version exports (track what was shared when)
- Direct integration with Mastra for agent context injection

---

## Architecture

### Frontend Structure

```
apps/web/src/
├── components/
│   ├── ui/                    # Shared UI primitives
│   ├── layout/                # App shell, navigation
│   ├── projects/              # Project list, project header
│   ├── sessions/              # Session list, session editor
│   ├── personas/              # Persona cards, persona editor
│   ├── tasks/                 # Existing task analysis components
│   ├── insights/              # Insight cards, affinity board
│   └── outputs/               # Export wizards, preview components
├── stores/
│   ├── projectStore.ts
│   ├── sessionStore.ts
│   ├── personaStore.ts
│   ├── taskStore.ts           # Existing, enhanced
│   ├── insightStore.ts
│   └── artifactStore.ts
├── pages/
│   ├── ProjectList.tsx
│   ├── ProjectDashboard.tsx
│   ├── Sessions.tsx
│   ├── Personas.tsx
│   ├── Tasks.tsx              # Existing
│   ├── Insights.tsx
│   └── Outputs.tsx
├── hooks/
│   ├── useAIAssist.ts         # Mastra integration hooks
│   └── useExport.ts
└── lib/
    ├── types.ts               # TypeScript interfaces
    ├── api.ts                 # Backend communication
    └── export.ts              # Export formatters
```

### Backend Structure

```
apps/server/src/
├── server.ts                  # Hono app setup
├── routes/
│   ├── projects.ts
│   ├── sessions.ts
│   ├── personas.ts
│   ├── tasks.ts
│   ├── insights.ts
│   └── exports.ts
├── agents/
│   ├── taskBuilder.ts         # Existing Mastra agent
│   ├── insightExtractor.ts    # Extract insights from notes
│   ├── patternDetector.ts     # Find patterns across insights
│   └── personaGenerator.ts    # Generate personas from sessions
└── lib/
    ├── db.ts                  # Database connection (NEW)
    └── exporters/
        ├── json.ts
        ├── journey.ts
        └── diagram.ts
```

### Database & Storage

**Primary Storage: SQLite + Drizzle ORM**
- Single file database, no server needed
- Drizzle has great TypeScript support
- Fast local queries with proper relationships
- Single user, local-first

**Version Control: Git-exportable JSON**
- Auto-export project data to JSON on save
- JSON files stored in a `data/` directory (or separate repo)
- Enables version history, backup, and portfolio showcase
- Human-readable format for debugging and sharing

**File Storage: Local filesystem**
- Artifacts (screenshots, recordings, docs) stored in `uploads/` directory
- Referenced by path in database
- Consider: `.gitignore` large media files, or use Git LFS if versioning needed

**Data Flow:**
```
User Action → SQLite (primary) → JSON export (versioned)
                ↓
         Fast queries/UI
```

**Future consideration:** If deploying or collaborating, can migrate SQLite → PostgreSQL with minimal code changes (Drizzle abstracts the connection).

---

## Implementation Phases

### 🎯 MVP (See MVP.md for detailed build spec)

| Feature | Status |
|---------|--------|
| SQLite + Drizzle database | To build |
| Migrate existing task data | To build |
| Personas CRUD + link to Activities | To build |
| Research Sessions CRUD | To build |
| Insights CRUD + entity linking | To build |
| JSON export for agent context | To build |

### Phase 2: Research Workflow Polish
- [ ] Artifact uploads (screenshots, recordings, docs)
- [ ] Tags system for insights
- [ ] Session-to-insight quick capture flow
- [ ] Insight indicators in task view (visual dots)
- [ ] "Unlinked insights" management view

### Phase 3: Analysis Features
- [ ] Pain Points as separate entity with severity/frequency
- [ ] Affinity mapping board (drag insights into groups)
- [ ] AI-assisted insight extraction from session notes
- [ ] Pattern detection across insights (Mastra agent)
- [ ] AI-assisted persona generation from sessions

### Phase 4: Outputs & Visualization
- [ ] User journey map visualization
- [ ] Workflow diagram export (for engineers)
- [ ] Persona cards PDF/PNG export
- [ ] Research summary generator
- [ ] Pain point priority report

### Phase 5: Integration & Automation
- [ ] Git auto-export on save (JSON versioning)
- [ ] Confluence/Notion export templates
- [ ] Search across all entities
- [ ] Project dashboard with health metrics
- [ ] API for external agent consumption

---

## UI/UX Principles

1. **Progressive disclosure** — Don't overwhelm. Show simple view first, reveal complexity on demand.
2. **Inline editing** — Minimize modal dialogs. Edit in place where possible.
3. **Visible relationships** — Always show how entities connect (breadcrumbs, link indicators).
4. **AI as assistant, not author** — AI suggests, human confirms. Never auto-commit AI outputs.
5. **Export-ready** — Any view should be exportable/shareable with minimal friction.

---

## Decisions Made

1. **Single-user** — No auth, permissions, or real-time sync needed. Keeps it simple.
2. **Local-first storage** — SQLite for data, local filesystem for artifacts.
3. **Git-exportable** — JSON exports for version control and portfolio purposes.
4. **Integrations deferred** — Standalone for now. Future: export to Confluence/Notion as "source of truth" docs for teams.

## Remaining Open Questions

1. **Artifact handling** — Git LFS for large files, or just `.gitignore` media and back up separately?
2. **Export format for team docs** — Markdown (universal), HTML, or target Confluence/Notion APIs directly?

---

## Appendix: TypeScript Types

```typescript
// Core Entities
interface Project {
  id: string;
  name: string;
  description?: string;
  phase: 'discovery' | 'product';
  createdAt: Date;
  updatedAt: Date;
}

interface Persona {
  id: string;
  projectId: string;
  name: string;
  role?: string;
  description?: string;
  goals: string[];
  frustrations: string[];
  tools: string[];
  quote?: string;
  avatarUrl?: string;
}

interface ResearchSession {
  id: string;
  projectId: string;
  type: 'interview' | 'observation' | 'usability_test' | 'survey' | 'analytics' | 'diary';
  date: Date;
  participantName?: string;
  personaId?: string;
  duration?: number; // minutes
  notes: string;
  recordingUrl?: string;
}

interface Activity {
  id: string;
  projectId: string;
  name: string;
  overview?: string;
  personaIds: string[];
  frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'rarely';
  importance?: 'low' | 'medium' | 'high' | 'critical';
  order: number;
}

interface Task {
  id: string;
  activityId: string;
  name: string;
  goal?: string;
  order: number;
}

interface Operation {
  id: string;
  taskId: string;
  name: string;
  details?: string;
  toolsUsed: string[];
  order: number;
}

// Supporting Entities
interface Insight {
  id: string;
  projectId: string;
  sessionId?: string;
  content: string;
  type: 'observation' | 'pattern' | 'quote' | 'hypothesis';
  tags: string[];
  linkedEntityType?: 'activity' | 'task' | 'operation' | 'persona';
  linkedEntityId?: string;
  createdAt: Date;
}

interface PainPoint {
  id: string;
  projectId: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  frequency?: 'rare' | 'occasional' | 'frequent' | 'constant';
  linkedEntityType: 'activity' | 'task' | 'operation';
  linkedEntityId: string;
  insightIds: string[];
}

interface Artifact {
  id: string;
  projectId: string;
  sessionId?: string;
  type: 'screenshot' | 'recording' | 'document' | 'diagram' | 'other';
  url: string;
  filename: string;
  caption?: string;
  linkedEntityType?: 'activity' | 'task' | 'operation' | 'session';
  linkedEntityId?: string;
  uploadedAt: Date;
}

interface Tag {
  id: string;
  projectId: string;
  name: string;
  color: string;
  category: 'theme' | 'feature' | 'emotion' | 'custom';
}
```

---

## Next Steps

1. Review this spec and flag any misalignments with your vision
2. Answer open questions (multi-user, storage, integrations)
3. Prioritize: What's the MVP vs nice-to-have?
4. Begin Phase 1 implementation with Claude Code
