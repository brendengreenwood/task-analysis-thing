# UX Research Tool — Consolidated Roadmap

> Single source of truth for what we're building and when.

---

## Document Index

| Doc | Purpose |
|-----|---------|
| `MVP.md` | Detailed build spec for initial release |
| `ux-research-tool-spec.md` | Full product spec with architecture |
| `problem-definition.md` | Problem framing for portfolio/case study |
| `mental-model-feature.md` | Feature spec for mental model module |
| `persona-feature.md` | Feature spec for persona detail view |
| `ai-assistant-feature.md` | Feature spec for AI research assistant |
| `data-model.mermaid` | Entity relationship diagram |

### Concept Files (React previews)
| File | Shows |
|------|-------|
| `data-model-diagram.jsx` | Visual entity relationship diagram |
| `stakeholder-dashboard-concept.jsx` | Project dashboard with pain maps |
| `mental-model-concept.jsx` | Concept canvas, beliefs, vocabulary views |
| `persona-detail-concept.jsx` | Persona detail page with tabs |

---

## Feature Status

### ✅ Completed
- [x] Task Analysis tool (activities → tasks → operations)
- [x] Mastra agent integration (chat-assisted task building)
- [x] Dark theme UI with drag-and-drop
- [x] Database setup (SQLite + Drizzle via libsql)
- [x] API endpoints for all entities
- [x] Frontend stores using API
- [x] Personas CRUD + detail view with tabs
- [x] Sessions CRUD + detail view (transcript upload, insight extraction)
- [x] Insights CRUD
- [x] JSON export
- [x] Project hierarchy (project as container)
- [x] Project dashboard with stats
- [x] Mental Models (canvas, beliefs, vocabulary)
- [x] Persona-centric navigation (all research rolls up under personas)
- [x] Inbox for unassigned research
- [x] Breadcrumb navigation system

### 📋 Backlog
Everything below, organized by phase.

---

## Roadmap

### MVP ✅ (Complete)
Core research tool functionality.

| Feature | Status |
|---------|--------|
| SQLite + Drizzle database | ✅ Done |
| Projects CRUD | ✅ Done |
| Personas CRUD + detail view | ✅ Done |
| Sessions CRUD + detail view | ✅ Done |
| Task Analysis | ✅ Done |
| Insights CRUD | ✅ Done |
| JSON Export | ✅ Done |
| Project hierarchy | ✅ Done |
| Project dashboard | ✅ Done |
| Transcript upload & insight extraction | ✅ Done |
| Mental Models | ✅ Done |
| Persona-centric navigation | ✅ Done |
| Inbox for unassigned research | ✅ Done |

---

### Phase 2: Project Dashboard & Visualization ✅ (Complete)
What you see when you open a project.

| Feature | Description | Concept File |
|---------|-------------|--------------|
| Project Dashboard | Landing page when opening a project | `stakeholder-dashboard-concept.jsx` |
| Stats overview | Sessions, insights, pain points, activities count | In dashboard concept |
| Workflow Pain Map | Activities/tasks with pain severity indicators | In dashboard concept |
| Persona summary cards | Quick view of all personas with linked activities | In dashboard concept |
| Top Pain Points | Ranked by severity + mention count | In dashboard concept |
| Entity Relationship View | Auto-generated diagram from live data | `data-model-diagram.jsx` |

---

### Phase 3: Mental Models ✅ (Complete)
Capture how users think, not just what they do.

| Feature | Description | Concept File |
|---------|-------------|--------------|
| Mental Model entity | Attach to project or specific persona | `mental-model-feature.md` |
| Concept Canvas | Visual map of concepts + relationships | `mental-model-concept.jsx` |
| Beliefs tracking | What users believe, with reality check | In concept |
| Mismatch severity | Flag dangerous belief/reality gaps | In concept |
| Vocabulary table | User language ↔ system language mapping | In concept |
| Gap Analysis view | Overlay mental model on task analysis | Spec only |
| Export in agent context | Include mental models in JSON export | Spec only |

---

### Phase 4: AI Research Assistant (Mastra)
The power feature — talk instead of click.

| Feature | Description | Spec |
|---------|-------------|------|
| Chat panel | Slide-out persistent chat interface | `ai-assistant-feature.md` |
| Session debrief mode | Brain dump after interview → structured entities | In spec |
| Workflow builder mode | Describe how users work → activity/task/operation | In spec |
| Research Q&A mode | "What do we know about X?" → synthesized answer with citations | In spec |
| Insight extraction | Paste transcript → suggested insights with entity links | In spec |
| Persona synthesis | Build persona from multiple sessions | In spec |
| Batch create with preview | Create many entities, approve before saving | In spec |
| Context awareness | Agent knows current view, selected entities | In spec |

---

### Phase 5: Polish & Extended Outputs

| Feature | Description |
|---------|-------------|
| **Inbox Enhancements** | |
| Inbox count badge | Sidebar shows "Inbox (3)" for unprocessed research |
| AI suggest assignment | "This session mentions forecasting — link to Sales Manager?" |
| Bulk assign | Select multiple insights/sessions, assign to same persona |
| Smart defaults | "Last 3 sessions were Sales Manager, use same?" |
| **Visualizations** | |
| Pain map on dashboard | Activities with friction heat indicators |
| Insight cluster map | Show where insights concentrate |
| Research coverage view | Which personas/workflows have data backing them |
| **Exports** | |
| Persona cards export | PDF/PNG for decks |
| Journey map builder | Timeline visualization |
| Workflow diagram export | For engineering handoff |
| **Other** | |
| Artifact uploads | Screenshots, recordings, documents |
| Tags system | Categorize insights by theme |
| Affinity mapping board | Drag insights into groups |
| Git auto-export | JSON versioning on save |
| Search | Query across all entities |

---

### Phase 6: Integrations (Future)

| Feature | Description |
|---------|-------------|
| Confluence export | Push research docs to team wiki |
| Notion export | Alternative wiki target |
| Figma plugin | Pull research context into design tool |
| API access | External systems can query research data |

---

## Current Priority Order

1. ~~**Project hierarchy restructure**~~ ✅ Done
2. ~~**Persona detail view**~~ ✅ Done
3. ~~**Project Dashboard**~~ ✅ Done
4. ~~**Session detail view**~~ ✅ Done
5. ~~**Mental Models**~~ ✅ Done
6. ~~**Persona-centric navigation + Inbox**~~ ✅ Done
7. **AI Research Assistant** — Chat-based research capture and querying
8. **Polish** — Inbox enhancements, visualizations, exports

---

## Tech Stack Summary

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Zustand, Tailwind, dnd-kit, Framer Motion |
| Backend | Hono, Mastra |
| Database | SQLite via libsql + Drizzle ORM |
| AI | Mastra agents (existing task builder, extend for analysis) |
| Monorepo | pnpm workspaces |

---

## Open Decisions

| Question | Options | Leaning |
|----------|---------|---------|
| Canvas library for mental models | ReactFlow vs custom dnd-kit | ReactFlow (more features) |
| Shared mental models | Per-persona vs shared with persona tags | Start per-persona, add sharing later |
| Dashboard auto-generate | Static components vs agent-generated | Static first, agent narration as enhancement |
| File storage for artifacts | Local filesystem vs external | Local for MVP, revisit for deployment |

---

## Next Action

**Option A: AI Research Assistant**
```
Read docs/ai-assistant-feature.md for the full spec.

Build the AI Research Assistant. Start with:
1. Chat panel UI (slide-out from right side, persistent across views)
2. Basic conversation with Mastra
3. Session debrief mode — "I just finished an interview" → creates session, extracts insights
4. Context awareness — agent knows current project, view, selected entity
```

**Option B: Polish — Inbox Enhancements**
```
Add an unread count badge to the Inbox in the sidebar showing how many 
unassigned sessions/insights/activities exist. Users should see at a glance 
if there's research that needs to be triaged.
```
