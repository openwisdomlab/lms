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
- **Platform:** Convex (Real-time Database, Auth, Functions)
- **Client:** convex 1.29.3
- **Auth:** @convex-dev/auth 0.0.90 with OAuth providers
- **Real-time:** Automatic via Convex useQuery hooks

> **Note:** This project was migrated from Supabase to Convex. Legacy Supabase files remain for reference but are deprecated.

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
├── convex/                        # Convex backend (PRIMARY)
│   ├── schema.ts                  # Database schema definition
│   ├── profiles.ts                # User profile functions
│   ├── challenges.ts              # Challenge functions
│   ├── researchNodes.ts           # Research node functions
│   ├── knowledgeGraph.ts          # Knowledge graph functions
│   ├── gamification.ts            # XP, badges, progress
│   ├── collaboration.ts           # Teams & real-time collaboration
│   ├── events.ts                  # OMO events management
│   ├── microlearning.ts           # Learning units & paths
│   ├── versioning.ts              # Git-lite versioning & merge
│   ├── notifications.ts           # Notifications & comments
│   ├── auth.ts                    # Authentication config
│   └── http.ts                    # HTTP routes for auth
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── [locale]/(lab)/        # Authenticated routes (route group)
│   │   │   ├── layout.tsx         # Lab layout with sidebar
│   │   │   ├── page.tsx           # Mission Control dashboard
│   │   │   ├── missions/          # Challenge Hub
│   │   │   ├── workspace/         # Research workspace
│   │   │   ├── knowledge/         # Knowledge base & graph
│   │   │   ├── teams/             # Team collaboration
│   │   │   ├── events/            # OMO events management
│   │   │   ├── learn/             # Micro-learning interface
│   │   │   └── research/[nodeId]/ # Research node editor
│   │   ├── [locale]/page.tsx      # Public landing page
│   │   └── [locale]/layout.tsx    # Locale layout with providers
│   ├── components/
│   │   ├── editor/                # Tiptap editor system
│   │   ├── ui/                    # shadcn/ui components (17+)
│   │   ├── layout/                # Header, sidebar, panels
│   │   ├── providers/             # React providers (Convex, Theme)
│   │   ├── research/              # Collaboration components
│   │   ├── knowledge/             # Knowledge graph visualization
│   │   └── events/                # Event management UI
│   ├── hooks/
│   │   ├── index.ts               # Hook exports with migration guide
│   │   ├── use-convex-auth.ts     # Convex auth hooks
│   │   ├── use-research-nodes.ts  # Research node hooks
│   │   ├── use-convex-knowledge-graph.ts  # Knowledge graph hooks
│   │   ├── use-convex-collaboration.ts    # Collaboration hooks
│   │   └── use-research-copilot.ts        # AI assistant hook
│   ├── lib/
│   │   ├── supabase/              # [DEPRECATED] Legacy Supabase client
│   │   └── utils.ts               # Utility functions (cn, etc.)
│   ├── types/
│   │   ├── database.ts            # v1 base types (legacy reference)
│   │   ├── database-v2.ts         # v2 Git-Lite types
│   │   └── database-v3.ts         # v3 OMO/Micro-learning types
│   └── middleware.ts              # Next.js middleware
├── supabase/                      # [DEPRECATED] Legacy SQL schemas
│   ├── schema.sql                 # v1 Core schema (reference)
│   ├── schema-v2-upgrade.sql      # v2 Git-Lite (reference)
│   ├── schema-v3-omo-microlearning.sql  # v3 OMO (reference)
│   └── schema-v4-git-science.sql  # v4 Knowledge Graph (reference)
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
- **Real-time Collaboration:** Editing sessions, cursor tracking via Convex real-time
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

### Convex Schema
The database schema is defined in `convex/schema.ts` using Convex's type-safe schema definition:

```typescript
// Example: Research Nodes table
researchNodes: defineTable({
  title: v.string(),
  nodeType: v.string(),
  content: v.any(),
  createdBy: v.id("profiles"),
  // ... more fields
})
  .index("by_creator", ["createdBy"])
  .index("by_public", ["isPublic"])
```

### Core Tables (30+)
- **Users:** `profiles` (XP, level, streaks, preferences)
- **Content:** `challenges`, `researchNodes`, `artifacts`, `knowledgeLinks`
- **Collaboration:** `teams`, `teamMembers`, `nodeCollaborators`
- **Gamification:** `badges`, `userBadges`, `xpTransactions`
- **Versioning:** `nodeVersions`, `publicationRequests`, `reviewAssignments`
- **Real-time:** `editingSessions`, `collaborationEvents`
- **Events:** `events`, `eventRegistrations`, `eventSessions`
- **Mentoring:** `mentorAvailability`, `mentorBookings`
- **Micro-learning:** `learningUnits`, `learningPaths`, `userUnitProgress`, `dailyReviewQueue`
- **Git-Science:** `nodeAncestry`, `mergeRequests`, `evidenceChains`, `forkNetwork`

### Key Convex Features
- **Automatic Real-time:** All queries update in real-time without subscriptions
- **Type Safety:** Full TypeScript types generated from schema
- **Authorization:** Function-level auth checks using `ctx.auth`
- **Indexes:** Defined in schema for efficient queries

## Environment Configuration

Copy `.env.local.example` to `.env.local` and configure:

```bash
# Convex (Required)
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
CONVEX_DEPLOY_KEY=your_convex_deploy_key

# Authentication (Optional - for OAuth)
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# OpenAI (for AI features)
OPENAI_API_KEY=your_openai_api_key

# App
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
- Real-time updates via Convex

### Custom Hooks (Convex)
```typescript
// Import hooks from centralized location
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// Research Node (auto-updates in real-time)
const node = useQuery(api.researchNodes.getById, { id: nodeId });

// Knowledge Graph
const connections = useQuery(api.knowledgeGraph.getNodeConnections, { nodeId });

// Mutations
const createNode = useMutation(api.researchNodes.create);
const forkNode = useMutation(api.researchNodes.fork);

// Real-time Collaboration (automatic)
const sessions = useQuery(api.collaboration.getActiveSessionsForNode, { nodeId });

// Or use pre-built hooks from src/hooks/
import {
  useResearchNode,
  useKnowledgeGraphVisualization,
  useCollaborationSession,
} from "@/hooks";
```

## AI Assistant Instructions

### Before Making Changes
1. **Read relevant files** - Use `Read` tool to understand existing code
2. **Check database schema** - Review `convex/schema.ts` for data structures
3. **Understand types** - Check generated types in `convex/_generated/`
4. **Follow patterns** - Match existing component and hook patterns

### Adding New Features
1. Review existing similar features for patterns
2. Add table definitions to `convex/schema.ts`
3. Create query/mutation functions in `convex/*.ts`
4. Implement components following existing structure
5. Use existing UI components from `src/components/ui/`
6. Run `npm run lint` to check for issues

### Database Changes
- Add new tables to `convex/schema.ts`
- Define indexes in the table definition
- Add authorization checks in Convex functions
- Types are auto-generated by Convex

### Component Development
```typescript
// Client Component with Convex (most common pattern)
"use client"
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function ResearchNodeViewer({ nodeId }: { nodeId: Id<"researchNodes"> }) {
  // Data automatically updates in real-time
  const node = useQuery(api.researchNodes.getById, { id: nodeId });
  const updateNode = useMutation(api.researchNodes.update);

  if (!node) return <Loading />;

  return <div>{node.title}</div>
}

// Server Component (for static content)
export default async function StaticPage() {
  // Use Convex preloaded queries or fetch at build time
  return <div>{/* static content */}</div>
}
```

### Security Practices
- Never commit `.env.local` or credentials
- Use function-level auth checks in Convex functions
- Validate user input with Zod schemas
- Authorization in Convex: `const identity = await ctx.auth.getUserIdentity()`

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

### Adding a Database Table (Convex)
1. Add table definition to `convex/schema.ts`
2. Run `npx convex dev` to generate types
3. Create query/mutation functions in appropriate `convex/*.ts` file
4. Add authorization checks in functions
5. Create React hooks in `src/hooks/` if needed

## Troubleshooting

### Common Issues

**Convex connection errors:**
- Verify `.env.local` has correct `NEXT_PUBLIC_CONVEX_URL`
- Run `npx convex dev` to start the Convex development server
- Check Convex dashboard for deployment status

**Type errors after schema changes:**
- Run `npx convex dev` to regenerate types in `convex/_generated/`
- Restart TypeScript server in your IDE

**Convex function errors:**
- Check function arguments match schema validators
- Verify indexes exist for queries using `withIndex`
- Check authorization: `await ctx.auth.getUserIdentity()`

**Tiptap editor issues:**
- Check extension registration order (some have dependencies)
- Verify prosemirror packages are compatible versions

**Build failures:**
- Run `npm run lint` to identify issues
- Check for missing dependencies in package.json
- Ensure `CONVEX_DEPLOY_KEY` is set for production builds

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

**Last Updated:** 2025-11-25
**Maintainers:** openwisdomlab team
