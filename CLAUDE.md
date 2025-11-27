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
| Run Next.js only | `npm run dev:next` |
| Run Convex only | `npm run dev:convex` |
| Build for production | `npm run build` |
| Start production server | `npm run start` |
| Lint code | `npm run lint` |
| Deploy Convex | `npm run convex:deploy` |

> **Note:** `npm run dev` runs both Next.js (with Turbopack) and Convex dev server in parallel using `npm-run-all`.

## Technology Stack

### Frontend
- **Framework:** Next.js 15.1.0 (App Router, Turbopack)
- **Language:** TypeScript 5.7.2 (strict mode)
- **React:** React 19.0.0
- **Styling:** Tailwind CSS 3.4.16 with @tailwindcss/typography
- **UI Components:** shadcn/ui (Radix UI based) - 19+ components
- **Icons:** Lucide React 0.468.0
- **Rich Text Editor:** Tiptap 2.11.0 with 18+ extensions
- **Math Rendering:** KaTeX 0.16.11
- **Knowledge Graph:** @xyflow/react 12.3.0, d3-force 3.0.0, d3-zoom 3.0.0
- **Internationalization:** next-intl 4.5.5 (English, Chinese)

### Backend & Database
- **Platform:** Convex (Real-time Database, Auth, Functions)
- **Client:** convex 1.29.3
- **Auth:** @convex-dev/auth 0.0.90 with OAuth providers (GitHub, Google)
- **Real-time:** Automatic via Convex useQuery hooks

> **Note:** This project was migrated from Supabase to Convex. Legacy Supabase files remain for reference but are deprecated.

### AI Integration
- **Framework:** Vercel AI SDK 4.0.0 (@ai-sdk/openai)
- **Provider:** OpenAI integration (prepared for LLM features)

### State & Utilities
- **State Management:** Zustand 5.0.2
- **Validation:** Zod 3.24.0
- **Date Handling:** date-fns 4.1.0
- **ID Generation:** nanoid 5.0.8
- **Class Utilities:** clsx 2.1.1, tailwind-merge 2.6.0, class-variance-authority 0.7.0

## Repository Structure

```
lms/
├── convex/                        # Convex backend (PRIMARY)
│   ├── _generated/                # Auto-generated types (DO NOT EDIT)
│   ├── schema.ts                  # Database schema definition (30+ tables)
│   ├── auth.ts                    # Authentication config
│   ├── auth.config.ts             # Auth providers configuration
│   ├── http.ts                    # HTTP routes for auth
│   ├── profiles.ts                # User profile functions
│   ├── challenges.ts              # Challenge functions
│   ├── researchNodes.ts           # Research node functions
│   ├── knowledgeGraph.ts          # Knowledge graph functions
│   ├── gamification.ts            # XP, badges, progress
│   ├── collaboration.ts           # Teams & real-time collaboration
│   ├── events.ts                  # OMO events management
│   ├── microlearning.ts           # Learning units & paths
│   ├── versioning.ts              # Git-lite versioning & merge
│   └── notifications.ts           # Notifications & comments
├── messages/                      # i18n translation files
│   ├── en.json                    # English translations
│   └── zh.json                    # Chinese translations
├── src/
│   ├── app/                       # Next.js App Router
│   │   └── [locale]/              # Locale-based routing
│   │       ├── layout.tsx         # Root layout with providers
│   │       ├── page.tsx           # Public landing page
│   │       └── (lab)/             # Authenticated routes (route group)
│   │           ├── layout.tsx     # Lab layout with sidebar
│   │           ├── page.tsx       # Mission Control dashboard
│   │           ├── missions/      # Challenge Hub
│   │           ├── workspace/     # Research workspace
│   │           ├── knowledge/     # Knowledge base & graph
│   │           ├── teams/         # Team collaboration
│   │           ├── events/        # OMO events management
│   │           ├── learn/         # Micro-learning interface
│   │           └── research/[nodeId]/ # Research node editor
│   ├── components/
│   │   ├── editor/                # Tiptap editor system
│   │   │   ├── science-editor.tsx # Main editor component
│   │   │   ├── floating-menu.tsx  # Formatting toolbar
│   │   │   ├── slash-command-menu.tsx # Command palette
│   │   │   ├── extensions/        # Custom Tiptap extensions
│   │   │   │   ├── scientific-blocks.ts
│   │   │   │   ├── enhanced-scientific-blocks.ts
│   │   │   │   ├── slash-command.ts
│   │   │   │   ├── citation.ts
│   │   │   │   └── ai-block.ts
│   │   │   └── node-views/        # Custom node renderers
│   │   │       ├── hypothesis-node-view.tsx
│   │   │       ├── methodology-node-view.tsx
│   │   │       ├── conclusion-node-view.tsx
│   │   │       └── data-node-view.tsx
│   │   ├── ui/                    # shadcn/ui components (19+)
│   │   │   ├── button.tsx, card.tsx, dialog.tsx
│   │   │   ├── dropdown-menu.tsx, popover.tsx
│   │   │   ├── tabs.tsx, tooltip.tsx, progress.tsx
│   │   │   └── ... (see full list below)
│   │   ├── layout/                # Layout components
│   │   │   ├── sidebar.tsx        # Collapsible navigation
│   │   │   ├── header.tsx         # Top navigation bar
│   │   │   ├── right-panel.tsx    # AI assistant panel
│   │   │   ├── landing-header.tsx # Public page header
│   │   │   ├── language-switcher.tsx # i18n locale toggle
│   │   │   └── theme-switcher.tsx # Dark/light mode toggle
│   │   ├── providers/             # React context providers
│   │   │   ├── convex-provider.tsx # Convex client + auth
│   │   │   └── theme-provider.tsx # next-themes provider
│   │   ├── research/              # Research components
│   │   │   ├── version-history.tsx
│   │   │   ├── knowledge-graph-mini.tsx
│   │   │   ├── collaboration-cursors.tsx
│   │   │   └── copilot-panel.tsx
│   │   ├── knowledge/             # Knowledge graph
│   │   │   └── interactive-knowledge-graph.tsx
│   │   └── events/                # Event management
│   │       └── qr-checkin.tsx
│   ├── hooks/
│   │   ├── index.ts               # Centralized exports with migration guide
│   │   ├── use-convex-auth.ts     # Auth: useCurrentUser, useProfile, etc.
│   │   ├── use-research-nodes.ts  # CRUD for research nodes
│   │   ├── use-convex-knowledge-graph.ts  # Graph queries & mutations
│   │   ├── use-convex-collaboration.ts    # Teams & sessions
│   │   ├── use-research-copilot.ts        # AI assistant hook
│   │   ├── use-knowledge-graph.ts         # [DEPRECATED] Legacy Supabase
│   │   └── use-realtime-collaboration.ts  # [DEPRECATED] Legacy Supabase
│   ├── i18n/                      # Internationalization config
│   │   ├── routing.ts             # Locale routing config
│   │   ├── request.ts             # Server-side locale loading
│   │   └── navigation.ts          # Localized Link, useRouter, etc.
│   ├── lib/
│   │   ├── utils.ts               # Utility functions (cn, etc.)
│   │   └── supabase/              # [DEPRECATED] Legacy Supabase client
│   ├── types/
│   │   ├── database.ts            # v1 base types (legacy reference)
│   │   ├── database-v2.ts         # v2 Git-Lite types
│   │   └── database-v3.ts         # v3 OMO/Micro-learning types
│   └── middleware.ts              # i18n + auth middleware
├── supabase/                      # [DEPRECATED] Legacy SQL schemas
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

## Internationalization (i18n)

The project uses **next-intl** for internationalization with the following configuration:

### Supported Locales
- `en` - English (default)
- `zh` - Chinese

### Configuration Files
- `src/i18n/routing.ts` - Defines locales and prefix strategy
- `src/i18n/request.ts` - Server-side locale loading
- `src/i18n/navigation.ts` - Localized navigation exports
- `messages/en.json` - English translations
- `messages/zh.json` - Chinese translations

### Usage Patterns

```typescript
// Import localized navigation (NOT from next/link)
import { Link, useRouter, usePathname } from "@/i18n/navigation";

// Use translations in components
import { useTranslations } from "next-intl";

export function MyComponent() {
  const t = useTranslations("namespace");
  return <p>{t("key")}</p>;
}

// Routes automatically include locale prefix
// e.g., /en/workspace, /zh/workspace
```

### Adding New Translations
1. Add keys to both `messages/en.json` and `messages/zh.json`
2. Use namespaced keys for organization
3. Access via `useTranslations("namespace")`

## Implemented Features

### Phase 1: Core LMS Foundation
- **Challenge-Based Learning:** Scientific problems with difficulty levels (beginner → frontier)
- **Gamification System:** XP, levels (1 per 1000 XP), 15+ badge types, streaks, leaderboards
- **Research Nodes:** 8 types (hypothesis, experiment, data, analysis, synthesis, literature, note, question)
- **Knowledge Graph Foundation:** Bidirectional links with 13+ link types

### Phase 2: Git-Lite Versioning & Scientific Workbench
- **Version Control:** Node versions with snapshots, change tracking, diff support
- **Publication Workflow:** Draft → Submit → Review → Publish
- **Peer Review System:** Review assignments, notes, scores, AI review results
- **Real-time Collaboration:** Editing sessions, cursor tracking via Convex real-time
- **AI Research Copilot:** Conflict detection, similar research discovery, methodology suggestions

### Phase 3: OMO (Online-Merge-Offline) & Micro-learning
- **Events Management:** 11 event types, 4 delivery modes, QR check-in, capacity management
- **Mentor System:** Availability slots, student-mentor booking, session scheduling
- **Micro-learning:** 9 unit types, SM-2 spaced repetition, mastery levels, learning paths

### Phase 4: Git for Science & Knowledge Graph Visualization
- **Visual Knowledge Graph:** Interactive React Flow visualization with d3-force layout
- **Enhanced Graph:** Semantic edges, strength metrics, evidence chains
- **Fork Network:** Track node ancestry, merge requests, reproduction attempts

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
  isPublic: v.boolean(),
  version: v.number(),
  // ... more fields
})
  .index("by_creator", ["createdBy"])
  .index("by_public", ["isPublic"])
  .index("by_node_type", ["nodeType"])
```

### Core Tables (30+)

| Category | Tables |
|----------|--------|
| **Users** | `profiles` |
| **Content** | `challenges`, `researchNodes`, `artifacts`, `knowledgeLinks` |
| **Collaboration** | `teams`, `teamMembers`, `nodeCollaborators` |
| **Gamification** | `badges`, `userBadges`, `xpTransactions`, `challengeProgress` |
| **Versioning** | `nodeVersions`, `publicationRequests`, `reviewAssignments` |
| **Real-time** | `editingSessions`, `collaborationEvents` |
| **Events** | `events`, `eventRegistrations`, `eventSessions` |
| **Mentoring** | `mentorAvailability`, `mentorBookings` |
| **Micro-learning** | `learningUnits`, `learningPaths`, `pathUnits`, `userUnitProgress`, `userPathProgress`, `dailyReviewQueue` |
| **Git-Science** | `nodeAncestry`, `mergeRequests`, `evidenceChains`, `forkNetwork`, `reproductionAttempts` |
| **Other** | `comments`, `notifications`, `nodeInteractions` |

### Key Convex Features
- **Automatic Real-time:** All queries update in real-time without manual subscriptions
- **Type Safety:** Full TypeScript types auto-generated in `convex/_generated/`
- **Authorization:** Function-level auth checks using `ctx.auth.getUserIdentity()`
- **Indexes:** Defined in schema for efficient queries

## Environment Configuration

Copy `.env.local.example` to `.env.local` and configure:

```bash
# Convex (Required)
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
CONVEX_DEPLOY_KEY=your_convex_deploy_key

# Convex Auth (Required for authentication)
CONVEX_AUTH_PRIVATE_KEY=your_private_key_here
CONVEX_AUTH_PUBLIC_KEY=your_public_key_here

# OAuth Providers (Optional)
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
- **Convex functions:** camelCase (`researchNodes.ts`)

### Component Structure
- Use `"use client"` directive only when needed (client-side interactivity)
- Server Components by default (Next.js 15 App Router)
- Colocate related files (component + types + tests)
- Use route groups `(lab)` for logical organization without affecting URLs

### TypeScript
- Strict mode enabled
- Use path alias `@/*` for imports from `src/`
- Convex types auto-generated in `convex/_generated/`
- Use `Id<"tableName">` for typed IDs

### Styling
- Tailwind CSS utility classes
- CSS variables for theming (dark mode support via next-themes)
- Use `cn()` utility from `@/lib/utils` for conditional classes

### Navigation
- Always use `Link` from `@/i18n/navigation` (not `next/link`)
- Use `usePathname`, `useRouter` from `@/i18n/navigation`
- Route groups like `(lab)` are included in href: `href="/(lab)/workspace"`

## UI Components (shadcn/ui)

Available components in `src/components/ui/`:

| Component | File | Description |
|-----------|------|-------------|
| Accordion | `accordion.tsx` | Collapsible content sections |
| Avatar | `avatar.tsx` | User avatars with fallback |
| Badge | `badge.tsx` | Status/label badges |
| Button | `button.tsx` | Buttons with variants |
| Card | `card.tsx` | Content containers |
| Collapsible | `collapsible.tsx` | Toggle visibility |
| Dialog | `dialog.tsx` | Modal dialogs |
| Dropdown Menu | `dropdown-menu.tsx` | Dropdown actions |
| Input | `input.tsx` | Text inputs |
| Label | `label.tsx` | Form labels |
| Popover | `popover.tsx` | Floating popovers |
| Progress | `progress.tsx` | Progress bars |
| Scroll Area | `scroll-area.tsx` | Custom scrollbars |
| Select | `select.tsx` | Dropdown select |
| Separator | `separator.tsx` | Visual dividers |
| Slider | `slider.tsx` | Range sliders |
| Tabs | `tabs.tsx` | Tab navigation |
| Textarea | `textarea.tsx` | Multi-line inputs |
| Toggle | `toggle.tsx` | Toggle buttons |
| Toggle Group | `toggle-group.tsx` | Button groups |
| Tooltip | `tooltip.tsx` | Hover tooltips |

## Custom Hooks

### Authentication
```typescript
import { useCurrentUser, useProfile, useCreateProfile } from "@/hooks";

// Get current authenticated user
const user = useCurrentUser();

// Get profile by ID
const profile = useProfile(profileId);

// Create new profile
const createProfile = useCreateProfile();
await createProfile({ displayName: "Jane", email: "jane@example.com", role: "learner" });
```

### Research Nodes
```typescript
import { useResearchNode, useCreateResearchNode, useForkResearchNode } from "@/hooks";

// Fetch node (auto-updates in real-time)
const node = useResearchNode(nodeId);

// Create new node
const createNode = useCreateResearchNode();

// Fork existing node
const forkNode = useForkResearchNode();
```

### Knowledge Graph
```typescript
import { useNodeConnections, useKnowledgeGraphVisualization } from "@/hooks";

// Get connections for a node
const connections = useNodeConnections(nodeId);

// Get full graph visualization data
const graphData = useKnowledgeGraphVisualization(nodeId);
```

### Collaboration
```typescript
import { useActiveSessions, useCollaborationSession, useTeam } from "@/hooks";

// Get active editing sessions for a node
const sessions = useActiveSessions(nodeId);

// Start/end collaboration session
const { startSession, endSession, updateCursor } = useCollaborationSession(nodeId, userId);
```

## AI Assistant Instructions

### Before Making Changes
1. **Read relevant files** - Use `Read` tool to understand existing code
2. **Check database schema** - Review `convex/schema.ts` for data structures
3. **Understand types** - Check generated types in `convex/_generated/`
4. **Follow patterns** - Match existing component and hook patterns
5. **Check i18n** - Add translations if adding user-facing text

### Adding New Features
1. Review existing similar features for patterns
2. Add table definitions to `convex/schema.ts`
3. Run `npx convex dev` to generate types
4. Create query/mutation functions in `convex/*.ts`
5. Add authorization checks in Convex functions
6. Create React hooks in `src/hooks/` if complex
7. Implement components following existing structure
8. Add translations to `messages/en.json` and `messages/zh.json`
9. Use existing UI components from `src/components/ui/`
10. Run `npm run lint` to check for issues

### Database Changes
- Add new tables to `convex/schema.ts`
- Define indexes in the table definition for queries
- Add authorization checks in Convex functions
- Types are auto-generated when running `npx convex dev`

### Component Development
```typescript
// Client Component with Convex (most common pattern)
"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function ResearchNodeViewer({ nodeId }: { nodeId: Id<"researchNodes"> }) {
  // Data automatically updates in real-time
  const node = useQuery(api.researchNodes.getById, { id: nodeId });
  const updateNode = useMutation(api.researchNodes.update);

  if (!node) return <div>Loading...</div>;

  return <div>{node.title}</div>;
}

// Server Component (for static content)
export default function StaticPage() {
  // Use Convex preloaded queries or fetch at build time
  return <div>{/* static content */}</div>;
}
```

### Security Practices
- Never commit `.env.local` or credentials
- Use function-level auth checks in Convex functions
- Validate user input with Zod schemas
- Authorization pattern in Convex:
  ```typescript
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  ```

## Common Tasks

### Adding a New Page
1. Create directory in `src/app/[locale]/(lab)/new-page/`
2. Add `page.tsx` (Server Component by default)
3. Optionally add `layout.tsx` for nested layout
4. Update sidebar navigation in `src/components/layout/sidebar.tsx`
5. Add navigation translations to `messages/*.json`

### Adding a New Tiptap Extension
1. Create extension in `src/components/editor/extensions/`
2. Register in `science-editor.tsx` extensions array
3. Add slash command if applicable
4. Create node-view in `node-views/` if custom rendering needed

### Adding a Database Table (Convex)
1. Add table definition to `convex/schema.ts`
2. Run `npx convex dev` to generate types
3. Create query/mutation functions in appropriate `convex/*.ts` file
4. Add authorization checks in functions
5. Export React hooks from `src/hooks/index.ts` if needed

### Adding New Translations
1. Add keys to `messages/en.json`:
   ```json
   {
     "namespace": {
       "key": "English text"
     }
   }
   ```
2. Add corresponding keys to `messages/zh.json`
3. Use in components:
   ```typescript
   const t = useTranslations("namespace");
   return <span>{t("key")}</span>;
   ```

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

**i18n issues:**
- Ensure you're using `Link` from `@/i18n/navigation`
- Check translation keys exist in both locale files
- Verify locale is valid in `src/i18n/routing.ts`

**Build failures:**
- Run `npm run lint` to identify issues
- Check for missing dependencies in package.json
- Ensure `CONVEX_DEPLOY_KEY` is set for production builds
- Verify all translation keys exist in both locale files

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
chore: update dependencies
i18n: add Chinese translations for events
```

### Development Phases Completed
- **Phase 1:** Core foundation & gamification
- **Phase 2:** Git-Lite versioning & AI copilot
- **Phase 3:** OMO events & micro-learning
- **Phase 4:** Visual knowledge graph

---

**Last Updated:** 2025-11-27
**Maintainers:** openwisdomlab team
