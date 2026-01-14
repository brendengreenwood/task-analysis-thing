# AI Research Assistant — Feature Specification

## Overview

A conversational AI assistant that helps researchers create, analyze, and query their research data. Instead of clicking through forms, you talk to the assistant and it structures your input into personas, sessions, insights, workflows, and more.

The assistant lives inside the app and has full context of your project data. It can create, update, and query entities on your behalf — with your approval before committing changes.

---

## Core Principle

**Talk, don't click.**

After an interview, you shouldn't have to manually create a session, type up notes, create 12 separate insight cards, link them to entities, update the persona. You should be able to dump your brain and let the AI structure it.

---

## Modes of Operation

### 1. Session Debrief Mode

**Trigger:** "I just finished an interview" / "Let me debrief" / "New session"

**What it does:**
- Creates a new session (or links to existing)
- Listens to your brain dump
- Extracts insights, quotes, pain points as you talk
- Suggests persona match or creates new one
- Links insights to existing activities/tasks if relevant

**Example conversation:**

```
You: Just got off a call with a sales manager named Sarah. She's been at 
     the company 10 years, manages a team of 8.

Agent: Got it. I'll create an interview session for today. Does Sarah match 
       your existing "Sales Manager" persona, or is this a new persona type?

You: Same persona. She's frustrated that forecasting takes forever. Every 
     Friday her team spends like 2 hours pulling numbers from 3 different 
     reports and combining them in Excel.

Agent: I'm capturing:
       
       📋 Session: Interview with Sarah (Sales Manager), Jan 11 2025
       
       🔴 Pain Point (high): "Weekly forecasting takes 2+ hours"
          → Links to: [Activity: Weekly Forecasting] — want me to create this?
       
       🔴 Pain Point (medium): "Data spread across 3 different reports"
       
       👁 Observation: "Team of 8, 10 years tenure"
          → Added to Sales Manager persona context
       
       Should I create the "Weekly Forecasting" activity and map out the 
       workflow based on what Sarah described?

You: Yeah, let's map that out.

Agent: Tell me the steps they go through for forecasting.

You: First they export from Salesforce, then they pull a report from their 
     BI tool, then they have to get some numbers from finance in email, 
     then they compile everything in Excel, then they present to leadership.

Agent: Here's the workflow I'm building:
       
       Activity: Weekly Forecasting
       ├── Task: Gather data
       │   ├── Op: Export pipeline from Salesforce
       │   ├── Op: Pull report from BI tool
       │   └── Op: Request numbers from Finance (email)
       ├── Task: Compile forecast
       │   └── Op: Combine data in Excel
       └── Task: Present to leadership
       
       Want me to save this? I'll link the pain points about time and 
       fragmented data to the relevant operations.
```

---

### 2. Workflow Builder Mode

**Trigger:** "Help me map out..." / "Build a workflow for..." / "How do they do X?"

**What it does:**
- Guides you through activity → task → operation hierarchy
- Asks clarifying questions
- Suggests structure based on your description
- Links to personas who perform this work

**Example conversation:**

```
You: Help me map out how account executives prepare for client calls.

Agent: I'll build this out. Let me ask a few questions:
       
       1. How often do they do this? (daily/weekly/etc)
       2. Is this the "Senior Sales Rep" persona, or someone else?

You: Daily, multiple times. Yeah it's the senior sales rep.

Agent: Got it. Walk me through what they actually do to prepare.

You: They look up the account in Salesforce, check recent emails in Outlook, 
     look at any open opportunities, maybe check LinkedIn for news about the 
     contact, and sometimes ask teammates in Slack if anyone talked to them 
     recently.

Agent: Here's what I'm capturing:
       
       Activity: Prepare for client call
       Frequency: Daily | Importance: [you tell me] | Persona: Senior Sales Rep
       
       ├── Task: Research account
       │   ├── Op: Review account in Salesforce
       │   ├── Op: Check recent emails (Outlook)
       │   ├── Op: Review open opportunities
       │   └── Op: Check LinkedIn for news
       └── Task: Get team context
           └── Op: Ask teammates in Slack
       
       Tools involved: Salesforce, Outlook, LinkedIn, Slack
       
       Anything missing? How important is this activity to them?

You: Critical. Add that sometimes they also check the shared drive for 
     past proposals.

Agent: Added:
       ├── Task: Research account
       │   └── Op: Check shared drive for past proposals (new)
       
       Importance set to: Critical
       
       Ready to save?
```

---

### 3. Research Q&A Mode

**Trigger:** "What do we know about..." / "Show me..." / "Find insights about..."

**What it does:**
- Queries your research data
- Synthesizes findings across sessions, personas, insights
- Cites sources (which session, which persona)

**Example conversation:**

```
You: What do we know about why sales reps hate the CRM?

Agent: Based on 4 sessions across 2 personas, here's what I found:
       
       Top pain points:
       1. "Data entry is duplicate work" (3 mentions, high severity)
          → Senior Sales Rep, Sales Manager
          → Sessions: P1 Interview, P3 Observation
       
       2. "Fields don't match how they think about deals" (2 mentions)
          → Senior Sales Rep
          → Related belief mismatch in mental model
       
       3. "Mobile app is unusable in the field" (1 mention, critical)
          → Senior Sales Rep (P2)
       
       Key quotes:
       • "I spend more time feeding the CRM than it ever gives back to me"
       • "Why do I have to enter the company name when it's already in the email?"
       
       The friction concentrates in two activities:
       • "Update CRM after meeting" (highest pain score)
       • "Log call notes"
       
       Want me to dig deeper on any of these?
```

---

### 4. Insight Extraction Mode

**Trigger:** "Analyze this transcript" / "Pull insights from..." / paste a block of text

**What it does:**
- Processes transcript or notes
- Identifies quotes, observations, pain points, patterns
- Suggests entity links
- Batch creates insights with your approval

**Example conversation:**

```
You: Analyze this transcript from my interview today:
     [pastes 2000 words of transcript]

Agent: I found 8 potential insights in this transcript:
       
       💬 Quotes (3):
       • "I have 4 tabs open just to know who I'm talking to" (timestamp 12:34)
       • "Friday forecasting is my least favorite part of the week" (23:45)
       • "We basically have our own shadow system in Excel" (34:12)
       
       🔴 Pain Points (3):
       • Context switching between tools for call prep (high)
       • Forecasting time sink (high)
       • Official system doesn't match actual workflow (medium)
       
       👁 Observations (2):
       • Uses personal Excel tracker alongside CRM
       • Team has informal Slack channel for deal tips
       
       Suggested links:
       • "4 tabs open" → Activity: Prepare for client call
       • "Forecasting" → Activity: Weekly forecasting
       • "Shadow system" → New pattern: Workaround documentation
       
       Create all 8 insights? I can also mark which session this came from.
```

---

### 5. Persona Builder Mode

**Trigger:** "Create a persona based on..." / "New persona from my research"

**What it does:**
- Synthesizes persona from session data
- Pulls goals, frustrations, tools from insights
- Suggests representative quotes
- Links to activities they perform

**Example conversation:**

```
You: Build me a persona from the 3 sales rep interviews I've done.

Agent: Based on sessions with P1, P2, and P3, here's a synthesized persona:
       
       ─────────────────────────────────────────
       SENIOR SALES REP
       Role: Account Executive
       ─────────────────────────────────────────
       
       About:
       Experienced sales professional managing enterprise accounts. 
       Spends 60% of time in meetings or preparing for them. Values 
       relationships over process.
       
       Goals:
       • Close deals faster (all 3 mentioned)
       • Reduce admin overhead (P1, P3)
       • Never be caught off-guard on client calls (P2, P3)
       
       Frustrations:
       • Too many disconnected tools (all 3)
       • CRM doesn't match how they work (P1, P2)
       • Manual data entry (all 3)
       
       Tools: Salesforce, Outlook, Excel, LinkedIn, Slack
       
       Quote: "I spend more time feeding the CRM than it ever gives back"
       
       Activities: Prepare for client call, Update CRM after meeting, 
                   Weekly forecasting (linked)
       
       Research basis: 3 sessions, 12 insights
       ─────────────────────────────────────────
       
       Save this persona? I can also show you where each data point came from.
```

---

## Approval Flow

**Never auto-commit.** The assistant always shows what it will create/update and asks for confirmation.

```
Agent: I'm about to create:
       • 1 session
       • 1 persona (updated)
       • 5 insights
       • 1 activity with 3 tasks and 7 operations
       
       [Preview] [Save All] [Edit First] [Cancel]
```

Clicking **Preview** expands to show each entity. User can toggle individual items on/off before saving.

---

## UI Integration

### Chat Panel

- Slide-out panel from right side (like the existing task builder)
- Persistent across views (doesn't close when you navigate)
- Can be minimized
- Shows conversation history within project

### Contextual Awareness

The assistant knows:
- Which project you're in
- What view you're on (personas, sessions, task analysis, etc.)
- Selected entities (if you have a persona open, it knows)

**Example:**
```
[User is viewing Persona: Senior Sales Rep]

You: Add a frustration about mobile access.

Agent: Added to Senior Sales Rep:
       Frustration: "Mobile access is limited"
       
       Want to elaborate on this? I can create a pain point insight 
       and link it to a specific workflow if relevant.
```

### Quick Actions

Suggested prompts based on context:

| Context | Suggested Prompts |
|---------|-------------------|
| Empty project | "Start with an interview debrief" / "Describe your users" |
| Persona view | "Update this persona" / "What sessions inform this?" |
| Session view | "Extract insights from notes" / "Summarize this session" |
| Task analysis | "Map a new workflow" / "Where are the pain points?" |
| Dashboard | "Summarize this project" / "What are the top findings?" |

---

## Technical Implementation

### Mastra Agent Setup

Extend the existing task builder pattern:

```typescript
// agents/researchAssistant.ts

const researchAssistant = new Agent({
  name: 'research-assistant',
  model: 'claude-sonnet-4-20250514',
  instructions: `
    You are a UX research assistant. You help researchers capture, 
    structure, and analyze user research data.
    
    You have access to the following tools:
    - createSession
    - updateSession
    - createPersona
    - updatePersona
    - createInsight
    - createActivity
    - createTask
    - createOperation
    - linkPersonaToActivity
    - linkInsightToEntity
    - queryInsights
    - queryPersonas
    - querySessions
    - queryWorkflows
    
    Always show the user what you're about to create before saving.
    Format your responses clearly with entity types indicated.
    Ask clarifying questions when the input is ambiguous.
  `,
  tools: [
    createSessionTool,
    updateSessionTool,
    createPersonaTool,
    // ... etc
  ]
});
```

### Tools (Mastra Functions)

Each entity gets CRUD tools:

```typescript
const createInsightTool = createTool({
  id: 'create-insight',
  description: 'Create a new insight from research',
  inputSchema: z.object({
    content: z.string(),
    type: z.enum(['observation', 'pattern', 'quote', 'pain_point']),
    severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    sessionId: z.string().optional(),
    linkedEntityType: z.enum(['persona', 'activity', 'task', 'operation']).optional(),
    linkedEntityId: z.string().optional(),
  }),
  execute: async ({ context, input }) => {
    // Create insight via API
    // Return created insight for confirmation
  }
});
```

### Batch Operations

For session debriefs that create many entities:

```typescript
const batchCreateTool = createTool({
  id: 'batch-create',
  description: 'Create multiple entities at once (for user approval)',
  inputSchema: z.object({
    entities: z.array(z.object({
      type: z.enum(['session', 'persona', 'insight', 'activity', 'task', 'operation']),
      data: z.any(),
      links: z.array(z.object({
        targetType: z.string(),
        targetId: z.string().optional(), // optional if creating new
        relationship: z.string()
      })).optional()
    }))
  }),
  execute: async ({ context, input }) => {
    // Return preview, don't save yet
    // Wait for user confirmation
  }
});
```

### Context Injection

Pass current view context to the agent:

```typescript
const getAssistantContext = (state: AppState) => ({
  currentProject: state.project,
  currentView: state.route, // 'personas', 'sessions', 'tasks', etc.
  selectedEntity: state.selectedEntity,
  recentEntities: state.recentlyViewed,
  projectStats: {
    personaCount: state.personas.length,
    sessionCount: state.sessions.length,
    insightCount: state.insights.length,
    activityCount: state.activities.length,
  }
});

// Inject into agent call
const response = await researchAssistant.generate({
  messages: conversationHistory,
  context: getAssistantContext(appState)
});
```

---

## Implementation Phases

### Phase 1: Foundation
- [ ] Chat panel UI (slide-out, persistent)
- [ ] Basic conversation with Mastra
- [ ] Context injection (current project, view)
- [ ] Single entity creation with approval

### Phase 2: Session Debrief
- [ ] Create session from conversation
- [ ] Extract insights from brain dump
- [ ] Link to existing personas
- [ ] Batch creation with preview

### Phase 3: Workflow Builder
- [ ] Build activity/task/operation from description
- [ ] Suggest structure
- [ ] Link personas to activities
- [ ] Add tools used

### Phase 4: Research Q&A
- [ ] Query insights by topic
- [ ] Synthesize across sessions
- [ ] Cite sources
- [ ] Find patterns

### Phase 5: Advanced
- [ ] Transcript analysis (paste + extract)
- [ ] Persona synthesis from multiple sessions
- [ ] Suggest connections ("this sounds like what P2 said")
- [ ] Proactive suggestions ("you haven't captured pain points for this activity")

---

## Open Questions

1. **Conversation persistence** — Save chat history per project? Or ephemeral?
2. **Multi-turn memory** — How much context to keep in long conversations?
3. **Undo** — If user approves batch create then regrets, how to undo?
4. **Confidence indicators** — Should agent show confidence in extractions?
5. **Voice input** — Future: talk instead of type?

---

## Success Metrics

The assistant is working when:
- Time to log a session drops from 15 min to 3 min
- Insights extracted per session increases (less gets lost)
- Users actually query their research ("what do we know about X")
- Research is structured enough to export useful agent context
