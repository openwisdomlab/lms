-- NextGen LMS: Distributed Research & Learning Platform
-- PostgreSQL Schema for Supabase
-- Version: 1.0.0

-- =============================================================================
-- EXTENSIONS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";  -- For AI embeddings

-- =============================================================================
-- CUSTOM TYPES (ENUMS)
-- =============================================================================

-- User roles in the platform
CREATE TYPE user_role AS ENUM (
  'learner',           -- Regular student/learner
  'researcher',        -- Advanced user with research privileges
  'mentor',            -- Can guide teams and review submissions
  'admin'              -- Platform administrator
);

-- Research node types (flexible content types)
CREATE TYPE node_type AS ENUM (
  'hypothesis',        -- A scientific hypothesis to test
  'experiment',        -- An experimental procedure
  'data',              -- Raw data or dataset
  'analysis',          -- Data analysis and interpretation
  'synthesis',         -- Combined findings from multiple sources
  'literature',        -- Literature review or reference
  'note',              -- Personal notes
  'question'           -- Open research question
);

-- Challenge difficulty levels
CREATE TYPE difficulty_level AS ENUM (
  'beginner',
  'intermediate',
  'advanced',
  'expert',
  'frontier'           -- Cutting-edge research problems
);

-- Artifact types (student submissions)
CREATE TYPE artifact_type AS ENUM (
  'paper',             -- Research paper or report
  'code',              -- Code repository/snippet
  'dataset',           -- Data contribution
  'model',             -- ML model or simulation
  'visualization',     -- Charts, graphs, diagrams
  'presentation',      -- Slides or video presentation
  'peer_review'        -- Review of another's work
);

-- Badge categories
CREATE TYPE badge_category AS ENUM (
  'research',          -- Research-related achievements
  'collaboration',     -- Teamwork and community
  'mastery',           -- Subject matter expertise
  'contribution',      -- Platform contributions
  'streak',            -- Consistency achievements
  'special'            -- Limited edition or event badges
);

-- Knowledge link types (for graph connections)
CREATE TYPE link_type AS ENUM (
  'supports',          -- Source supports target
  'contradicts',       -- Source contradicts target
  'extends',           -- Source extends/builds on target
  'references',        -- Simple reference
  'derived_from',      -- Target is derived from source
  'prerequisite',      -- Source is prerequisite for target
  'related',           -- General relation
  'fork'               -- Target is a fork of source
);

-- Team membership roles
CREATE TYPE team_role AS ENUM (
  'lead',              -- Team leader
  'member',            -- Regular member
  'contributor',       -- External contributor
  'observer'           -- Read-only access
);

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Users (extends Supabase Auth)
-- -----------------------------------------------------------------------------
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  role user_role DEFAULT 'learner',
  institution TEXT,
  research_interests TEXT[],

  -- Gamification
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  streak_last_activity DATE,

  -- Settings
  preferences JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{"email": true, "push": true}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for common queries
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_xp ON profiles(xp DESC);

-- -----------------------------------------------------------------------------
-- Challenges (Scientific Problems / Courses)
-- -----------------------------------------------------------------------------
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic info
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  cover_image_url TEXT,

  -- Scientific context
  problem_statement TEXT NOT NULL,      -- The core scientific question
  real_world_context TEXT,              -- Why this matters
  research_field TEXT[] NOT NULL,       -- e.g., ['astrophysics', 'biology']
  keywords TEXT[],

  -- Structure
  difficulty difficulty_level DEFAULT 'intermediate',
  estimated_hours INTEGER,
  prerequisites UUID[],                 -- References to other challenges

  -- Content (Tiptap JSON)
  introduction_content JSONB,           -- Rich text introduction
  resources JSONB,                      -- External resources, papers, etc.

  -- Gamification
  xp_reward INTEGER DEFAULT 100,

  -- Status
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,

  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE INDEX idx_challenges_slug ON challenges(slug);
CREATE INDEX idx_challenges_difficulty ON challenges(difficulty);
CREATE INDEX idx_challenges_fields ON challenges USING GIN(research_field);
CREATE INDEX idx_challenges_published ON challenges(is_published) WHERE is_published = true;

-- -----------------------------------------------------------------------------
-- Research Nodes (Core Content Units - Network Structure)
-- -----------------------------------------------------------------------------
CREATE TABLE research_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  node_type node_type NOT NULL,

  -- Content (Tiptap JSON format)
  content JSONB NOT NULL DEFAULT '{}',
  summary TEXT,                         -- AI-generated or manual summary

  -- Hierarchy (optional - for loose organization)
  challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL,
  parent_node_id UUID REFERENCES research_nodes(id) ON DELETE SET NULL,

  -- Forking support
  forked_from_id UUID REFERENCES research_nodes(id) ON DELETE SET NULL,
  fork_count INTEGER DEFAULT 0,

  -- Scientific metadata
  hypothesis TEXT,                      -- If applicable
  methodology TEXT,                     -- Research method used
  confidence_level DECIMAL(3,2),        -- 0.00 to 1.00

  -- AI/Embeddings
  embedding vector(1536),               -- OpenAI embeddings for similarity search
  ai_analysis JSONB,                    -- AI-generated insights

  -- Visibility & Status
  is_public BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,    -- Peer-reviewed/verified
  version INTEGER DEFAULT 1,

  -- Collaboration
  is_collaborative BOOLEAN DEFAULT false,

  -- Metrics
  view_count INTEGER DEFAULT 0,
  citation_count INTEGER DEFAULT 0,

  -- Ownership
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(created_by, slug)
);

CREATE INDEX idx_nodes_challenge ON research_nodes(challenge_id);
CREATE INDEX idx_nodes_type ON research_nodes(node_type);
CREATE INDEX idx_nodes_creator ON research_nodes(created_by);
CREATE INDEX idx_nodes_public ON research_nodes(is_public) WHERE is_public = true;
CREATE INDEX idx_nodes_embedding ON research_nodes USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- -----------------------------------------------------------------------------
-- Knowledge Graph (Connections between nodes)
-- -----------------------------------------------------------------------------
CREATE TABLE knowledge_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  source_node_id UUID REFERENCES research_nodes(id) ON DELETE CASCADE NOT NULL,
  target_node_id UUID REFERENCES research_nodes(id) ON DELETE CASCADE NOT NULL,

  link_type link_type NOT NULL,
  strength DECIMAL(3,2) DEFAULT 1.00,   -- Link strength 0-1
  description TEXT,                      -- Why this connection exists

  -- Context
  context_snippet TEXT,                  -- The text that created this link

  -- Validation
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES profiles(id),

  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(source_node_id, target_node_id, link_type)
);

CREATE INDEX idx_links_source ON knowledge_links(source_node_id);
CREATE INDEX idx_links_target ON knowledge_links(target_node_id);
CREATE INDEX idx_links_type ON knowledge_links(link_type);

-- -----------------------------------------------------------------------------
-- Artifacts (Student Submissions & Outputs)
-- -----------------------------------------------------------------------------
CREATE TABLE artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic info
  title TEXT NOT NULL,
  description TEXT,
  artifact_type artifact_type NOT NULL,

  -- Content
  content JSONB,                        -- Structured content (Tiptap JSON)
  file_url TEXT,                        -- If file-based
  file_metadata JSONB,                  -- File size, type, etc.
  external_url TEXT,                    -- Link to external resource

  -- Relations
  challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL,
  research_node_id UUID REFERENCES research_nodes(id) ON DELETE SET NULL,

  -- Review status
  is_submitted BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ,
  review_status TEXT DEFAULT 'pending', -- pending, in_review, approved, revision_requested
  review_feedback JSONB,

  -- Gamification
  xp_earned INTEGER DEFAULT 0,

  -- Ownership
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_artifacts_type ON artifacts(artifact_type);
CREATE INDEX idx_artifacts_challenge ON artifacts(challenge_id);
CREATE INDEX idx_artifacts_creator ON artifacts(created_by);

-- =============================================================================
-- COLLABORATION & TEAMS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Teams (Research Groups)
-- -----------------------------------------------------------------------------
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  avatar_url TEXT,

  -- Focus
  challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL,
  research_focus TEXT,

  -- Settings
  is_public BOOLEAN DEFAULT true,
  max_members INTEGER DEFAULT 10,
  join_policy TEXT DEFAULT 'approval',  -- open, approval, invite_only

  -- Stats
  total_xp INTEGER DEFAULT 0,

  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_teams_slug ON teams(slug);
CREATE INDEX idx_teams_challenge ON teams(challenge_id);

-- -----------------------------------------------------------------------------
-- Team Members
-- -----------------------------------------------------------------------------
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role team_role DEFAULT 'member',

  joined_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

-- -----------------------------------------------------------------------------
-- Node Collaborators (Who can edit a research node)
-- -----------------------------------------------------------------------------
CREATE TABLE node_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  node_id UUID REFERENCES research_nodes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  can_edit BOOLEAN DEFAULT true,
  can_delete BOOLEAN DEFAULT false,
  can_invite BOOLEAN DEFAULT false,

  invited_by UUID REFERENCES profiles(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(node_id, user_id)
);

CREATE INDEX idx_collaborators_node ON node_collaborators(node_id);
CREATE INDEX idx_collaborators_user ON node_collaborators(user_id);

-- =============================================================================
-- GAMIFICATION
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Badges (Achievement Definitions)
-- -----------------------------------------------------------------------------
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,

  category badge_category NOT NULL,

  -- Requirements
  requirement_type TEXT NOT NULL,       -- xp, nodes_created, peer_reviews, etc.
  requirement_value INTEGER NOT NULL,
  requirement_metadata JSONB,           -- Additional requirements

  -- Rewards
  xp_bonus INTEGER DEFAULT 0,

  -- Rarity
  is_rare BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,      -- Secret achievements

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_badges_category ON badges(category);
CREATE INDEX idx_badges_slug ON badges(slug);

-- -----------------------------------------------------------------------------
-- User Badges (Earned achievements)
-- -----------------------------------------------------------------------------
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,

  earned_at TIMESTAMPTZ DEFAULT NOW(),

  -- Context
  earned_for TEXT,                      -- What triggered this badge

  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);

-- -----------------------------------------------------------------------------
-- XP Transactions (Audit log for XP changes)
-- -----------------------------------------------------------------------------
CREATE TABLE xp_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,

  -- Source reference
  source_type TEXT,                     -- challenge, node, artifact, badge, etc.
  source_id UUID,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_xp_transactions_user ON xp_transactions(user_id);
CREATE INDEX idx_xp_transactions_date ON xp_transactions(created_at DESC);

-- =============================================================================
-- PROGRESS TRACKING
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Challenge Progress
-- -----------------------------------------------------------------------------
CREATE TABLE challenge_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,

  status TEXT DEFAULT 'not_started',    -- not_started, in_progress, completed
  progress_percentage DECIMAL(5,2) DEFAULT 0,

  -- Milestones completed
  milestones JSONB DEFAULT '[]',

  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, challenge_id)
);

CREATE INDEX idx_challenge_progress_user ON challenge_progress(user_id);
CREATE INDEX idx_challenge_progress_challenge ON challenge_progress(challenge_id);

-- -----------------------------------------------------------------------------
-- Node Interactions (Views, reactions, bookmarks)
-- -----------------------------------------------------------------------------
CREATE TABLE node_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  node_id UUID REFERENCES research_nodes(id) ON DELETE CASCADE NOT NULL,

  interaction_type TEXT NOT NULL,       -- view, like, bookmark, cite

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, node_id, interaction_type)
);

CREATE INDEX idx_interactions_user ON node_interactions(user_id);
CREATE INDEX idx_interactions_node ON node_interactions(node_id);

-- =============================================================================
-- COMMENTS & DISCUSSIONS
-- =============================================================================

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Polymorphic relation
  commentable_type TEXT NOT NULL,       -- research_node, artifact, challenge
  commentable_id UUID NOT NULL,

  -- Threading
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,

  -- Content
  content JSONB NOT NULL,               -- Tiptap JSON for rich comments

  -- Reactions
  reactions JSONB DEFAULT '{}',

  -- Moderation
  is_hidden BOOLEAN DEFAULT false,

  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_target ON comments(commentable_type, commentable_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_comments_creator ON comments(created_by);

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  type TEXT NOT NULL,                   -- mention, comment, badge_earned, etc.
  title TEXT NOT NULL,
  body TEXT,

  -- Link to relevant content
  link_type TEXT,
  link_id UUID,

  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE node_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE node_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, update their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Challenges: Published challenges are public, admins can manage all
CREATE POLICY "Published challenges are viewable" ON challenges
  FOR SELECT USING (is_published = true OR created_by = auth.uid());

CREATE POLICY "Admins can manage challenges" ON challenges
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'mentor'))
  );

-- Research Nodes: Public nodes are readable, owners and collaborators can edit
CREATE POLICY "Public nodes are viewable" ON research_nodes
  FOR SELECT USING (
    is_public = true
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM node_collaborators
      WHERE node_id = research_nodes.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create nodes" ON research_nodes
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Owners can update nodes" ON research_nodes
  FOR UPDATE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM node_collaborators
      WHERE node_id = research_nodes.id AND user_id = auth.uid() AND can_edit = true
    )
  );

CREATE POLICY "Owners can delete nodes" ON research_nodes
  FOR DELETE USING (created_by = auth.uid());

-- Badges: Readable by all
CREATE POLICY "Badges are viewable" ON badges
  FOR SELECT USING (true);

-- User Badges: Users can see their own and others' public badges
CREATE POLICY "User badges are viewable" ON user_badges
  FOR SELECT USING (true);

-- Notifications: Users can only see their own
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_challenges_updated_at
  BEFORE UPDATE ON challenges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_research_nodes_updated_at
  BEFORE UPDATE ON research_nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_artifacts_updated_at
  BEFORE UPDATE ON artifacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to award XP and update user level
CREATE OR REPLACE FUNCTION award_xp(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT,
  p_source_type TEXT DEFAULT NULL,
  p_source_id UUID DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_new_xp INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Insert transaction record
  INSERT INTO xp_transactions (user_id, amount, reason, source_type, source_id)
  VALUES (p_user_id, p_amount, p_reason, p_source_type, p_source_id);

  -- Update user XP
  UPDATE profiles
  SET xp = xp + p_amount
  WHERE id = p_user_id
  RETURNING xp INTO v_new_xp;

  -- Calculate new level (every 1000 XP = 1 level)
  v_new_level := GREATEST(1, (v_new_xp / 1000) + 1);

  -- Update level if changed
  UPDATE profiles
  SET level = v_new_level
  WHERE id = p_user_id AND level != v_new_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update streak
CREATE OR REPLACE FUNCTION update_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_last_activity DATE;
  v_today DATE := CURRENT_DATE;
BEGIN
  SELECT streak_last_activity INTO v_last_activity
  FROM profiles WHERE id = p_user_id;

  IF v_last_activity IS NULL OR v_last_activity < v_today - INTERVAL '1 day' THEN
    -- Streak broken or first activity
    UPDATE profiles
    SET streak_days = 1, streak_last_activity = v_today
    WHERE id = p_user_id;
  ELSIF v_last_activity = v_today - INTERVAL '1 day' THEN
    -- Continue streak
    UPDATE profiles
    SET streak_days = streak_days + 1, streak_last_activity = v_today
    WHERE id = p_user_id;
  END IF;
  -- If v_last_activity = v_today, do nothing (already updated today)
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment fork count
CREATE OR REPLACE FUNCTION increment_fork_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.forked_from_id IS NOT NULL THEN
    UPDATE research_nodes
    SET fork_count = fork_count + 1
    WHERE id = NEW.forked_from_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_node_fork
  AFTER INSERT ON research_nodes
  FOR EACH ROW EXECUTE FUNCTION increment_fork_count();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- SEED DATA: Default Badges
-- =============================================================================

INSERT INTO badges (name, slug, description, category, requirement_type, requirement_value, xp_bonus) VALUES
-- Research badges
('First Hypothesis', 'first-hypothesis', 'Created your first research hypothesis', 'research', 'nodes_created_hypothesis', 1, 50),
('Data Pioneer', 'data-pioneer', 'Submitted your first dataset', 'research', 'artifacts_data', 1, 75),
('Published Researcher', 'published-researcher', 'Made 10 research nodes public', 'research', 'nodes_public', 10, 200),
('Citation Master', 'citation-master', 'Your work has been cited 50 times', 'research', 'citations_received', 50, 500),

-- Collaboration badges
('Team Player', 'team-player', 'Joined your first research team', 'collaboration', 'teams_joined', 1, 25),
('Peer Reviewer', 'peer-reviewer', 'Completed 5 peer reviews', 'collaboration', 'peer_reviews', 5, 150),
('Mentor', 'mentor-badge', 'Helped 10 other researchers', 'collaboration', 'help_given', 10, 300),

-- Mastery badges
('Physics Explorer', 'physics-explorer', 'Completed 5 physics challenges', 'mastery', 'challenges_physics', 5, 250),
('Code Wizard', 'code-wizard', 'Submitted 20 code artifacts', 'mastery', 'artifacts_code', 20, 200),

-- Streak badges
('Week Warrior', 'week-warrior', 'Maintained a 7-day streak', 'streak', 'streak_days', 7, 100),
('Month Master', 'month-master', 'Maintained a 30-day streak', 'streak', 'streak_days', 30, 500),

-- Contribution badges
('Knowledge Architect', 'knowledge-architect', 'Created 100 knowledge links', 'contribution', 'links_created', 100, 400),
('Community Builder', 'community-builder', 'Received 100 likes on your work', 'contribution', 'likes_received', 100, 300);

-- =============================================================================
-- VIEWS (For common queries)
-- =============================================================================

-- Leaderboard view
CREATE VIEW leaderboard AS
SELECT
  p.id,
  p.display_name,
  p.avatar_url,
  p.xp,
  p.level,
  p.streak_days,
  COUNT(DISTINCT rn.id) as nodes_count,
  COUNT(DISTINCT ub.badge_id) as badges_count
FROM profiles p
LEFT JOIN research_nodes rn ON rn.created_by = p.id
LEFT JOIN user_badges ub ON ub.user_id = p.id
GROUP BY p.id
ORDER BY p.xp DESC;

-- User stats view
CREATE VIEW user_stats AS
SELECT
  p.id as user_id,
  p.xp,
  p.level,
  p.streak_days,
  COUNT(DISTINCT rn.id) FILTER (WHERE rn.created_by = p.id) as nodes_created,
  COUNT(DISTINCT a.id) FILTER (WHERE a.created_by = p.id) as artifacts_created,
  COUNT(DISTINCT kl.id) FILTER (WHERE kl.created_by = p.id) as links_created,
  COUNT(DISTINCT ub.badge_id) as badges_earned,
  COUNT(DISTINCT tm.team_id) as teams_joined
FROM profiles p
LEFT JOIN research_nodes rn ON rn.created_by = p.id
LEFT JOIN artifacts a ON a.created_by = p.id
LEFT JOIN knowledge_links kl ON kl.created_by = p.id
LEFT JOIN user_badges ub ON ub.user_id = p.id
LEFT JOIN team_members tm ON tm.user_id = p.id
GROUP BY p.id;

-- =============================================================================
-- COMMENTS
-- =============================================================================
--
-- This schema supports:
-- 1. Challenge-based learning with scientific problems
-- 2. Network-structured research nodes (not hierarchical)
-- 3. Knowledge graph with typed connections
-- 4. Team collaboration and shared editing
-- 5. Gamification with XP, levels, badges, and streaks
-- 6. AI integration with vector embeddings
-- 7. Progress tracking and interactions
-- 8. Row-level security for multi-tenant safety
--
-- To use with Supabase:
-- 1. Create a new Supabase project
-- 2. Run this schema in the SQL editor
-- 3. Configure environment variables in your Next.js app
--
