// Database types v2 - Git-Lite & Scientific Workbench additions

// ============================================================================
// GIT-LITE VERSIONING
// ============================================================================

export type PublicationStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "revision_requested"
  | "approved"
  | "published"
  | "rejected";

export type BranchType = "main" | "fork" | "experiment" | "revision";

export interface NodeVersion {
  id: string;
  node_id: string;
  version_number: number;
  title: string;
  content: TiptapContent;
  summary: string | null;
  hypothesis: string | null;
  methodology: string | null;
  structured_content: StructuredScientificContent | null;
  change_message: string | null;
  change_type: "major" | "minor" | "patch";
  diff_from_previous: unknown | null;
  created_by: string;
  created_at: string;
}

export interface PublicationRequest {
  id: string;
  node_id: string;
  version_id: string | null;
  target_node_id: string | null;
  target_challenge_id: string | null;
  title: string;
  description: string | null;
  publication_type: "new_publication" | "merge_request" | "challenge_submission";
  status: PublicationStatus;
  reviewer_id: string | null;
  review_notes: ReviewNote[] | null;
  review_score: number | null;
  ai_review: AIReviewResult | null;
  similarity_report: SimilarityReport | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  published_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewNote {
  id: string;
  reviewer_id: string;
  content: string;
  type: "comment" | "suggestion" | "issue" | "approval";
  line_reference?: { start: number; end: number };
  resolved: boolean;
  created_at: string;
}

export interface AIReviewResult {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  methodology_check: {
    valid: boolean;
    issues: string[];
  };
  citation_check: {
    missing_citations: string[];
    invalid_citations: string[];
  };
}

export interface SimilarityReport {
  overall_score: number;
  matches: Array<{
    node_id: string;
    title: string;
    similarity: number;
    matching_segments: string[];
  }>;
}

export interface ReviewAssignment {
  id: string;
  publication_request_id: string;
  reviewer_id: string;
  assigned_by: string | null;
  role: "reviewer" | "mentor" | "ai";
  status: "pending" | "in_progress" | "completed" | "declined";
  review_content: unknown | null;
  recommendation: "approve" | "request_changes" | "reject" | null;
  assigned_at: string;
  completed_at: string | null;
}

// ============================================================================
// STRUCTURED SCIENTIFIC CONTENT
// ============================================================================

export interface StructuredScientificContent {
  hypothesis?: HypothesisBlock;
  methodology?: MethodologyBlock;
  data?: DataBlock;
  conclusion?: ConclusionBlock;
}

export interface HypothesisBlock {
  content: TiptapContent;
  confidence: number; // 0-1
  variables: {
    independent: string[];
    dependent: string[];
    controlled: string[];
  };
  predictions: string[];
  testable: boolean;
}

export interface MethodologyBlock {
  content: TiptapContent;
  type: "experimental" | "observational" | "theoretical" | "computational" | "mixed";
  steps: Array<{
    order: number;
    title: string;
    description: string;
    duration?: string;
  }>;
  materials: string[];
  safety_notes: string[];
}

export interface DataBlock {
  content: TiptapContent;
  datasets: DatasetReference[];
  visualizations: ChartConfig[];
  tables: TableData[];
  raw_data_url?: string;
}

export interface DatasetReference {
  id: string;
  name: string;
  description: string;
  url?: string;
  format: "csv" | "json" | "xlsx" | "other";
  rows?: number;
  columns?: string[];
  schema?: Record<string, string>;
}

export interface ChartConfig {
  id: string;
  type: "line" | "bar" | "scatter" | "pie" | "area" | "histogram";
  title: string;
  data: Array<Record<string, unknown>>;
  xAxis: { key: string; label: string };
  yAxis: { key: string; label: string };
  config?: Record<string, unknown>;
}

export interface TableData {
  id: string;
  title: string;
  headers: string[];
  rows: Array<Array<string | number>>;
  footnotes?: string[];
}

export interface ConclusionBlock {
  content: TiptapContent;
  supports_hypothesis: boolean | null;
  confidence: number; // 0-1
  limitations: string[];
  future_work: string[];
  key_findings: string[];
}

// ============================================================================
// KNOWLEDGE GRAPH
// ============================================================================

export interface GraphNode {
  id: string;
  title: string;
  node_type: string;
  depth: number;
  path: string[];
  link_types: string[];
  x?: number;
  y?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  weight: number;
  label?: string;
}

export interface SimilarNode {
  id: string;
  title: string;
  node_type: string;
  summary: string | null;
  similarity: number;
  created_by: string;
  is_public: boolean;
}

export interface ConflictingHypothesis {
  conflicting_node_id: string;
  conflicting_title: string;
  similarity: number;
  link_type: string;
  conflict_reason: string;
}

// ============================================================================
// REAL-TIME COLLABORATION
// ============================================================================

export interface EditingSession {
  id: string;
  node_id: string;
  user_id: string;
  cursor_position: CursorPosition | null;
  last_content_hash: string | null;
  is_active: boolean;
  started_at: string;
  last_activity_at: string;
  ended_at: string | null;
}

export interface CursorPosition {
  line: number;
  column: number;
  selection?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

export interface CollaborationEvent {
  id: string;
  node_id: string;
  user_id: string;
  session_id: string | null;
  event_type: "cursor_move" | "selection" | "edit" | "comment" | "presence";
  event_data: unknown;
  created_at: string;
}

export interface ActiveCollaborator {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  cursor_position: CursorPosition | null;
  color: string; // For cursor/selection highlighting
}

// ============================================================================
// RE-EXPORT CORE TYPES
// ============================================================================

import type { TiptapContent, ResearchNode } from "./database";
export type { TiptapContent };

// Extended ResearchNode with v2 fields
export interface ResearchNodeV2 extends ResearchNode {
  root_id: string | null;
  branch_type: BranchType;
  branch_name: string | null;
  is_canonical: boolean;
  structured_content: StructuredScientificContent | null;
  data_attachments: Array<DatasetReference | ChartConfig>;
}
