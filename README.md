# NextGen LMS - Distributed Research & Learning Platform

A next-generation learning experience platform (LXP) that transforms students into researchers through challenge-based learning, distributed research, and collaborative knowledge building.

## Core Features

- **Challenge-Based Learning**: Start with real-world scientific problems and work backwards to master concepts
- **Notion-like Editor**: Block-based editor with LaTeX math, code blocks, citations, and AI assistance
- **Knowledge Graph**: Bidirectional linking between research nodes
- **Research Teams**: Collaborative research with team-based XP and achievements
- **Gamification**: XP, badges, streaks, and leaderboards
- **AI Research Assistant**: Built-in AI co-pilot for hypothesis evaluation and research assistance

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI based)
- **Icons**: Lucide React
- **Backend/DB**: Supabase (PostgreSQL + Auth + RLS + Vector)
- **Rich Text Editor**: Tiptap (React)
- **AI Integration**: Vercel AI SDK (prepared)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repo-url>
cd nextgen-lms
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Edit \`.env.local\` with your Supabase credentials:
- \`NEXT_PUBLIC_SUPABASE_URL\`
- \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`

4. Set up the database:
   - Create a new Supabase project
   - Run the schema from \`supabase/schema.sql\` in the SQL editor

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

\`\`\`
src/
├── app/                    # Next.js App Router
│   ├── (lab)/             # Lab/Dashboard routes (authenticated)
│   │   ├── missions/      # Challenge pages
│   │   ├── workspace/     # User workspace
│   │   ├── knowledge/     # Global knowledge base
│   │   └── teams/         # Team collaboration
│   └── page.tsx           # Landing page
├── components/
│   ├── editor/            # Tiptap editor components
│   │   ├── extensions/    # Custom Tiptap extensions
│   │   └── science-editor.tsx
│   ├── layout/            # Layout components (sidebar, header)
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── supabase/          # Supabase client configuration
│   └── utils.ts           # Utility functions
├── types/
│   └── database.ts        # TypeScript types for database
├── hooks/                 # Custom React hooks
└── stores/                # Zustand stores (state management)
\`\`\`

## Database Schema

The database is designed for a scientific research network:

- **Challenges**: Scientific problems/courses with difficulty levels
- **Research Nodes**: Network-structured content units (hypotheses, experiments, data, etc.)
- **Knowledge Links**: Graph connections between nodes
- **Artifacts**: Student submissions (papers, code, datasets)
- **Teams**: Research groups with collaboration features
- **Gamification**: XP, badges, streaks, and achievements

See \`supabase/schema.sql\` for the complete schema.

## Editor Features

The Science Editor includes:

- Basic formatting (bold, italic, underline, etc.)
- Headings (H1-H3)
- Lists (bullet, numbered, task)
- Code blocks with syntax highlighting
- LaTeX math equations
- Tables
- Images
- **Slash Commands**: Type \`/\` for quick commands
- **Citations**: Type \`@\` to reference other research nodes
- **AI Block**: Get AI feedback on hypotheses

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting a PR.

## License

MIT License
