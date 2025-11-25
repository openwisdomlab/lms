// =============================================================================
// NextGen LMS Hooks - Convex Migration
// =============================================================================
//
// This file exports all hooks for the LMS application.
//
// MIGRATION GUIDE:
// The following hooks have been migrated from Supabase to Convex:
//
// OLD (Supabase)                    -> NEW (Convex)
// ---------------------------------------------------------------
// use-knowledge-graph.ts            -> use-convex-knowledge-graph.ts
// use-realtime-collaboration.ts     -> use-convex-collaboration.ts
// use-research-copilot.ts           -> (AI features remain similar)
//
// Key differences:
// 1. Convex queries automatically update in real-time (no manual subscriptions)
// 2. Use useMutation() instead of direct function calls
// 3. IDs are typed as Id<"tableName"> instead of strings
//
// =============================================================================

// Authentication hooks
export {
  useConvexAuth,
  useCurrentUser,
  useProfile,
  useProfileByClerkId,
  useCreateProfile,
  useUpdateProfile,
} from "./use-convex-auth";

// Research Node hooks
export {
  useResearchNode,
  useResearchNodeWithCollaborators,
  usePublicResearchNodes,
  useUserResearchNodes,
  useChallengeResearchNodes,
  useNodeForks,
  useCreateResearchNode,
  useUpdateResearchNode,
  useForkResearchNode,
  useSetNodePublic,
  useDeleteResearchNode,
  useAddCollaborator,
  useRemoveCollaborator,
} from "./use-research-nodes";

// Knowledge Graph hooks
export {
  useNodeConnections,
  useGraphNeighbors,
  useOutgoingLinks,
  useIncomingLinks,
  useEvidenceForHypothesis,
  useEvidenceSummary,
  useCreateKnowledgeLink,
  useUpdateKnowledgeLink,
  useVerifyKnowledgeLink,
  useDeleteKnowledgeLink,
  useCreateEvidenceChain,
  useEndorseEvidence,
  useChallengeEvidence,
  useKnowledgeGraphVisualization,
} from "./use-convex-knowledge-graph";

// Collaboration hooks
export {
  useActiveSessions,
  useCollaborationSession,
  useCollaborationEvents,
  useTeam,
  useTeamBySlug,
  usePublicTeams,
  useUserTeams,
  useCreateTeam,
  useJoinTeam,
  useLeaveTeam,
  useUpdateMemberRole,
} from "./use-convex-collaboration";

// =============================================================================
// DEPRECATED: Legacy Supabase hooks
// These are kept for backwards compatibility during migration
// =============================================================================

// @deprecated Use hooks from use-convex-knowledge-graph.ts instead
export { useKnowledgeGraph, useForkTree } from "./use-knowledge-graph";

// @deprecated Use hooks from use-convex-collaboration.ts instead
export { useRealtimeCollaboration } from "./use-realtime-collaboration";

// Note: use-research-copilot.ts contains AI features that are independent of the database
export { useResearchCopilot } from "./use-research-copilot";
