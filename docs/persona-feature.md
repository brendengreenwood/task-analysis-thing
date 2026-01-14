# Persona Feature — Detailed Specification

## Overview

Personas are more than a name and bullet points. They're a hub that connects all research about a user type — their workflows, pain points, mental models, and the sessions where you learned about them.

When you click into a persona, you should see everything you know about this user in one place.

---

## Persona Data Model (Enhanced)

```typescript
interface Persona {
  id: string;
  projectId: string;
  
  // Basic info
  name: string;                    // "Senior Sales Rep"
  role: string;                    // "Account Executive"
  description: string;             // Background, context
  quote: string;                   // Representative voice
  avatarUrl?: string;              // Optional photo/illustration
  
  // Characteristics
  goals: string[];                 // What they're trying to achieve
  frustrations: string[];          // General pain points
  tools: string[];                 // Software/tools they use daily
  skills: string[];                // Relevant competencies
  environment: string;             // Where/how they work (office, remote, field)
  
  // Context
  experienceLevel: 'novice' | 'intermediate' | 'expert' | 'mixed';
  frequency: 'daily' | 'weekly' | 'occasional';  // How often they do core activities
  influence: 'end_user' | 'influencer' | 'decision_maker' | 'champion';
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

### Computed/Linked Data (not stored, derived from relationships)

| Data | Source | Description |
|------|--------|-------------|
| Activities | persona_activities junction | Workflows this persona performs |
| Sessions | sessions.personaId | Research sessions featuring this persona |
| Insights | insights.linkedEntityId where type='persona' | Insights directly about this persona |
| All related insights | Insights linked to their activities/tasks/ops | Everything affecting their workflows |
| Pain points | Insights with type='pain_point' in their workflows | Aggregated pain across their work |
| Mental model | mental_models.personaId | How they think (Phase 3) |

---

## UI: Persona Detail View

### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ← Back to Personas                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐                                                               │
│  │          │  Senior Sales Rep                                             │
│  │  Avatar  │  Account Executive                                            │
│  │          │                                                               │
│  └──────────┘  "I just need to know what happened last time before I call"  │
│                                                                             │
│  ┌─────────┬───────────┬──────────┬────────────┬───────────────┐           │
│  │Overview │ Workflows │ Research │ Insights   │ Mental Model  │           │
│  └─────────┴───────────┴──────────┴────────────┴───────────────┘           │
│                                                                             │
│  [ Tab Content Below ]                                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Tab: Overview

The summary view — who is this person?

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌─ About ──────────────────────────────────────────────────────────────┐  │
│  │ Experienced sales professional responsible for managing enterprise    │  │
│  │ accounts. Spends 60% of time in meetings or preparing for them.      │  │
│  │ Primary focus is closing deals, but drowning in admin work.          │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─ Goals ─────────────────────┐  ┌─ Frustrations ─────────────────────┐  │
│  │ • Close deals faster        │  │ • Too many tools to juggle         │  │
│  │ • Reduce admin overhead     │  │ • Manual data entry everywhere     │  │
│  │ • Never be surprised on     │  │ • Can't find info when needed      │  │
│  │   a client call             │  │ • CRM doesn't match how I think    │  │
│  └─────────────────────────────┘  └─────────────────────────────────────┘  │
│                                                                             │
│  ┌─ Tools ─────────────────────┐  ┌─ Context ──────────────────────────┐  │
│  │ Salesforce  Outlook  Excel  │  │ Experience: Expert                 │  │
│  │ Slack  Zoom  LinkedIn       │  │ Frequency: Daily user              │  │
│  │                             │  │ Influence: End user + Champion     │  │
│  └─────────────────────────────┘  │ Environment: Hybrid (office/home)  │  │
│                                   └─────────────────────────────────────┘  │
│                                                                             │
│  ┌─ Quick Stats ───────────────────────────────────────────────────────┐  │
│  │                                                                      │  │
│  │   4 Activities    12 Insights    3 Sessions    8 Pain Points        │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Tab: Workflows

Activities this persona performs, with pain indicators.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Activities performed by Senior Sales Rep                   [+ Link Activity]│
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ 🔴 Prepare for client call                                            │ │
│  │ Daily · Critical importance                                           │ │
│  │                                                                        │ │
│  │ 5 pain points · 8 insights                         [View Full →]      │ │
│  │ ████████████░░░░ High friction                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ 🟡 Update CRM after meeting                                           │ │
│  │ Daily · High importance                                               │ │
│  │                                                                        │ │
│  │ 3 pain points · 4 insights                         [View Full →]      │ │
│  │ ████████░░░░░░░░ Medium friction                                      │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ 🟢 Review weekly pipeline                                             │ │
│  │ Weekly · Medium importance                                            │ │
│  │                                                                        │ │
│  │ 1 pain point · 2 insights                          [View Full →]      │ │
│  │ ███░░░░░░░░░░░░░ Low friction                                         │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ───────────────────────────────────────────────────────────────────────── │
│  Pain Summary: This persona's biggest friction is in call preparation.     │
│  Consider: Aggregating client context into a single pre-call view.         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Tab: Research

Sessions where this persona was the participant/subject.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Research sessions with Senior Sales Rep                                    │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ Interview · Jan 8, 2025                                               │ │
│  │ Participant: P1 (Sarah)                                               │ │
│  │ Duration: 45 min                                                      │ │
│  │                                                                        │ │
│  │ "Spent first 15 min discussing call prep frustrations.                │ │
│  │  Key quote: 'I have 4 tabs open just to know who I'm talking to'"     │ │
│  │                                                                        │ │
│  │ 6 insights extracted                                [View Session →]  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ Observation · Jan 5, 2025                                             │ │
│  │ Participant: P2 (Mike)                                                │ │
│  │ Duration: 60 min                                                      │ │
│  │                                                                        │ │
│  │ "Shadowed pre-call routine. Watched him switch between 6 apps."       │ │
│  │                                                                        │ │
│  │ 4 insights extracted                                [View Session →]  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ Usability Test · Dec 20, 2024                                         │ │
│  │ Participant: P3 (Jordan)                                              │ │
│  │ Duration: 30 min                                                      │ │
│  │                                                                        │ │
│  │ "Tested new dashboard prototype. Mixed results."                      │ │
│  │                                                                        │ │
│  │ 2 insights extracted                                [View Session →]  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  No participant linked?                                                     │
│  [+ Add Session for this Persona]                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Tab: Insights

All insights related to this persona (direct + via their workflows).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  [All] [Observations] [Patterns] [Quotes] [Pain Points]      [+ Add Insight]│
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ 🔴 Pain Point · Critical                                              │ │
│  │                                                                        │ │
│  │ "Copy-pasting between 4+ systems for every client call"               │ │
│  │                                                                        │ │
│  │ Linked to: Prepare for client call > Gather context                   │ │
│  │ Source: 3 sessions                                                    │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ 💬 Quote                                                              │ │
│  │                                                                        │ │
│  │ "I have 4 tabs open just to know who I'm talking to"                  │ │
│  │                                                                        │ │
│  │ Linked to: Senior Sales Rep (persona)                                 │ │
│  │ Source: Interview Jan 8                                               │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ 🔵 Pattern                                                            │ │
│  │                                                                        │ │
│  │ "All observed reps have personal workaround docs/sheets"              │ │
│  │                                                                        │ │
│  │ Linked to: Senior Sales Rep (persona)                                 │ │
│  │ Source: 2 sessions                                                    │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ 👁 Observation                                                        │ │
│  │                                                                        │ │
│  │ "Keeps sticky notes on monitor with client nicknames"                 │ │
│  │                                                                        │ │
│  │ Linked to: Prepare for client call                                    │ │
│  │ Source: Observation Jan 5                                             │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Tab: Mental Model (Phase 3)

Shows this persona's mental model if one exists, or prompts to create one.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │  No mental model yet for Senior Sales Rep                             │ │
│  │                                                                        │ │
│  │  Mental models capture how this persona thinks about their work —     │ │
│  │  the concepts they use, how they relate, and what they believe.       │ │
│  │                                                                        │ │
│  │                    [+ Create Mental Model]                            │ │
│  │                                                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ─── OR if one exists: ─────────────────────────────────────────────────── │
│                                                                             │
│  ┌─ How Sales Reps Think About Customers ───────────────────────────────┐ │
│  │                                                                        │ │
│  │   [Embedded mini concept map preview]                                 │ │
│  │                                                                        │ │
│  │   4 concepts · 5 relationships · 3 belief mismatches                  │ │
│  │                                                                        │ │
│  │                              [Open Full View →]                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Schema Updates

Add new fields to personas table:

```typescript
export const personas = sqliteTable('personas', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  
  // Basic (existing)
  name: text('name').notNull(),
  role: text('role'),
  description: text('description'),
  goals: text('goals', { mode: 'json' }).$type<string[]>().default([]),
  frustrations: text('frustrations', { mode: 'json' }).$type<string[]>().default([]),
  tools: text('tools', { mode: 'json' }).$type<string[]>().default([]),
  quote: text('quote'),
  
  // New fields
  avatarUrl: text('avatar_url'),
  skills: text('skills', { mode: 'json' }).$type<string[]>().default([]),
  environment: text('environment'), // free text: "Hybrid office/home", "Field work", etc.
  experienceLevel: text('experience_level', { enum: ['novice', 'intermediate', 'expert', 'mixed'] }),
  usageFrequency: text('usage_frequency', { enum: ['daily', 'weekly', 'occasional'] }),
  influence: text('influence', { enum: ['end_user', 'influencer', 'decision_maker', 'champion'] }),
  
  // Timestamps
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});
```

---

## Implementation Notes

### API Endpoints

Add to existing persona routes:

```
GET /api/personas/:id/full
  Returns persona + computed data:
  - activities (via junction)
  - sessions (where personaId matches)
  - insights (direct + via activities)
  - pain point summary
  - mental model (if exists)
```

### Pain Calculation

Aggregate pain for a persona:
1. Get all activities linked to persona
2. Get all insights with type='pain_point' linked to those activities (or their tasks/operations)
3. Count by severity
4. Calculate friction score: `(critical * 4) + (high * 3) + (medium * 2) + (low * 1)`

### Component Structure

```
components/personas/
├── PersonaGrid.tsx          # Card grid (existing)
├── PersonaCard.tsx          # Summary card (existing)
├── PersonaEditor.tsx        # Create/edit modal (existing, extend)
├── PersonaDetail.tsx        # Full detail page (NEW)
├── PersonaOverview.tsx      # Overview tab content
├── PersonaWorkflows.tsx     # Workflows tab content
├── PersonaResearch.tsx      # Research tab content
├── PersonaInsights.tsx      # Insights tab content
├── PersonaMentalModel.tsx   # Mental model tab content
└── WorkflowPainCard.tsx     # Activity card with pain indicator
```

---

## Agent Context Export

Enhanced persona export:

```json
{
  "personas": [
    {
      "id": "persona-1",
      "name": "Senior Sales Rep",
      "role": "Account Executive",
      "description": "Experienced sales professional...",
      "quote": "I just need to know what happened last time before I call",
      
      "goals": ["Close deals faster", "Reduce admin overhead"],
      "frustrations": ["Too many tools", "Manual data entry"],
      "tools": ["Salesforce", "Outlook", "Excel"],
      "skills": ["Negotiation", "Relationship building"],
      
      "context": {
        "experienceLevel": "expert",
        "usageFrequency": "daily",
        "influence": "end_user",
        "environment": "Hybrid office/home"
      },
      
      "activities": ["activity-1", "activity-2", "activity-3"],
      
      "painSummary": {
        "critical": 2,
        "high": 3,
        "medium": 2,
        "low": 1,
        "frictionScore": 21,
        "topPainPoint": "Copy-pasting between systems for call prep"
      },
      
      "researchBasis": {
        "sessionCount": 3,
        "insightCount": 12,
        "lastSessionDate": "2025-01-08"
      }
    }
  ]
}
```

This gives agents rich context about who the user is, what they struggle with, and how confident we are in that knowledge (based on research volume).
