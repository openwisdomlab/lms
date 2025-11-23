# CLAUDE.md - AI Assistant Guide for NextGen LMS

## Project Overview

**Project:** NextGen LMS (Learning Management System)
**Organization:** openwisdomlab
**License:** MIT
**Version:** 0.1.0
**Status:** Active Development (Phases 1-4 Complete)

A research-focused Learning Management System combining challenge-based learning, distributed collaboration, gamification, and AI-assisted research workflows. Unlike traditional course-based LMS platforms, this is designed as a distributed research and knowledge platform.

## Quick Reference

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Run development server | `npm run dev` |
| Build for production | `npm run build` |
| Start production server | `npm run start` |
| Lint code | `npm run lint` |

## Technology Stack

### Frontend
- **Framework:** Next.js 15.1.0 (App Router, Turbopack)
- **Language:** TypeScript 5.7.2 (strict mode)
- **Styling:** Tailwind CSS 3.4.16
- **UI Components:** shadcn/ui (Radix UI based)
- **Icons:** Lucide React 0.468.0
- **Rich Text Editor:** Tiptap 2.11.0 with 14+ custom extensions
- **Math Rendering:** KaTeX 0.16.11
- **Knowledge Graph:** @xyflow/react 12.3.0, d3-force 3.0.0

### Backend & Database
- **Platform:** Supabase (PostgreSQL, Auth, RLS, Realtime, Storage)
- **Client:** @supabase/supabase-js 2.47.0
- **Auth SSR:** @supabase/ssr 0.5.2
- **Vector Search:** pgvector (1536-dim OpenAI embeddings)

### AI Integration
- **Framework:** Vercel AI SDK 4.0.0
- **Provider:** OpenAI integration (prepared for LLM features)

### State & Utilities
- **State Management:** Zustand 5.0.2
- **Validation:** Zod 3.24.0
- **Date Handling:** date-fns 4.1.0
- **ID Generation:** nanoid 5.0.8

## Repository Structure

```
lms/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (lab)/                 # Authenticated routes (route group)
│   │   │   ├── layout.tsx         # Lab layout with sidebar
│   │   │   ├── page.tsx           # Mission Control dashboard
│   │   │   ├── missions/          # Challenge Hub
│   │   │   ├── workspace/         # Research workspace
│   │   │   ├── knowledge/         # Knowledge base & graph
│   │   │   ├── teams/             # Team collaboration
│   │   │   ├── events/            # OMO events management
│   │   │   ├── learn/             # Micro-learning interface
│   │   │   └── research/[nodeId]/ # Research node editor
│   │   ├── page.tsx               # Public landing page
│   │   └── layout.tsx             # Root layout
│   ├── components/
│   │   ├── editor/                # Tiptap editor system
│   │   │   ├── science-editor.tsx # Main scientific editor
│   │   │   ├── floating-menu.tsx  # Bubble/floating menu
│   │   │   ├── slash-command-menu.tsx
│   │   │   ├── extensions/        # Custom Tiptap extensions
│   │   │   └── node-views/        # Custom node renderers
│   │   ├── ui/                    # shadcn/ui components (17+)
│   │   ├── layout/                # Header, sidebar, panels
│   │   ├── research/              # Collaboration components
│   │   ├── knowledge/             # Knowledge graph visualization
│   │   └── events/                # Event management UI
│   ├── hooks/
│   │   ├── use-research-copilot.ts      # AI assistant hook
│   │   ├── use-realtime-collaboration.ts # Real-time editing
│   │   └── use-knowledge-graph.ts       # Graph state management
│   ├── lib/
│   │   ├── supabase/              # Supabase client setup
│   │   │   ├── client.ts          # Browser client
│   │   │   ├── server.ts          # Server client
│   │   │   └── middleware.ts      # Auth middleware helpers
│   │   └── utils.ts               # Utility functions (cn, etc.)
│   ├── types/
│   │   ├── database.ts            # v1 base types
│   │   ├── database-v2.ts         # v2 Git-Lite types
│   │   └── database-v3.ts         # v3 OMO/Micro-learning types
│   └── middleware.ts              # Next.js auth middleware
├── supabase/
│   ├── schema.sql                 # v1 Core schema (848 lines)
│   ├── schema-v2-upgrade.sql      # v2 Git-Lite (631 lines)
│   ├── schema-v3-omo-microlearning.sql  # v3 OMO (813 lines)
│   └── schema-v4-git-science.sql  # v4 Knowledge Graph (806 lines)
├── public/                        # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── postcss.config.mjs
├── .env.local.example
├── .gitignore
├── CLAUDE.md                      # This file
├── FEATURE_COMPARISON.md          # Feature analysis vs competitors
└── README.md
```

## Implemented Features

### Phase 1: Core LMS Foundation
- **Challenge-Based Learning:** Scientific problems with difficulty levels (beginner → frontier)
- **Gamification System:** XP, levels (1 per 1000 XP), 15+ badge types, streaks, leaderboards
- **Research Nodes:** 8 types (hypothesis, experiment, data, analysis, synthesis, literature, note, question)
- **Knowledge Graph Foundation:** Bidirectional links with 8 link types

### Phase 2: Git-Lite Versioning & Scientific Workbench
- **Version Control:** Node versions with snapshots, change tracking, diff support
- **Publication Workflow:** Draft → Submit → Review → Publish
- **Peer Review System:** Review assignments, notes, scores, AI review results
- **Real-time Collaboration:** Editing sessions, cursor tracking via Supabase Realtime
- **AI Research Copilot:** Conflict detection, similar research discovery, methodology suggestions
- **Vector Search:** pgvector embeddings for semantic search

### Phase 3: OMO (Online-Merge-Offline) & Micro-learning
- **Events Management:** 11 event types, 4 delivery modes, QR check-in, capacity management
- **Mentor System:** Availability slots, student-mentor booking, session scheduling
- **Micro-learning:** 9 unit types, SM-2 spaced repetition, mastery levels, learning paths

### Phase 4: Git for Science & Knowledge Graph Visualization
- **Visual Knowledge Graph:** Interactive React Flow visualization with d3-force layout
- **Enhanced Graph:** Semantic edges, strength metrics, graph traversal functions

## Database Architecture

### Schema Files
Run schemas in order for full functionality:
1. `schema.sql` - Core foundation
2. `schema-v2-upgrade.sql` - Git-Lite versioning
3. `schema-v3-omo-microlearning.sql` - OMO & micro-learning
4. `schema-v4-git-science.sql` - Knowledge graph enhancements

### Core Tables (30+)
- **Users:** `profiles` (XP, level, streaks, preferences)
- **Content:** `challenges`, `research_nodes`, `artifacts`, `knowledge_links`
- **Collaboration:** `teams`, `team_members`, `node_collaborators`
- **Gamification:** `badges`, `user_badges`, `xp_transactions`
- **Versioning:** `node_versions`, `publication_requests`, `review_assignments`
- **Real-time:** `editing_sessions`, `collaboration_events`
- **Events:** `events`, `event_registrations`, `event_sessions`
- **Mentoring:** `mentor_availability`, `mentor_bookings`
- **Micro-learning:** `learning_units`, `learning_paths`, `user_unit_progress`, `daily_review_queue`

### PostgreSQL Extensions
- `uuid-ossp` - UUID generation
- `pgcrypto` - Encryption
- `vector` - AI embeddings (pgvector)

## Environment Configuration

Copy `.env.local.example` to `.env.local` and configure:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Code Conventions

### File Naming
- **Components:** PascalCase (`ScienceEditor.tsx`)
- **Utilities/hooks:** kebab-case (`use-research-copilot.ts`)
- **Types:** kebab-case (`database-v2.ts`)

### Component Structure
- Use `"use client"` directive only when needed (client-side interactivity)
- Server Components by default (Next.js 15 App Router)
- Colocate related files (component + types + tests)

### TypeScript
- Strict mode enabled
- Use path alias `@/*` for imports from `src/`
- Database types generated in `src/types/database*.ts`

### Styling
- Tailwind CSS utility classes
- CSS variables for theming (dark mode support)
- Use `cn()` utility for conditional classes

## Key Components

### Science Editor (`src/components/editor/`)
The Tiptap-based scientific editor with:
- Custom extensions for scientific content (hypothesis, methodology, data blocks)
- Slash command menu for quick insertion
- Floating menu for formatting
- Math support via KaTeX
- Code syntax highlighting via Lowlight
- AI block integration

### Knowledge Graph (`src/components/knowledge/`)
- `interactive-knowledge-graph.tsx` - Full visualization
- `knowledge-graph-mini.tsx` - Compact preview
- Force-directed layout with d3-force
- Real-time updates via Supabase

### Custom Hooks
```typescript
// AI Research Assistant
const { suggestions, detectConflicts } = useResearchCopilot(nodeId)

// Real-time collaboration
const { collaborators, broadcastChange } = useRealtimeCollaboration(sessionId)

// Knowledge graph state
const { nodes, edges, updateGraph } = useKnowledgeGraph()
```

## AI Assistant Instructions

### Before Making Changes
1. **Read relevant files** - Use `Read` tool to understand existing code
2. **Check database schema** - Review `supabase/schema*.sql` for data structures
3. **Understand types** - Check `src/types/` for TypeScript definitions
4. **Follow patterns** - Match existing component and hook patterns

### Adding New Features
1. Review existing similar features for patterns
2. Add database schema changes to appropriate `schema-v*.sql` file
3. Update TypeScript types in `src/types/`
4. Implement components following existing structure
5. Use existing UI components from `src/components/ui/`
6. Run `npm run lint` to check for issues

### Database Changes
- Add new tables/columns to the appropriate schema version file
- Include RLS policies for security
- Add appropriate indexes for query performance
- Update TypeScript types to match schema changes

### Component Development
```typescript
// Server Component (default)
export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase.from('table').select()
  return <div>{/* render data */}</div>
}

// Client Component (when needed)
"use client"
export function InteractiveComponent() {
  const [state, setState] = useState()
  return <div>{/* interactive content */}</div>
}
```

### Security Practices
- Never commit `.env.local` or credentials
- Use Supabase RLS for data access control
- Validate user input with Zod schemas
- Use parameterized queries (Supabase handles this)

## Common Tasks

### Adding a New Page
1. Create directory in `src/app/(lab)/new-page/`
2. Add `page.tsx` (Server Component by default)
3. Optionally add `layout.tsx` for nested layout
4. Update sidebar navigation in `src/components/layout/`

### Adding a New Tiptap Extension
1. Create extension in `src/components/editor/extensions/`
2. Register in science-editor.tsx extensions array
3. Add slash command if applicable
4. Create node-view if custom rendering needed

### Adding a Database Table
1. Add CREATE TABLE to appropriate schema file
2. Add RLS policies
3. Add to TypeScript types
4. Create Supabase client queries as needed

## Troubleshooting

### Common Issues

**Supabase connection errors:**
- Verify `.env.local` has correct Supabase URL and anon key
- Check Supabase project is running and accessible

**Type errors after schema changes:**
- Regenerate types or manually update `src/types/database*.ts`
- Ensure schema was applied to Supabase project

**Tiptap editor issues:**
- Check extension registration order (some have dependencies)
- Verify prosemirror packages are compatible versions

**Build failures:**
- Run `npm run lint` to identify issues
- Check for missing dependencies in package.json

## Git Workflow

### Branch Naming
- Features: `feature/description`
- Bugfixes: `fix/description`
- AI/Claude branches: `claude/description-sessionid`

### Commit Messages
Use conventional commits:
```
feat: add user authentication
fix: resolve course enrollment bug
docs: update API documentation
refactor: simplify notification service
```

### Recent Development Phases
- Phase 1: Core foundation & gamification
- Phase 2: Git-Lite versioning & AI copilot
- Phase 3: OMO events & micro-learning
- Phase 4: Visual knowledge graph

---

**Last Updated:** 2025-11-23
**Maintainers:** openwisdomlab team
