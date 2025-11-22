-- NextGen Research-LMS: Graph-based Distributed Research Network
-- Schema Upgrade v2.0 - Git-Lite & Scientific Workbench
--
-- This upgrade adds:
-- 1. Git-Lite versioning (snapshots, branches, publication requests)
-- 2. Enhanced knowledge graph functions
-- 3. Vector similarity search
-- 4. Real-time collaboration support

-- =============================================================================
-- PART 1: GIT-LITE VERSIONING SYSTEM
-- =============================================================================

-- Publication request status
CREATE TYPE publication_status AS ENUM (
  'draft',              -- Initial state, not submitted
  'submitted',          -- Awaiting review
  'in_review',          -- Currently being reviewed
  'revision_requested', -- Needs changes
  'approved',           -- Approved, pending merge
  'published',          -- Merged into main knowledge base
  'rejected'            -- Not accepted
);

-- Branch types
CREATE TYPE branch_type AS ENUM (
  'main',               -- Primary/canonical version
  'fork',               -- Independent fork by another user
  'experiment',         -- Experimental branch
  'revision'            -- Revision branch for review
);

-- Add missing columns to research_nodes for Git-Lite
ALTER TABLE research_nodes ADD COLUMN IF NOT EXISTS root_id UUID REFERENCES research_nodes(id) ON DELETE SET NULL;
ALTER TABLE research_nodes ADD COLUMN IF NOT EXISTS branch_type branch_type DEFAULT 'main';
ALTER TABLE research_nodes ADD COLUMN IF NOT EXISTS branch_name TEXT;
ALTER TABLE research_nodes ADD COLUMN IF NOT EXISTS is_canonical BOOLEAN DEFAULT false;  -- Is this the "main" version?

-- Create index for root lineage queries
CREATE INDEX IF NOT EXISTS idx_nodes_root ON research_nodes(root_id);
CREATE INDEX IF NOT EXISTS idx_nodes_canonical ON research_nodes(is_canonical) WHERE is_canonical = true;

-- -----------------------------------------------------------------------------
-- Node Versions (Snapshots/History)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS node_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  node_id UUID REFERENCES research_nodes(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,

  -- Snapshot of content at this version
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  summary TEXT,

  -- Scientific metadata at this version
  hypothesis TEXT,
  methodology TEXT,
  structured_content JSONB,  -- {hypothesis: {...}, method: {...}, data: {...}, conclusion: {...}}

  -- Change metadata
  change_message TEXT,       -- Commit message describing changes
  change_type TEXT,          -- major, minor, patch
  diff_from_previous JSONB,  -- JSON diff from previous version

  -- Authorship
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(node_id, version_number)
);

CREATE INDEX idx_versions_node ON node_versions(node_id);
CREATE INDEX idx_versions_created ON node_versions(created_at DESC);

-- -----------------------------------------------------------------------------
-- Publication Requests (Pull Requests / Peer Review)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS publication_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- What's being submitted
  node_id UUID REFERENCES research_nodes(id) ON DELETE CASCADE NOT NULL,
  version_id UUID REFERENCES node_versions(id) ON DELETE SET NULL,

  -- Target (where to merge)
  target_node_id UUID REFERENCES research_nodes(id) ON DELETE SET NULL,  -- If merging into existing
  target_challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL, -- If submitting to challenge

  -- Request details
  title TEXT NOT NULL,
  description TEXT,
  publication_type TEXT NOT NULL,  -- 'new_publication', 'merge_request', 'challenge_submission'

  -- Status
  status publication_status DEFAULT 'draft',

  -- Review process
  reviewer_id UUID REFERENCES profiles(id),
  review_notes JSONB,              -- Array of review comments
  review_score DECIMAL(3,2),       -- 0-1 score

  -- AI Analysis
  ai_review JSONB,                 -- Automated review results
  similarity_report JSONB,         -- Plagiarism/similarity check

  -- Timestamps
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,

  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pub_requests_node ON publication_requests(node_id);
CREATE INDEX idx_pub_requests_status ON publication_requests(status);
CREATE INDEX idx_pub_requests_reviewer ON publication_requests(reviewer_id);

-- -----------------------------------------------------------------------------
-- Review Assignments (Who reviews what)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS review_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  publication_request_id UUID REFERENCES publication_requests(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Assignment details
  assigned_by UUID REFERENCES profiles(id),
  role TEXT DEFAULT 'reviewer',  -- 'reviewer', 'mentor', 'ai'

  -- Review
  status TEXT DEFAULT 'pending',  -- pending, in_progress, completed, declined
  review_content JSONB,
  recommendation TEXT,            -- approve, request_changes, reject

  -- Timestamps
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  UNIQUE(publication_request_id, reviewer_id)
);

-- =============================================================================
-- PART 2: ENHANCED KNOWLEDGE GRAPH
-- =============================================================================

-- Add weight/importance to edges
ALTER TABLE knowledge_links ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2) DEFAULT 1.0;
ALTER TABLE knowledge_links ADD COLUMN IF NOT EXISTS is_bidirectional BOOLEAN DEFAULT false;
ALTER TABLE knowledge_links ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add more link types for scientific reasoning
DO $$
BEGIN
  -- Add new values to link_type enum if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'proves' AND enumtypid = 'link_type'::regtype) THEN
    ALTER TYPE link_type ADD VALUE 'proves';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'disproves' AND enumtypid = 'link_type'::regtype) THEN
    ALTER TYPE link_type ADD VALUE 'disproves';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'cites' AND enumtypid = 'link_type'::regtype) THEN
    ALTER TYPE link_type ADD VALUE 'cites';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'inspired_by' AND enumtypid = 'link_type'::regtype) THEN
    ALTER TYPE link_type ADD VALUE 'inspired_by';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'methodology_from' AND enumtypid = 'link_type'::regtype) THEN
    ALTER TYPE link_type ADD VALUE 'methodology_from';
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- PART 3: REAL-TIME COLLABORATION
-- =============================================================================

-- Active editing sessions for real-time collaboration
CREATE TABLE IF NOT EXISTS editing_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  node_id UUID REFERENCES research_nodes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Session info
  cursor_position JSONB,        -- {line, column, selection}
  last_content_hash TEXT,       -- For conflict detection

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,

  UNIQUE(node_id, user_id)
);

CREATE INDEX idx_editing_sessions_node ON editing_sessions(node_id);
CREATE INDEX idx_editing_sessions_active ON editing_sessions(node_id, is_active) WHERE is_active = true;

-- Collaboration events (for Supabase Realtime)
CREATE TABLE IF NOT EXISTS collaboration_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  node_id UUID REFERENCES research_nodes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES editing_sessions(id) ON DELETE CASCADE,

  -- Event details
  event_type TEXT NOT NULL,      -- 'cursor_move', 'selection', 'edit', 'comment', 'presence'
  event_data JSONB NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partition by time for performance (keep last 24 hours)
CREATE INDEX idx_collab_events_node ON collaboration_events(node_id, created_at DESC);

-- =============================================================================
-- PART 4: VECTOR SIMILARITY SEARCH FUNCTIONS
-- =============================================================================

-- Function: Find similar nodes by vector embedding
CREATE OR REPLACE FUNCTION search_similar_nodes(
  query_embedding vector(1536),
  match_threshold DECIMAL DEFAULT 0.7,
  match_count INTEGER DEFAULT 10,
  filter_node_type node_type DEFAULT NULL,
  exclude_node_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  node_type node_type,
  summary TEXT,
  similarity DECIMAL,
  created_by UUID,
  is_public BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rn.id,
    rn.title,
    rn.node_type,
    rn.summary,
    (1 - (rn.embedding <=> query_embedding))::DECIMAL as similarity,
    rn.created_by,
    rn.is_public
  FROM research_nodes rn
  WHERE
    rn.embedding IS NOT NULL
    AND (filter_node_type IS NULL OR rn.node_type = filter_node_type)
    AND (exclude_node_id IS NULL OR rn.id != exclude_node_id)
    AND rn.is_public = true
    AND (1 - (rn.embedding <=> query_embedding)) > match_threshold
  ORDER BY rn.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Find conflicting hypotheses
CREATE OR REPLACE FUNCTION find_conflicting_hypotheses(
  p_node_id UUID,
  match_threshold DECIMAL DEFAULT 0.75
)
RETURNS TABLE (
  conflicting_node_id UUID,
  conflicting_title TEXT,
  similarity DECIMAL,
  link_type link_type,
  conflict_reason TEXT
) AS $$
DECLARE
  v_embedding vector(1536);
  v_hypothesis TEXT;
BEGIN
  -- Get the embedding and hypothesis of the source node
  SELECT embedding, hypothesis INTO v_embedding, v_hypothesis
  FROM research_nodes WHERE id = p_node_id;

  IF v_embedding IS NULL THEN
    RETURN;
  END IF;

  -- Find similar nodes that have contradicting relationships
  RETURN QUERY
  SELECT
    rn.id as conflicting_node_id,
    rn.title as conflicting_title,
    (1 - (rn.embedding <=> v_embedding))::DECIMAL as similarity,
    kl.link_type,
    CASE
      WHEN kl.link_type = 'contradicts' THEN 'Direct contradiction found'
      WHEN kl.link_type = 'disproves' THEN 'This hypothesis has been disproven by related research'
      ELSE 'High similarity with different conclusion'
    END as conflict_reason
  FROM research_nodes rn
  LEFT JOIN knowledge_links kl ON (
    (kl.source_node_id = p_node_id AND kl.target_node_id = rn.id)
    OR (kl.target_node_id = p_node_id AND kl.source_node_id = rn.id)
  )
  WHERE
    rn.id != p_node_id
    AND rn.embedding IS NOT NULL
    AND rn.node_type IN ('hypothesis', 'synthesis', 'analysis')
    AND rn.is_public = true
    AND (
      kl.link_type IN ('contradicts', 'disproves')
      OR (1 - (rn.embedding <=> v_embedding)) > match_threshold
    )
  ORDER BY similarity DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Function: Get knowledge graph neighbors
CREATE OR REPLACE FUNCTION get_graph_neighbors(
  p_node_id UUID,
  p_depth INTEGER DEFAULT 2,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  node_id UUID,
  title TEXT,
  node_type node_type,
  depth INTEGER,
  path UUID[],
  link_types link_type[]
) AS $$
WITH RECURSIVE graph_walk AS (
  -- Base case: starting node
  SELECT
    rn.id as node_id,
    rn.title,
    rn.node_type,
    0 as depth,
    ARRAY[rn.id] as path,
    ARRAY[]::link_type[] as link_types
  FROM research_nodes rn
  WHERE rn.id = p_node_id

  UNION ALL

  -- Recursive case: neighbors
  SELECT
    CASE
      WHEN kl.source_node_id = gw.node_id THEN kl.target_node_id
      ELSE kl.source_node_id
    END as node_id,
    rn.title,
    rn.node_type,
    gw.depth + 1,
    gw.path || rn.id,
    gw.link_types || kl.link_type
  FROM graph_walk gw
  JOIN knowledge_links kl ON (
    kl.source_node_id = gw.node_id OR kl.target_node_id = gw.node_id
  )
  JOIN research_nodes rn ON (
    rn.id = CASE
      WHEN kl.source_node_id = gw.node_id THEN kl.target_node_id
      ELSE kl.source_node_id
    END
  )
  WHERE
    gw.depth < p_depth
    AND NOT (rn.id = ANY(gw.path))  -- Prevent cycles
)
SELECT DISTINCT ON (gw.node_id)
  gw.node_id,
  gw.title,
  gw.node_type,
  gw.depth,
  gw.path,
  gw.link_types
FROM graph_walk gw
WHERE gw.node_id != p_node_id
ORDER BY gw.node_id, gw.depth
LIMIT p_limit;
$$ LANGUAGE sql;

-- =============================================================================
-- PART 5: VERSION CONTROL FUNCTIONS
-- =============================================================================

-- Function: Create a new version snapshot
CREATE OR REPLACE FUNCTION create_node_version(
  p_node_id UUID,
  p_change_message TEXT DEFAULT 'Updated content',
  p_change_type TEXT DEFAULT 'minor'
)
RETURNS UUID AS $$
DECLARE
  v_node research_nodes%ROWTYPE;
  v_new_version INTEGER;
  v_version_id UUID;
BEGIN
  -- Get current node
  SELECT * INTO v_node FROM research_nodes WHERE id = p_node_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Node not found';
  END IF;

  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_new_version
  FROM node_versions WHERE node_id = p_node_id;

  -- Create version snapshot
  INSERT INTO node_versions (
    node_id, version_number, title, content, summary,
    hypothesis, methodology, change_message, change_type, created_by
  ) VALUES (
    p_node_id, v_new_version, v_node.title, v_node.content, v_node.summary,
    v_node.hypothesis, v_node.methodology, p_change_message, p_change_type, v_node.created_by
  ) RETURNING id INTO v_version_id;

  -- Update node's version counter
  UPDATE research_nodes SET version = v_new_version WHERE id = p_node_id;

  RETURN v_version_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Fork a node
CREATE OR REPLACE FUNCTION fork_node(
  p_source_node_id UUID,
  p_user_id UUID,
  p_new_title TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_source research_nodes%ROWTYPE;
  v_new_node_id UUID;
  v_root_id UUID;
BEGIN
  -- Get source node
  SELECT * INTO v_source FROM research_nodes WHERE id = p_source_node_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Source node not found';
  END IF;

  -- Determine root (either source's root or source itself)
  v_root_id := COALESCE(v_source.root_id, p_source_node_id);

  -- Create forked node
  INSERT INTO research_nodes (
    title, slug, node_type, content, summary, challenge_id,
    forked_from_id, root_id, branch_type, hypothesis, methodology,
    embedding, is_public, created_by
  ) VALUES (
    COALESCE(p_new_title, v_source.title || ' (Fork)'),
    v_source.slug || '-fork-' || substr(gen_random_uuid()::text, 1, 8),
    v_source.node_type,
    v_source.content,
    v_source.summary,
    v_source.challenge_id,
    p_source_node_id,
    v_root_id,
    'fork',
    v_source.hypothesis,
    v_source.methodology,
    v_source.embedding,
    false,  -- Forks start as private
    p_user_id
  ) RETURNING id INTO v_new_node_id;

  -- Create knowledge link for fork relationship
  INSERT INTO knowledge_links (source_node_id, target_node_id, link_type, created_by)
  VALUES (v_new_node_id, p_source_node_id, 'fork', p_user_id);

  -- Award XP for forking
  PERFORM award_xp(p_user_id, 10, 'Forked a research node', 'node', v_new_node_id);

  RETURN v_new_node_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Submit for publication
CREATE OR REPLACE FUNCTION submit_for_publication(
  p_node_id UUID,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_target_challenge_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_version_id UUID;
  v_request_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();

  -- Create a version snapshot first
  v_version_id := create_node_version(p_node_id, 'Submitted for publication', 'major');

  -- Create publication request
  INSERT INTO publication_requests (
    node_id, version_id, target_challenge_id,
    title, description, publication_type, status, submitted_at, created_by
  ) VALUES (
    p_node_id, v_version_id, p_target_challenge_id,
    p_title, p_description,
    CASE WHEN p_target_challenge_id IS NOT NULL THEN 'challenge_submission' ELSE 'new_publication' END,
    'submitted',
    NOW(),
    v_user_id
  ) RETURNING id INTO v_request_id;

  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- PART 6: STRUCTURED CONTENT SUPPORT
-- =============================================================================

-- Add structured_content to research_nodes for scientific structure
ALTER TABLE research_nodes ADD COLUMN IF NOT EXISTS structured_content JSONB DEFAULT '{}';
-- Schema: {
--   "hypothesis": { "content": {...}, "confidence": 0.8 },
--   "methodology": { "content": {...}, "type": "experimental" },
--   "data": { "content": {...}, "datasets": [...], "visualizations": [...] },
--   "conclusion": { "content": {...}, "supports_hypothesis": true }
-- }

-- Add data_attachments for datasets and visualizations
ALTER TABLE research_nodes ADD COLUMN IF NOT EXISTS data_attachments JSONB DEFAULT '[]';
-- Schema: [
--   { "id": "uuid", "type": "dataset", "name": "...", "url": "...", "schema": {...} },
--   { "id": "uuid", "type": "chart", "chartType": "line", "data": {...}, "config": {...} }
-- ]

-- =============================================================================
-- PART 7: RLS POLICIES FOR NEW TABLES
-- =============================================================================

ALTER TABLE node_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE publication_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE editing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_events ENABLE ROW LEVEL SECURITY;

-- Node versions: viewable if you can view the node
CREATE POLICY "Node versions follow node visibility" ON node_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM research_nodes rn
      WHERE rn.id = node_versions.node_id
      AND (rn.is_public = true OR rn.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can create versions of their nodes" ON node_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM research_nodes rn
      WHERE rn.id = node_versions.node_id
      AND rn.created_by = auth.uid()
    )
  );

-- Publication requests
CREATE POLICY "Users can view their own requests" ON publication_requests
  FOR SELECT USING (created_by = auth.uid() OR reviewer_id = auth.uid());

CREATE POLICY "Users can create requests" ON publication_requests
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own requests" ON publication_requests
  FOR UPDATE USING (created_by = auth.uid() OR reviewer_id = auth.uid());

-- Editing sessions (for real-time)
CREATE POLICY "Users can manage their sessions" ON editing_sessions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "View active sessions on accessible nodes" ON editing_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM research_nodes rn
      WHERE rn.id = editing_sessions.node_id
      AND (rn.is_public = true OR rn.created_by = auth.uid())
    )
  );

-- Collaboration events (for real-time broadcasts)
CREATE POLICY "Users can create their own events" ON collaboration_events
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view events on accessible nodes" ON collaboration_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM research_nodes rn
      WHERE rn.id = collaboration_events.node_id
      AND (rn.is_public = true OR rn.created_by = auth.uid())
    )
  );

-- =============================================================================
-- PART 8: REALTIME SUBSCRIPTIONS
-- =============================================================================

-- Enable realtime for collaboration tables
ALTER PUBLICATION supabase_realtime ADD TABLE editing_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE collaboration_events;

-- =============================================================================
-- COMMENTS
-- =============================================================================
--
-- This upgrade adds:
-- 1. Git-Lite versioning with snapshots and publication workflow
-- 2. Fork tracking with root_id for lineage
-- 3. Publication requests for peer review
-- 4. Vector similarity search for AI-powered discovery
-- 5. Graph traversal for knowledge exploration
-- 6. Real-time collaboration support
-- 7. Structured scientific content fields
--
-- Run this after the initial schema.sql
--
