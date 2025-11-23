# NextGen LMS - Distributed Research & Learning Platform

<div align="center">

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-Active%20Development-orange.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.1.0-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue.svg)

**A next-generation learning experience platform (LXP) that transforms students into researchers through challenge-based learning, distributed research, and collaborative knowledge building.**

[Getting Started](#getting-started) | [Features](#implemented-features) | [Roadmap](#roadmap) | [Contributing](#contributing)

</div>

---

## Overview

Unlike traditional course-based LMS platforms, NextGen LMS is designed as a **distributed research and knowledge platform** that:

- **Starts with real problems**: Challenge-based learning with scientific problems from beginner to frontier research
- **Builds knowledge networks**: Graph-based organization instead of linear courses
- **Enables collaboration**: Real-time editing, team research, and peer review
- **Motivates through gamification**: XP, badges, streaks, and leaderboards
- **Supports hybrid learning**: Online-Merge-Offline (OMO) with events and mentor sessions
- **Ensures long-term retention**: Spaced repetition micro-learning system

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.1.0 | React framework with App Router & Turbopack |
| TypeScript | 5.7.2 | Type-safe development (strict mode) |
| Tailwind CSS | 3.4.16 | Utility-first styling |
| shadcn/ui | - | Radix UI-based components |
| Tiptap | 2.11.0 | Rich text editor with 14+ extensions |
| @xyflow/react | 12.3.0 | Knowledge graph visualization |
| KaTeX | 0.16.11 | Math rendering |
| Lucide React | 0.468.0 | Icons |

### Backend & Database
| Technology | Version | Purpose |
|------------|---------|---------|
| Supabase | - | PostgreSQL, Auth, RLS, Realtime, Storage |
| @supabase/supabase-js | 2.47.0 | Database client |
| @supabase/ssr | 0.5.2 | Server-side auth |
| pgvector | - | Vector embeddings (1536-dim) |

### AI & State Management
| Technology | Version | Purpose |
|------------|---------|---------|
| Vercel AI SDK | 4.0.0 | AI integration framework |
| Zustand | 5.0.2 | State management |
| Zod | 3.24.0 | Schema validation |

## Implemented Features

### Phase 1: Core LMS Foundation
- **Challenge-Based Learning**: Scientific problems with 5 difficulty levels (beginner → frontier)
- **Gamification System**: XP, levels (1 per 1000 XP), 15+ badge types, streaks, leaderboards
- **Research Nodes**: 8 types (hypothesis, experiment, data, analysis, synthesis, literature, note, question)
- **Knowledge Graph Foundation**: Bidirectional links with 8+ link types

### Phase 2: Git-Lite Versioning & Scientific Workbench
- **Version Control**: Node versions with snapshots, change tracking, diff support
- **Publication Workflow**: Draft → Submit → Review → Publish
- **Peer Review System**: Review assignments, notes, scores, AI review results
- **Real-time Collaboration**: Editing sessions, cursor tracking via Supabase Realtime
- **AI Research Copilot**: Conflict detection, similar research discovery, methodology suggestions
- **Vector Search**: pgvector embeddings for semantic search

### Phase 3: OMO (Online-Merge-Offline) & Micro-learning
- **Events Management**: 11 event types, 4 delivery modes, QR check-in, capacity management
- **Mentor System**: Availability slots, student-mentor booking, session scheduling
- **Micro-learning**: 9 unit types, SM-2 spaced repetition, mastery levels, learning paths

### Phase 4: Git for Science & Knowledge Graph Visualization
- **Visual Knowledge Graph**: Interactive React Flow visualization with d3-force layout
- **Enhanced Graph**: Semantic edges, strength metrics, graph traversal functions
- **i18n Infrastructure**: Multi-language support (en/zh)
- **Theme System**: Technical Minimalism design with dark mode

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/openwisdomlab/lms.git
cd lms
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Set up the database:**
   - Create a new Supabase project
   - Run schemas in order in the SQL editor:
     1. `supabase/schema.sql` - Core foundation
     2. `supabase/schema-v2-upgrade.sql` - Git-Lite versioning
     3. `supabase/schema-v3-omo-microlearning.sql` - OMO & micro-learning
     4. `supabase/schema-v4-git-science.sql` - Knowledge graph enhancements

5. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

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
│   │   ├── ui/                    # shadcn/ui components (17+)
│   │   ├── layout/                # Header, sidebar, panels
│   │   ├── research/              # Collaboration components
│   │   ├── knowledge/             # Knowledge graph visualization
│   │   └── events/                # Event management UI
│   ├── hooks/                     # Custom React hooks
│   ├── lib/                       # Utilities and configs
│   │   ├── supabase/              # Supabase client setup
│   │   └── utils.ts               # Utility functions
│   └── types/                     # TypeScript definitions
│       ├── database.ts            # v1 base types
│       ├── database-v2.ts         # v2 Git-Lite types
│       └── database-v3.ts         # v3 OMO/Micro-learning types
├── supabase/                      # Database schemas
├── public/                        # Static assets
└── docs/                          # Documentation
```

## Roadmap

### Phase 5: AI-Powered Research Assistant (Q1 2025)
- [ ] **Intelligent Writing Assistant**: Context-aware suggestions while editing research nodes
- [ ] **Automated Literature Review**: AI-powered paper summarization and relevance scoring
- [ ] **Research Gap Detection**: Identify unexplored areas based on knowledge graph analysis
- [ ] **Hypothesis Generation**: AI-assisted hypothesis formulation from existing data
- [ ] **Citation Recommendation**: Smart citation suggestions based on content

### Phase 6: Advanced Collaboration (Q1-Q2 2025)
- [ ] **Cross-Team Research Networks**: Connect research across multiple teams
- [ ] **Research Lineage Tracking**: Visual ancestry of forked/evolved research
- [ ] **Conflict Resolution Workflow**: Structured process for resolving contradicting findings
- [ ] **External Collaboration**: Invite external researchers with limited access
- [ ] **Research Milestone Tracking**: Goal-based progress visualization

### Phase 7: Analytics & Insights (Q2 2025)
- [ ] **Learning Analytics Dashboard**: Comprehensive progress visualization
- [ ] **Research Impact Metrics**: Citation counts, influence scores, contribution graphs
- [ ] **Team Performance Analytics**: Collaboration health indicators
- [ ] **Knowledge Graph Analytics**: Centrality, clustering, gap analysis
- [ ] **Personalized Learning Recommendations**: AI-driven content suggestions

### Phase 8: Platform Expansion (Q2-Q3 2025)
- [ ] **Mobile Application**: React Native app for learning on-the-go
- [ ] **API for External Integrations**: REST/GraphQL API for third-party tools
- [ ] **Plugin System**: Extensible architecture for custom extensions
- [ ] **Multi-tenant Support**: Organization-level deployments
- [ ] **Advanced Export**: Export research to LaTeX, academic formats

### Phase 9: Community & Scale (Q3 2025)
- [ ] **Public Research Repository**: Share research publicly with DOI assignment
- [ ] **Peer Review Marketplace**: Cross-organization peer review system
- [ ] **Research Funding Integration**: Connect with funding bodies
- [ ] **Academic Institution Integration**: LTI support for university systems
- [ ] **Research Conferences**: Virtual conference hosting within platform

### Future Considerations
- Blockchain-based research verification
- AR/VR lab simulations
- Real-time collaborative experimentation
- Integration with scientific instruments/IoT

---

## Development Guidelines

### Code Conventions

#### File Naming
- **Components**: PascalCase (`ScienceEditor.tsx`)
- **Utilities/hooks**: kebab-case (`use-research-copilot.ts`)
- **Types**: kebab-case (`database-v2.ts`)

#### Component Structure
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

### System Rules

> **These rules ensure development consistency across all contributors.**

#### 1. Architecture Rules
- **Server Components by default**: Only use `"use client"` when client-side interactivity is required
- **Colocate related files**: Keep component, types, and tests together
- **Use path aliases**: Always use `@/*` for imports from `src/`
- **Feature folders**: Group related components in feature directories

#### 2. Database Rules
- **Schema versioning**: Add new tables/columns to appropriate `schema-v*.sql` file
- **Always include RLS**: Every table must have Row-Level Security policies
- **Index performance-critical columns**: Add indexes for frequently queried fields
- **Update types**: TypeScript types must match schema changes in `src/types/`

#### 3. Styling Rules
- **Tailwind utilities only**: No custom CSS unless absolutely necessary
- **Use CSS variables**: For theming and dark mode support
- **Use `cn()` utility**: For conditional class composition
- **Consistent spacing**: Follow Tailwind's spacing scale (4, 8, 12, 16, etc.)

#### 4. API & Security Rules
- **Never commit secrets**: Use `.env.local` for sensitive values
- **Validate all input**: Use Zod schemas for user input validation
- **Use parameterized queries**: Supabase handles this, never use raw SQL
- **Check permissions**: Verify user authorization before operations

#### 5. Git Workflow Rules
- **Conventional commits**: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
- **Branch naming**: `feature/description`, `fix/description`, `claude/description-sessionid`
- **PR requirements**: All PRs need description, test plan, and review

#### 6. Testing Rules
- **Test critical paths**: Auth flows, data mutations, complex calculations
- **Mock external services**: Supabase, OpenAI calls should be mocked
- **Component testing**: Use React Testing Library for UI tests

#### 7. Performance Rules
- **Lazy load heavy components**: Use `dynamic()` for knowledge graph, editor
- **Optimize images**: Use Next.js Image component
- **Minimize client bundles**: Keep client components small
- **Cache API responses**: Use React Query or SWR patterns

### Editor Development

The Tiptap-based Science Editor has specific patterns:

```typescript
// Adding a new extension
// 1. Create extension in src/components/editor/extensions/
// 2. Register in science-editor.tsx extensions array
// 3. Add slash command if applicable
// 4. Create node-view if custom rendering needed
```

### Database Migrations

```sql
-- Always include in migration files:
-- 1. CREATE TABLE with proper types
-- 2. RLS policies for CRUD operations
-- 3. Indexes for query optimization
-- 4. Triggers for computed fields (if needed)
-- 5. Comments explaining purpose
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow development guidelines** above
4. **Commit your changes**: `git commit -m 'feat: add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### PR Checklist

- [ ] Code follows project conventions
- [ ] TypeScript types are updated
- [ ] RLS policies added (if new tables)
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] `npm run lint` passes

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend platform
- [Tiptap](https://tiptap.dev/) - Rich text editor
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [React Flow](https://reactflow.dev/) - Graph visualization

---

<div align="center">

**Built with care by [OpenWisdomLab](https://github.com/openwisdomlab)**

</div>
