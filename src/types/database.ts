// Database types for NextGen LMS
// Auto-generated types that match the Supabase schema

export type UserRole = "learner" | "researcher" | "mentor" | "admin";

export type NodeType =
  | "hypothesis"
  | "experiment"
  | "data"
  | "analysis"
  | "synthesis"
  | "literature"
  | "note"
  | "question";

export type DifficultyLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert"
  | "frontier";

export type ArtifactType =
  | "paper"
  | "code"
  | "dataset"
  | "model"
  | "visualization"
  | "presentation"
  | "peer_review";

export type BadgeCategory =
  | "research"
  | "collaboration"
  | "mastery"
  | "contribution"
  | "streak"
  | "special";

export type LinkType =
  | "supports"
  | "contradicts"
  | "extends"
  | "references"
  | "derived_from"
  | "prerequisite"
  | "related"
  | "fork";

export type TeamRole = "lead" | "member" | "contributor" | "observer";

// Tiptap JSON content type
export interface TiptapContent {
  type: string;
  content?: TiptapContent[];
  attrs?: Record<string, unknown>;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  text?: string;
}

// Profile (extends Supabase Auth user)
export interface Profile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  institution: string | null;
  research_interests: string[] | null;
  xp: number;
  level: number;
  streak_days: number;
  streak_last_activity: string | null;
  preferences: Record<string, unknown>;
  notification_settings: {
    email: boolean;
    push: boolean;
  };
  created_at: string;
  updated_at: string;
  last_seen_at: string;
}

// Challenge (Scientific Problem / Course)
export interface Challenge {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url: string | null;
  problem_statement: string;
  real_world_context: string | null;
  research_field: string[];
  keywords: string[] | null;
  difficulty: DifficultyLevel;
  estimated_hours: number | null;
  prerequisites: string[] | null;
  introduction_content: TiptapContent | null;
  resources: Record<string, unknown> | null;
  xp_reward: number;
  is_published: boolean;
  is_featured: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

// Research Node (Core Content Unit)
export interface ResearchNode {
  id: string;
  title: string;
  slug: string;
  node_type: NodeType;
  content: TiptapContent;
  summary: string | null;
  challenge_id: string | null;
  parent_node_id: string | null;
  forked_from_id: string | null;
  fork_count: number;
  hypothesis: string | null;
  methodology: string | null;
  confidence_level: number | null;
  ai_analysis: Record<string, unknown> | null;
  is_public: boolean;
  is_verified: boolean;
  version: number;
  is_collaborative: boolean;
  view_count: number;
  citation_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Knowledge Link (Graph Connection)
export interface KnowledgeLink {
  id: string;
  source_node_id: string;
  target_node_id: string;
  link_type: LinkType;
  strength: number;
  description: string | null;
  context_snippet: string | null;
  is_verified: boolean;
  verified_by: string | null;
  created_by: string;
  created_at: string;
}

// Artifact (Student Submission)
export interface Artifact {
  id: string;
  title: string;
  description: string | null;
  artifact_type: ArtifactType;
  content: TiptapContent | null;
  file_url: string | null;
  file_metadata: Record<string, unknown> | null;
  external_url: string | null;
  challenge_id: string | null;
  research_node_id: string | null;
  is_submitted: boolean;
  submitted_at: string | null;
  review_status: "pending" | "in_review" | "approved" | "revision_requested";
  review_feedback: Record<string, unknown> | null;
  xp_earned: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Team
export interface Team {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatar_url: string | null;
  challenge_id: string | null;
  research_focus: string | null;
  is_public: boolean;
  max_members: number;
  join_policy: "open" | "approval" | "invite_only";
  total_xp: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Team Member
export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  joined_at: string;
}

// Node Collaborator
export interface NodeCollaborator {
  id: string;
  node_id: string;
  user_id: string;
  can_edit: boolean;
  can_delete: boolean;
  can_invite: boolean;
  invited_by: string | null;
  joined_at: string;
}

// Badge
export interface Badge {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_url: string | null;
  category: BadgeCategory;
  requirement_type: string;
  requirement_value: number;
  requirement_metadata: Record<string, unknown> | null;
  xp_bonus: number;
  is_rare: boolean;
  is_hidden: boolean;
  created_at: string;
}

// User Badge (Earned)
export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  earned_for: string | null;
}

// XP Transaction
export interface XPTransaction {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  source_type: string | null;
  source_id: string | null;
  created_at: string;
}

// Challenge Progress
export interface ChallengeProgress {
  id: string;
  user_id: string;
  challenge_id: string;
  status: "not_started" | "in_progress" | "completed";
  progress_percentage: number;
  milestones: unknown[];
  started_at: string | null;
  completed_at: string | null;
  last_activity_at: string;
}

// Node Interaction
export interface NodeInteraction {
  id: string;
  user_id: string;
  node_id: string;
  interaction_type: "view" | "like" | "bookmark" | "cite";
  created_at: string;
}

// Comment
export interface Comment {
  id: string;
  commentable_type: "research_node" | "artifact" | "challenge";
  commentable_id: string;
  parent_id: string | null;
  content: TiptapContent;
  reactions: Record<string, number>;
  is_hidden: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Notification
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  link_type: string | null;
  link_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & Pick<Profile, "id" | "email" | "display_name">;
        Update: Partial<Profile>;
      };
      challenges: {
        Row: Challenge;
        Insert: Partial<Challenge> &
          Pick<Challenge, "title" | "slug" | "description" | "problem_statement" | "research_field">;
        Update: Partial<Challenge>;
      };
      research_nodes: {
        Row: ResearchNode;
        Insert: Partial<ResearchNode> &
          Pick<ResearchNode, "title" | "slug" | "node_type" | "created_by">;
        Update: Partial<ResearchNode>;
      };
      knowledge_links: {
        Row: KnowledgeLink;
        Insert: Partial<KnowledgeLink> &
          Pick<KnowledgeLink, "source_node_id" | "target_node_id" | "link_type" | "created_by">;
        Update: Partial<KnowledgeLink>;
      };
      artifacts: {
        Row: Artifact;
        Insert: Partial<Artifact> &
          Pick<Artifact, "title" | "artifact_type" | "created_by">;
        Update: Partial<Artifact>;
      };
      teams: {
        Row: Team;
        Insert: Partial<Team> & Pick<Team, "name" | "slug" | "created_by">;
        Update: Partial<Team>;
      };
      team_members: {
        Row: TeamMember;
        Insert: Partial<TeamMember> & Pick<TeamMember, "team_id" | "user_id">;
        Update: Partial<TeamMember>;
      };
      node_collaborators: {
        Row: NodeCollaborator;
        Insert: Partial<NodeCollaborator> &
          Pick<NodeCollaborator, "node_id" | "user_id">;
        Update: Partial<NodeCollaborator>;
      };
      badges: {
        Row: Badge;
        Insert: Partial<Badge> &
          Pick<Badge, "name" | "slug" | "description" | "category" | "requirement_type" | "requirement_value">;
        Update: Partial<Badge>;
      };
      user_badges: {
        Row: UserBadge;
        Insert: Partial<UserBadge> & Pick<UserBadge, "user_id" | "badge_id">;
        Update: Partial<UserBadge>;
      };
      xp_transactions: {
        Row: XPTransaction;
        Insert: Partial<XPTransaction> &
          Pick<XPTransaction, "user_id" | "amount" | "reason">;
        Update: Partial<XPTransaction>;
      };
      challenge_progress: {
        Row: ChallengeProgress;
        Insert: Partial<ChallengeProgress> &
          Pick<ChallengeProgress, "user_id" | "challenge_id">;
        Update: Partial<ChallengeProgress>;
      };
      node_interactions: {
        Row: NodeInteraction;
        Insert: Partial<NodeInteraction> &
          Pick<NodeInteraction, "user_id" | "node_id" | "interaction_type">;
        Update: Partial<NodeInteraction>;
      };
      comments: {
        Row: Comment;
        Insert: Partial<Comment> &
          Pick<Comment, "commentable_type" | "commentable_id" | "content" | "created_by">;
        Update: Partial<Comment>;
      };
      notifications: {
        Row: Notification;
        Insert: Partial<Notification> &
          Pick<Notification, "user_id" | "type" | "title">;
        Update: Partial<Notification>;
      };
    };
  };
}
