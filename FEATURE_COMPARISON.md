# NextGen LMS - Feature Comparison Report

## Reference Projects Analysis

### LearnHouse (https://github.com/learnhouse/learnhouse)
- **Stack**: Next.js 14, FastAPI, PostgreSQL, YJS for collaboration, Tiptap editor
- **Focus**: Course-based learning platform with content authoring
- **Key Features**: Course management, video hosting, quizzes, user authentication

### ClassroomIO (https://github.com/classroomio/classroomio)
- **Stack**: SvelteKit, Supabase, AI integration
- **Focus**: Course management platform with community features
- **Key Features**: Course builder, community forum, AI integration, analytics

---

## NextGen LMS Implementation Status

### Core Differentiators

| Feature | Status | Implementation Details |
|---------|--------|------------------------|
| **1. Notion-style Experience** | ✅ Implemented | Tiptap editor with slash commands, floating menus, rich block types |
| **2. Micro-learning** | ✅ Implemented | Learning units, spaced repetition (SM-2), daily review queue |
| **3. Gamification** | ✅ Implemented | XP system, levels, badges, streaks, leaderboards |
| **4. OMO Integration** | ✅ Implemented | Events, QR check-in, hybrid delivery modes, mentor bookings |
| **5. Challenge-Based Learning** | ✅ Implemented | Scientific challenges, research missions, frontier problems |
| **6. Distributed Research** | ✅ Implemented | Teams, collaboration, publication workflow, peer review |
| **7. Knowledge Graph** | ✅ Implemented | Bidirectional links, semantic edges, vector embeddings |

---

## Detailed Feature Breakdown

### 1. Notion-style Rich Editor
**Files**: `src/components/editor/`

| Feature | Status | File |
|---------|--------|------|
| Tiptap integration | ✅ | `science-editor.tsx` |
| Slash commands | ✅ | `extensions/slash-command.ts` |
| AI Block | ✅ | `extensions/ai-block.ts` |
| Citations (@mentions) | ✅ | `extensions/citation.ts` |
| Scientific blocks (Hypothesis, Methodology, Data, Conclusion) | ✅ | `extensions/scientific-blocks.ts` |
| Math/KaTeX support | ✅ | Configured in editor |
| Code blocks with syntax highlighting | ✅ | CodeBlockLowlight |
| Tables | ✅ | Tiptap Tables extension |

### 2. Micro-learning System
**Schema**: `supabase/schema-v3-omo-microlearning.sql`

| Feature | Status | Details |
|---------|--------|---------|
| Learning Units (atomic content) | ✅ | 9 unit types (concept, flashcard, quiz, etc.) |
| Flashcard system | ✅ | Front/back content with hints |
| Learning Paths | ✅ | Curated sequences with ordering |
| Spaced Repetition (SM-2) | ✅ | `calculate_next_review()` function |
| Daily Review Queue | ✅ | `generate_daily_review()` function |
| Mastery Levels | ✅ | 6 levels from not_started to mastered |
| Progress Tracking | ✅ | Per-unit and per-path progress |

**UI Components**: `src/app/(lab)/learn/page.tsx`
- Daily review interface with flashcards
- Mastery visualization
- Learning path progress cards

### 3. Gamification System
**Schema**: `supabase/schema.sql`

| Feature | Status | Details |
|---------|--------|---------|
| XP System | ✅ | `award_xp()` function, transaction logging |
| Levels | ✅ | Auto-calculated (1 level per 1000 XP) |
| Badges | ✅ | 15+ badge types across 6 categories |
| Streaks | ✅ | `update_streak()` function, daily tracking |
| Leaderboard | ✅ | SQL view with rankings |
| User Stats | ✅ | Comprehensive stats view |

**Badge Categories**:
- Research (first hypothesis, data pioneer, etc.)
- Collaboration (team player, peer reviewer, mentor)
- Mastery (physics explorer, code wizard)
- Streak (week warrior, month master)
- Contribution (knowledge architect, community builder)
- OMO (event pioneer, workshop warrior, hybrid learner)
- Micro-learning (daily learner, quick study, path finder)

### 4. OMO (Online-Merge-Offline)
**Schema**: `supabase/schema-v3-omo-microlearning.sql`

| Feature | Status | Details |
|---------|--------|---------|
| Events Management | ✅ | 11 event types (workshop, lab, seminar, etc.) |
| Delivery Modes | ✅ | in_person, online, hybrid, async |
| QR Check-in | ✅ | `event_checkin()` function, location verification |
| Event Registration | ✅ | Capacity tracking, waitlist support |
| Multi-session Events | ✅ | Session management within events |
| Mentor Availability | ✅ | Weekly/specific date availability slots |
| Mentor Booking | ✅ | Student-mentor session scheduling |
| Attendance Tracking | ✅ | 7 status types, duration tracking |

**UI Components**:
- `src/app/(lab)/events/page.tsx` - Event listing and management
- `src/components/events/qr-checkin.tsx` - QR scanning and manual check-in

### 5. Challenge-Based Learning
**Schema**: `supabase/schema.sql`

| Feature | Status | Details |
|---------|--------|---------|
| Challenges Table | ✅ | Scientific problems as learning units |
| Difficulty Levels | ✅ | beginner → frontier (5 levels) |
| Problem Statement | ✅ | Core scientific question |
| Real-world Context | ✅ | Why the problem matters |
| Research Fields | ✅ | Multi-field tagging |
| Prerequisites | ✅ | Challenge dependencies |
| Progress Tracking | ✅ | Per-user challenge progress |

**UI Components**: `src/app/(lab)/missions/page.tsx`
- Challenge Hub with filtering
- Difficulty badges
- XP rewards display

### 6. Distributed Research System
**Schema**: `supabase/schema.sql`, `supabase/schema-v2-upgrade.sql`

| Feature | Status | Details |
|---------|--------|---------|
| Teams | ✅ | Research groups with roles |
| Team Roles | ✅ | lead, member, contributor, observer |
| Node Collaboration | ✅ | Shared editing permissions |
| Git-Lite Versioning | ✅ | `node_versions` table, snapshots |
| Forking | ✅ | `fork_node()` function, lineage tracking |
| Publication Requests | ✅ | Pull request workflow for research |
| Peer Review | ✅ | Review assignments, scoring |
| Real-time Collaboration | ✅ | Supabase Realtime, cursor sharing |

**UI Components**:
- `src/app/(lab)/teams/page.tsx` - Team management
- `src/components/research/collaboration-cursors.tsx` - Live cursors
- `src/components/research/version-history.tsx` - Version timeline

### 7. Knowledge Graph
**Schema**: `supabase/schema.sql`, `supabase/schema-v2-upgrade.sql`

| Feature | Status | Details |
|---------|--------|---------|
| Bidirectional Links | ✅ | `knowledge_links` table |
| Link Types | ✅ | 13 types (supports, contradicts, extends, etc.) |
| Link Strength | ✅ | Weighted edges (0-1) |
| Vector Embeddings | ✅ | pgvector with 1536 dimensions |
| Similarity Search | ✅ | `search_similar_nodes()` function |
| Conflict Detection | ✅ | `find_conflicting_hypotheses()` function |
| Graph Traversal | ✅ | `get_graph_neighbors()` function |

**UI Components**:
- `src/components/research/knowledge-graph-mini.tsx` - Mini graph visualization
- `src/app/(lab)/knowledge/page.tsx` - Global knowledge base

---

## Database Schema Summary

### Schema Files
1. `supabase/schema.sql` - Core schema (v1)
   - Users/profiles, challenges, research nodes
   - Knowledge links, artifacts, teams
   - Gamification (badges, XP, streaks)
   - Progress tracking, comments, notifications

2. `supabase/schema-v2-upgrade.sql` - Git-Lite & Collaboration (v2)
   - Node versions, publication requests
   - Review assignments, editing sessions
   - Vector search functions
   - Real-time collaboration events

3. `supabase/schema-v3-omo-microlearning.sql` - OMO & Micro-learning (v3)
   - Events and registrations
   - Mentor availability and bookings
   - Learning units and paths
   - Spaced repetition system

### Key Tables (30+)
- `profiles`, `challenges`, `research_nodes`, `knowledge_links`
- `artifacts`, `teams`, `team_members`, `node_collaborators`
- `badges`, `user_badges`, `xp_transactions`
- `challenge_progress`, `node_interactions`, `comments`, `notifications`
- `node_versions`, `publication_requests`, `review_assignments`
- `editing_sessions`, `collaboration_events`
- `events`, `event_registrations`, `event_sessions`
- `mentor_availability`, `mentor_bookings`
- `learning_units`, `learning_paths`, `path_units`
- `user_unit_progress`, `user_path_progress`, `daily_review_queue`

---

## Comparison with Reference Projects

### vs LearnHouse
| Feature | LearnHouse | NextGen LMS |
|---------|------------|-------------|
| Course-based structure | ✅ Primary | ✅ Challenges |
| Graph-based knowledge | ❌ | ✅ Full graph |
| Micro-learning | ❌ | ✅ Full system |
| Gamification | Basic | ✅ Comprehensive |
| Real-time collab | ✅ YJS | ✅ Supabase Realtime |
| Scientific workflow | ❌ | ✅ Research-focused |
| Offline events | ❌ | ✅ OMO system |

### vs ClassroomIO
| Feature | ClassroomIO | NextGen LMS |
|---------|-------------|-------------|
| Community forum | ✅ | Research nodes + comments |
| AI integration | ✅ Basic | ✅ Research Copilot |
| Course builder | ✅ | ✅ Challenge + Path builder |
| Analytics | ✅ | ✅ User stats + leaderboards |
| Knowledge graph | ❌ | ✅ Full graph with embeddings |
| Distributed research | ❌ | ✅ Git-Lite workflow |
| Spaced repetition | ❌ | ✅ SM-2 algorithm |

---

## Architecture Highlights

### Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Editor**: Tiptap with custom extensions
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **AI**: Vercel AI SDK ready, pgvector for embeddings
- **Security**: Row-Level Security (RLS) policies throughout

### Key Design Decisions
1. **Research-First**: Built around scientific inquiry, not just courses
2. **Graph-Based**: Knowledge is networked, not hierarchical
3. **Collaborative**: Real-time editing, teams, peer review
4. **Gamified**: Every action earns XP, badges provide goals
5. **Hybrid**: Supports both online and offline learning
6. **Adaptive**: Spaced repetition for personalized review

---

## File Structure

```
src/
├── app/
│   ├── (lab)/
│   │   ├── layout.tsx          # Lab layout with sidebar
│   │   ├── page.tsx            # Mission Control dashboard
│   │   ├── missions/page.tsx   # Challenge Hub
│   │   ├── workspace/page.tsx  # Research Workspace
│   │   ├── knowledge/page.tsx  # Knowledge Base
│   │   ├── teams/page.tsx      # Team Collaboration
│   │   ├── events/page.tsx     # OMO Events (NEW)
│   │   ├── learn/page.tsx      # Micro-learning (NEW)
│   │   └── research/[nodeId]/page.tsx  # Node Editor
│   └── ...
├── components/
│   ├── editor/                 # Tiptap editor + extensions
│   ├── layout/                 # Sidebar, header, panels
│   ├── research/               # Collaboration, version history
│   ├── events/                 # QR check-in (NEW)
│   └── ui/                     # shadcn/ui components
├── hooks/
│   ├── use-research-copilot.ts # AI assistant
│   └── use-realtime-collaboration.ts
├── types/
│   ├── database.ts             # v1 types
│   ├── database-v2.ts          # v2 types
│   └── database-v3.ts          # v3 types (NEW)
└── lib/
    └── supabase/               # Supabase client setup
```

---

## Conclusion

NextGen LMS successfully implements all 7 core differentiators:

1. ✅ **Notion-style**: Tiptap with scientific blocks and slash commands
2. ✅ **Micro-learning**: Full SM-2 spaced repetition system
3. ✅ **Gamification**: Comprehensive XP, badges, streaks, leaderboards
4. ✅ **OMO**: Events, QR check-in, mentor sessions, hybrid delivery
5. ✅ **Challenge-Based**: Scientific problems with difficulty scaling
6. ✅ **Distributed Research**: Git-Lite versioning, teams, peer review
7. ✅ **Knowledge Graph**: Bidirectional links, vector search, conflict detection

The platform goes beyond both LearnHouse and ClassroomIO by combining:
- Research-focused workflows (vs course-focused)
- Full knowledge graph with AI-powered discovery
- Spaced repetition for long-term retention
- Hybrid online/offline learning support
- Scientific inquiry structure (hypothesis → conclusion)
