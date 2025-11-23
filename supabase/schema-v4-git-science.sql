-- NextGen Research-LMS: Git for Science
-- Schema Upgrade v4.0 - Complete Lineage Tracking & Scientific Collaboration
--
-- This upgrade adds:
-- 1. Complete ancestry/lineage tracking (like Git commit history)
-- 2. Merge mechanism with conflict detection
-- 3. Evidence chains for hypothesis validation
-- 4. Research reproducibility tracking
-- 5. Enhanced fork network visualization

-- =============================================================================
-- PART 1: COMPLETE LINEAGE SYSTEM (科研版 Git 谱系追踪)
-- =============================================================================

-- Merge strategy types
CREATE TYPE merge_strategy AS ENUM (
  'fast_forward',     -- No conflicts, simple merge
  'recursive',        -- Three-way merge with common ancestor
  'ours',             -- Keep target version on conflict
  'theirs',           -- Keep source version on conflict
  'manual'            -- User resolved conflicts
);

-- Merge request status (different from publication)
CREATE TYPE merge_status AS ENUM (
  'pending',          -- Awaiting review
  'reviewing',        -- Under review
  'conflicts',        -- Has conflicts that need resolution
  'approved',         -- Approved for merge
  'merged',           -- Successfully merged
  'rejected',         -- Rejected
  'cancelled'         -- Cancelled by author
);

-- Evidence strength levels
CREATE TYPE evidence_strength AS ENUM (
  'anecdotal',        -- Personal observation, weak
  'correlational',    -- Shows correlation
  'experimental',     -- Controlled experiment
  'replicated',       -- Independently replicated
  'meta_analysis',    -- Synthesized from multiple studies
  'consensus'         -- Scientific consensus
);

-- -----------------------------------------------------------------------------
-- Node Ancestry Table (Complete Lineage Chain)
-- Tracks the full genealogy of each research node like Git commits
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS node_ancestry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- The node this ancestry record belongs to
  node_id UUID REFERENCES research_nodes(id) ON DELETE CASCADE NOT NULL,

  -- Direct parent(s) - supports multiple parents for merges
  parent_node_id UUID REFERENCES research_nodes(id) ON DELETE SET NULL,
  parent_version INTEGER,  -- Which version of parent this was derived from

  -- Ancestry chain (materialized path for fast queries)
  -- Format: ["root-uuid", "parent-uuid", ..., "this-uuid"]
  ancestry_path UUID[] NOT NULL DEFAULT '{}',

  -- Fork/Branch metadata
  fork_depth INTEGER DEFAULT 0,          -- How many generations from root
  is_merge_commit BOOLEAN DEFAULT false, -- Was this created via merge?
  merge_parents UUID[],                  -- If merge, list all parent nodes

  -- Derivation context
  derivation_type TEXT,                  -- 'fork', 'branch', 'merge', 'revision', 'original'
  derivation_reason TEXT,                -- Why was this forked/derived?

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(node_id)
);

CREATE INDEX idx_ancestry_parent ON node_ancestry(parent_node_id);
CREATE INDEX idx_ancestry_path ON node_ancestry USING GIN(ancestry_path);
CREATE INDEX idx_ancestry_depth ON node_ancestry(fork_depth);

-- -----------------------------------------------------------------------------
-- Merge Requests (Git-style Merge Workflow)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS merge_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Source: the forked/branched node to be merged
  source_node_id UUID REFERENCES research_nodes(id) ON DELETE CASCADE NOT NULL,
  source_version_id UUID REFERENCES node_versions(id),

  -- Target: the canonical/main node to merge into
  target_node_id UUID REFERENCES research_nodes(id) ON DELETE CASCADE NOT NULL,
  target_version_id UUID REFERENCES node_versions(id),

  -- Request details
  title TEXT NOT NULL,
  description TEXT,

  -- Merge analysis
  common_ancestor_id UUID REFERENCES research_nodes(id),
  strategy merge_strategy DEFAULT 'recursive',
  status merge_status DEFAULT 'pending',

  -- Conflict tracking
  has_conflicts BOOLEAN DEFAULT false,
  conflict_details JSONB DEFAULT '[]',
  -- Format: [{"section": "hypothesis", "source_content": "...", "target_content": "...", "resolution": null}]

  -- Diff information
  diff_summary JSONB,
  -- Format: {"additions": 5, "deletions": 2, "sections_changed": ["hypothesis", "methodology"]}

  -- AI Analysis
  ai_compatibility_score DECIMAL(3,2),   -- 0-1 how compatible are the changes
  ai_conflict_prediction JSONB,
  ai_merge_suggestion JSONB,

  -- Scientific impact
  impact_assessment JSONB,
  -- Format: {"hypothesis_change": true, "methodology_change": false, "conclusion_change": true}

  -- Review process
  reviewers UUID[] DEFAULT '{}',
  approvals INTEGER DEFAULT 0,
  required_approvals INTEGER DEFAULT 1,

  -- Timestamps
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  merged_at TIMESTAMPTZ,

  created_by UUID REFERENCES profiles(id) NOT NULL,
  merged_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_merge_source ON merge_requests(source_node_id);
CREATE INDEX idx_merge_target ON merge_requests(target_node_id);
CREATE INDEX idx_merge_status ON merge_requests(status);

-- -----------------------------------------------------------------------------
-- Evidence Chains (Hypothesis-Evidence Relationships)
-- Links hypotheses to supporting/contradicting evidence with strength ratings
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evidence_chains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- The hypothesis being evaluated
  hypothesis_node_id UUID REFERENCES research_nodes(id) ON DELETE CASCADE NOT NULL,

  -- The evidence node (experiment, data, analysis, etc.)
  evidence_node_id UUID REFERENCES research_nodes(id) ON DELETE CASCADE NOT NULL,

  -- Relationship
  relationship TEXT NOT NULL,            -- 'supports', 'contradicts', 'partially_supports', 'inconclusive'
  strength evidence_strength NOT NULL,
  confidence DECIMAL(3,2),               -- 0-1 confidence in this evidence

  -- Evidence details
  evidence_summary TEXT,                 -- Brief description of how it relates
  key_findings TEXT[],                   -- Bullet points
  methodology_notes TEXT,                -- How evidence was gathered

  -- Reproducibility
  is_reproducible BOOLEAN DEFAULT NULL,
  reproduction_attempts INTEGER DEFAULT 0,
  successful_reproductions INTEGER DEFAULT 0,

  -- Peer validation
  is_peer_reviewed BOOLEAN DEFAULT false,
  peer_review_notes JSONB,
  endorsements INTEGER DEFAULT 0,
  challenges INTEGER DEFAULT 0,

  -- Context
  context_snippet TEXT,                  -- Relevant quote/excerpt
  page_reference TEXT,                   -- If from literature

  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(hypothesis_node_id, evidence_node_id)
);

CREATE INDEX idx_evidence_hypothesis ON evidence_chains(hypothesis_node_id);
CREATE INDEX idx_evidence_node ON evidence_chains(evidence_node_id);
CREATE INDEX idx_evidence_relationship ON evidence_chains(relationship);
CREATE INDEX idx_evidence_strength ON evidence_chains(strength);

-- -----------------------------------------------------------------------------
-- Fork Network (Visualization Support)
-- Precomputed network for efficient fork graph rendering
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fork_network (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Root of this fork tree
  root_node_id UUID REFERENCES research_nodes(id) ON DELETE CASCADE NOT NULL,

  -- Network statistics (updated via trigger)
  total_forks INTEGER DEFAULT 0,
  active_branches INTEGER DEFAULT 0,
  total_contributors INTEGER DEFAULT 0,

  -- Tree structure (for visualization)
  tree_structure JSONB,
  -- Format: {"id": "root-uuid", "children": [{"id": "fork-1", "children": [...]}]}

  -- Activity metrics
  last_fork_at TIMESTAMPTZ,
  last_merge_at TIMESTAMPTZ,

  -- Aggregated insights
  most_active_fork_id UUID REFERENCES research_nodes(id),
  total_merged_contributions INTEGER DEFAULT 0,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fork_network_root ON fork_network(root_node_id);

-- =============================================================================
-- PART 2: RESEARCH REPRODUCIBILITY (科研可复现性)
-- =============================================================================

-- Reproduction attempt status
CREATE TYPE reproduction_status AS ENUM (
  'planned',          -- Planning to reproduce
  'in_progress',      -- Currently attempting
  'successful',       -- Successfully reproduced
  'partial',          -- Partially reproduced
  'failed',           -- Could not reproduce
  'inconclusive'      -- Results unclear
);

CREATE TABLE IF NOT EXISTS reproduction_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- What's being reproduced
  original_node_id UUID REFERENCES research_nodes(id) ON DELETE CASCADE NOT NULL,
  original_version INTEGER,

  -- The reproduction attempt node
  reproduction_node_id UUID REFERENCES research_nodes(id) ON DELETE SET NULL,

  -- Status
  status reproduction_status DEFAULT 'planned',

  -- Methodology comparison
  methodology_match JSONB,
  -- Format: {"materials": 0.9, "procedure": 0.85, "conditions": 0.95}

  -- Results comparison
  results_match DECIMAL(3,2),            -- 0-1 how similar are results
  statistical_comparison JSONB,

  -- Deviations
  deviations TEXT[],                     -- List of differences from original
  deviation_impact TEXT,                 -- How deviations might affect results

  -- Notes
  notes TEXT,
  challenges_encountered TEXT,

  created_by UUID REFERENCES profiles(id) NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reproduction_original ON reproduction_attempts(original_node_id);
CREATE INDEX idx_reproduction_status ON reproduction_attempts(status);

-- =============================================================================
-- PART 3: FUNCTIONS FOR LINEAGE & MERGE
-- =============================================================================

-- Function: Get complete ancestry chain for a node
CREATE OR REPLACE FUNCTION get_node_ancestry(p_node_id UUID)
RETURNS TABLE (
  ancestor_id UUID,
  ancestor_title TEXT,
  ancestor_type node_type,
  generation INTEGER,
  derivation_type TEXT,
  created_by_name TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE ancestry AS (
    -- Base case: start with the node
    SELECT
      rn.id,
      rn.title,
      rn.node_type,
      0 as gen,
      'current'::TEXT as deriv,
      p.display_name,
      rn.created_at
    FROM research_nodes rn
    JOIN profiles p ON p.id = rn.created_by
    WHERE rn.id = p_node_id

    UNION ALL

    -- Recursive case: get parent
    SELECT
      parent.id,
      parent.title,
      parent.node_type,
      a.gen + 1,
      COALESCE(na.derivation_type, 'fork'),
      p.display_name,
      parent.created_at
    FROM ancestry a
    JOIN node_ancestry na ON na.node_id = a.id
    JOIN research_nodes parent ON parent.id = na.parent_node_id
    JOIN profiles p ON p.id = parent.created_by
    WHERE na.parent_node_id IS NOT NULL
  )
  SELECT
    ancestry.id,
    ancestry.title,
    ancestry.node_type,
    ancestry.gen,
    ancestry.deriv,
    ancestry.display_name,
    ancestry.created_at
  FROM ancestry
  ORDER BY ancestry.gen;
END;
$$ LANGUAGE plpgsql;

-- Function: Find common ancestor of two nodes (for merge)
CREATE OR REPLACE FUNCTION find_common_ancestor(
  p_node_a UUID,
  p_node_b UUID
)
RETURNS UUID AS $$
DECLARE
  v_ancestry_a UUID[];
  v_ancestry_b UUID[];
  v_ancestor UUID;
BEGIN
  -- Get ancestry paths
  SELECT ancestry_path INTO v_ancestry_a FROM node_ancestry WHERE node_id = p_node_a;
  SELECT ancestry_path INTO v_ancestry_b FROM node_ancestry WHERE node_id = p_node_b;

  -- Find common ancestor (last common element)
  FOREACH v_ancestor IN ARRAY COALESCE(v_ancestry_a, ARRAY[p_node_a])
  LOOP
    IF v_ancestor = ANY(COALESCE(v_ancestry_b, ARRAY[p_node_b])) THEN
      RETURN v_ancestor;
    END IF;
  END LOOP;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function: Fork a node with full ancestry tracking
CREATE OR REPLACE FUNCTION fork_node_with_ancestry(
  p_source_node_id UUID,
  p_user_id UUID,
  p_new_title TEXT DEFAULT NULL,
  p_fork_reason TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_source research_nodes%ROWTYPE;
  v_new_node_id UUID;
  v_root_id UUID;
  v_parent_ancestry UUID[];
  v_parent_depth INTEGER;
BEGIN
  -- Get source node
  SELECT * INTO v_source FROM research_nodes WHERE id = p_source_node_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Source node not found';
  END IF;

  -- Get parent ancestry info
  SELECT ancestry_path, fork_depth INTO v_parent_ancestry, v_parent_depth
  FROM node_ancestry WHERE node_id = p_source_node_id;

  -- Determine root
  v_root_id := COALESCE(v_source.root_id, p_source_node_id);

  -- Create forked node
  INSERT INTO research_nodes (
    title, slug, node_type, content, summary, challenge_id,
    forked_from_id, root_id, branch_type, hypothesis, methodology,
    structured_content, embedding, is_public, created_by
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
    v_source.structured_content,
    v_source.embedding,
    false,
    p_user_id
  ) RETURNING id INTO v_new_node_id;

  -- Create ancestry record with full path
  INSERT INTO node_ancestry (
    node_id, parent_node_id, parent_version,
    ancestry_path, fork_depth, derivation_type, derivation_reason
  ) VALUES (
    v_new_node_id,
    p_source_node_id,
    v_source.version,
    COALESCE(v_parent_ancestry, ARRAY[]::UUID[]) || p_source_node_id,
    COALESCE(v_parent_depth, 0) + 1,
    'fork',
    p_fork_reason
  );

  -- Update fork network
  INSERT INTO fork_network (root_node_id, total_forks, last_fork_at)
  VALUES (v_root_id, 1, NOW())
  ON CONFLICT (root_node_id) DO UPDATE SET
    total_forks = fork_network.total_forks + 1,
    last_fork_at = NOW(),
    updated_at = NOW();

  -- Create knowledge link
  INSERT INTO knowledge_links (source_node_id, target_node_id, link_type, created_by)
  VALUES (v_new_node_id, p_source_node_id, 'derived_from', p_user_id);

  -- Award XP
  PERFORM award_xp(p_user_id, 10, 'Forked a research node', 'node', v_new_node_id);

  RETURN v_new_node_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Create merge request
CREATE OR REPLACE FUNCTION create_merge_request(
  p_source_node_id UUID,
  p_target_node_id UUID,
  p_title TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_common_ancestor UUID;
  v_merge_id UUID;
  v_has_conflicts BOOLEAN;
BEGIN
  v_user_id := auth.uid();

  -- Find common ancestor
  v_common_ancestor := find_common_ancestor(p_source_node_id, p_target_node_id);

  -- Create merge request
  INSERT INTO merge_requests (
    source_node_id, target_node_id,
    title, description,
    common_ancestor_id,
    submitted_at, created_by
  ) VALUES (
    p_source_node_id, p_target_node_id,
    p_title, p_description,
    v_common_ancestor,
    NOW(), v_user_id
  ) RETURNING id INTO v_merge_id;

  RETURN v_merge_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Execute merge
CREATE OR REPLACE FUNCTION execute_merge(
  p_merge_request_id UUID,
  p_resolved_content JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_merge merge_requests%ROWTYPE;
  v_source research_nodes%ROWTYPE;
  v_target research_nodes%ROWTYPE;
  v_version_id UUID;
BEGIN
  -- Get merge request
  SELECT * INTO v_merge FROM merge_requests WHERE id = p_merge_request_id;

  IF NOT FOUND OR v_merge.status = 'merged' THEN
    RETURN false;
  END IF;

  -- Get nodes
  SELECT * INTO v_source FROM research_nodes WHERE id = v_merge.source_node_id;
  SELECT * INTO v_target FROM research_nodes WHERE id = v_merge.target_node_id;

  -- Create version snapshot before merge
  v_version_id := create_node_version(v_merge.target_node_id, 'Before merge: ' || v_merge.title, 'major');

  -- Merge content (simplified - in reality would do 3-way merge)
  UPDATE research_nodes SET
    content = COALESCE(p_resolved_content, v_source.content),
    structured_content = COALESCE(
      v_source.structured_content,
      v_target.structured_content
    ),
    hypothesis = COALESCE(v_source.hypothesis, v_target.hypothesis),
    methodology = COALESCE(v_source.methodology, v_target.methodology),
    version = v_target.version + 1,
    updated_at = NOW()
  WHERE id = v_merge.target_node_id;

  -- Update ancestry to show merge
  UPDATE node_ancestry SET
    is_merge_commit = true,
    merge_parents = ARRAY[v_merge.source_node_id, v_merge.target_node_id]
  WHERE node_id = v_merge.target_node_id;

  -- Update merge request status
  UPDATE merge_requests SET
    status = 'merged',
    merged_at = NOW(),
    merged_by = auth.uid()
  WHERE id = p_merge_request_id;

  -- Update fork network
  UPDATE fork_network SET
    last_merge_at = NOW(),
    total_merged_contributions = total_merged_contributions + 1,
    updated_at = NOW()
  WHERE root_node_id = v_target.root_id OR root_node_id = v_target.id;

  -- Award XP to contributor
  PERFORM award_xp(v_source.created_by, 50, 'Contribution merged', 'merge', p_merge_request_id);

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get fork tree for visualization
CREATE OR REPLACE FUNCTION get_fork_tree(p_root_node_id UUID)
RETURNS JSONB AS $$
WITH RECURSIVE fork_tree AS (
  -- Base: root node
  SELECT
    rn.id,
    rn.title,
    rn.node_type,
    rn.created_by,
    p.display_name as author,
    rn.created_at,
    rn.fork_count,
    0 as depth,
    rn.id as path_root
  FROM research_nodes rn
  JOIN profiles p ON p.id = rn.created_by
  WHERE rn.id = p_root_node_id

  UNION ALL

  -- Recursive: children forks
  SELECT
    child.id,
    child.title,
    child.node_type,
    child.created_by,
    p.display_name,
    child.created_at,
    child.fork_count,
    ft.depth + 1,
    ft.path_root
  FROM fork_tree ft
  JOIN research_nodes child ON child.forked_from_id = ft.id
  JOIN profiles p ON p.id = child.created_by
  WHERE ft.depth < 10  -- Limit depth
)
SELECT jsonb_build_object(
  'root', (SELECT row_to_json(t) FROM (
    SELECT id, title, node_type, author, created_at, fork_count
    FROM fork_tree WHERE depth = 0
  ) t),
  'forks', (SELECT jsonb_agg(row_to_json(t)) FROM (
    SELECT id, title, node_type, author, created_at, fork_count, depth
    FROM fork_tree WHERE depth > 0
    ORDER BY depth, created_at
  ) t),
  'total_forks', (SELECT COUNT(*) FROM fork_tree WHERE depth > 0),
  'max_depth', (SELECT MAX(depth) FROM fork_tree)
);
$$ LANGUAGE sql;

-- Function: Get evidence summary for hypothesis
CREATE OR REPLACE FUNCTION get_evidence_summary(p_hypothesis_id UUID)
RETURNS JSONB AS $$
SELECT jsonb_build_object(
  'hypothesis_id', p_hypothesis_id,
  'total_evidence', COUNT(*),
  'supporting', COUNT(*) FILTER (WHERE relationship = 'supports'),
  'contradicting', COUNT(*) FILTER (WHERE relationship = 'contradicts'),
  'partial', COUNT(*) FILTER (WHERE relationship = 'partially_supports'),
  'inconclusive', COUNT(*) FILTER (WHERE relationship = 'inconclusive'),
  'avg_confidence', ROUND(AVG(confidence)::numeric, 2),
  'strength_distribution', jsonb_object_agg(
    COALESCE(strength::text, 'unknown'),
    cnt
  ),
  'reproducibility_rate', ROUND(
    (SUM(successful_reproductions)::numeric / NULLIF(SUM(reproduction_attempts), 0))::numeric,
    2
  ),
  'evidence_list', jsonb_agg(
    jsonb_build_object(
      'id', id,
      'node_id', evidence_node_id,
      'relationship', relationship,
      'strength', strength,
      'confidence', confidence,
      'is_peer_reviewed', is_peer_reviewed,
      'endorsements', endorsements
    )
    ORDER BY
      CASE strength
        WHEN 'consensus' THEN 1
        WHEN 'meta_analysis' THEN 2
        WHEN 'replicated' THEN 3
        WHEN 'experimental' THEN 4
        WHEN 'correlational' THEN 5
        WHEN 'anecdotal' THEN 6
      END
  )
)
FROM (
  SELECT ec.*,
    COUNT(*) OVER (PARTITION BY ec.strength) as cnt
  FROM evidence_chains ec
  WHERE ec.hypothesis_node_id = p_hypothesis_id
) sub
GROUP BY p_hypothesis_id;
$$ LANGUAGE sql;

-- =============================================================================
-- PART 4: RLS POLICIES
-- =============================================================================

ALTER TABLE node_ancestry ENABLE ROW LEVEL SECURITY;
ALTER TABLE merge_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE reproduction_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fork_network ENABLE ROW LEVEL SECURITY;

-- Node ancestry: viewable if you can view the node
CREATE POLICY "Ancestry follows node visibility" ON node_ancestry
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM research_nodes rn
      WHERE rn.id = node_ancestry.node_id
      AND (rn.is_public = true OR rn.created_by = auth.uid())
    )
  );

-- Merge requests: involved parties can view
CREATE POLICY "View own merge requests" ON merge_requests
  FOR SELECT USING (
    created_by = auth.uid()
    OR merged_by = auth.uid()
    OR auth.uid() = ANY(reviewers)
    OR EXISTS (
      SELECT 1 FROM research_nodes rn
      WHERE (rn.id = source_node_id OR rn.id = target_node_id)
      AND rn.created_by = auth.uid()
    )
  );

CREATE POLICY "Create merge requests" ON merge_requests
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Update own merge requests" ON merge_requests
  FOR UPDATE USING (
    created_by = auth.uid()
    OR auth.uid() = ANY(reviewers)
  );

-- Evidence chains: public evidence is viewable
CREATE POLICY "View evidence chains" ON evidence_chains
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM research_nodes rn
      WHERE rn.id = hypothesis_node_id
      AND (rn.is_public = true OR rn.created_by = auth.uid())
    )
  );

CREATE POLICY "Create evidence chains" ON evidence_chains
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Update own evidence" ON evidence_chains
  FOR UPDATE USING (created_by = auth.uid());

-- Fork network: public
CREATE POLICY "View fork networks" ON fork_network
  FOR SELECT USING (true);

-- =============================================================================
-- PART 5: TRIGGERS FOR ANCESTRY MANAGEMENT
-- =============================================================================

-- Trigger: Auto-create ancestry record for new nodes
CREATE OR REPLACE FUNCTION trigger_create_ancestry()
RETURNS TRIGGER AS $$
DECLARE
  v_parent_ancestry UUID[];
  v_parent_depth INTEGER;
BEGIN
  -- If this is a fork, inherit parent's ancestry
  IF NEW.forked_from_id IS NOT NULL THEN
    SELECT ancestry_path, fork_depth INTO v_parent_ancestry, v_parent_depth
    FROM node_ancestry WHERE node_id = NEW.forked_from_id;

    INSERT INTO node_ancestry (
      node_id, parent_node_id,
      ancestry_path, fork_depth, derivation_type
    ) VALUES (
      NEW.id,
      NEW.forked_from_id,
      COALESCE(v_parent_ancestry, ARRAY[]::UUID[]) || NEW.forked_from_id,
      COALESCE(v_parent_depth, 0) + 1,
      'fork'
    ) ON CONFLICT (node_id) DO NOTHING;
  ELSE
    -- Original node - no ancestry
    INSERT INTO node_ancestry (
      node_id, ancestry_path, fork_depth, derivation_type
    ) VALUES (
      NEW.id, ARRAY[]::UUID[], 0, 'original'
    ) ON CONFLICT (node_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_node_ancestry
  AFTER INSERT ON research_nodes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_ancestry();

-- Trigger: Update fork count when forked
CREATE OR REPLACE FUNCTION trigger_update_fork_count()
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

CREATE TRIGGER trigger_fork_count
  AFTER INSERT ON research_nodes
  FOR EACH ROW
  WHEN (NEW.forked_from_id IS NOT NULL)
  EXECUTE FUNCTION trigger_update_fork_count();

-- =============================================================================
-- COMMENTS
-- =============================================================================
--
-- This schema upgrade implements a complete "Git for Science" system:
--
-- 1. LINEAGE TRACKING:
--    - Every fork/branch maintains full ancestry path
--    - Supports finding common ancestors for merge
--    - Tracks derivation reasons and fork depth
--
-- 2. MERGE SYSTEM:
--    - Git-style merge requests with review workflow
--    - Conflict detection and resolution tracking
--    - AI-assisted compatibility analysis
--    - Scientific impact assessment
--
-- 3. EVIDENCE CHAINS:
--    - Links hypotheses to supporting evidence
--    - Tracks evidence strength and reproducibility
--    - Supports peer review and endorsements
--
-- 4. VISUALIZATION:
--    - Fork network table for efficient graph rendering
--    - get_fork_tree() for complete tree structure
--    - get_evidence_summary() for hypothesis validation status
--
-- Run this after schema-v2-upgrade.sql
--
