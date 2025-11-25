"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// ===========================================================================
// RESEARCH NODE HOOKS
// ===========================================================================

export function useResearchNode(nodeId: Id<"researchNodes"> | null) {
  const node = useQuery(
    api.researchNodes.getById,
    nodeId ? { id: nodeId } : "skip"
  );
  return node;
}

export function useResearchNodeWithCollaborators(nodeId: Id<"researchNodes"> | null) {
  const node = useQuery(
    api.researchNodes.getWithCollaborators,
    nodeId ? { id: nodeId } : "skip"
  );
  return node;
}

export function usePublicResearchNodes(options?: {
  nodeType?: string;
  challengeId?: Id<"challenges">;
  limit?: number;
}) {
  const nodes = useQuery(api.researchNodes.listPublic, options ?? {});
  return nodes;
}

export function useUserResearchNodes(creatorId: Id<"profiles"> | null) {
  const nodes = useQuery(
    api.researchNodes.listByCreator,
    creatorId ? { creatorId } : "skip"
  );
  return nodes;
}

export function useChallengeResearchNodes(challengeId: Id<"challenges"> | null) {
  const nodes = useQuery(
    api.researchNodes.listByChallenge,
    challengeId ? { challengeId } : "skip"
  );
  return nodes;
}

export function useNodeForks(nodeId: Id<"researchNodes"> | null) {
  const forks = useQuery(
    api.researchNodes.listForks,
    nodeId ? { nodeId } : "skip"
  );
  return forks;
}

// Mutations
export function useCreateResearchNode() {
  return useMutation(api.researchNodes.create);
}

export function useUpdateResearchNode() {
  return useMutation(api.researchNodes.update);
}

export function useForkResearchNode() {
  return useMutation(api.researchNodes.fork);
}

export function useSetNodePublic() {
  return useMutation(api.researchNodes.setPublic);
}

export function useDeleteResearchNode() {
  return useMutation(api.researchNodes.remove);
}

// Collaborator mutations
export function useAddCollaborator() {
  return useMutation(api.researchNodes.addCollaborator);
}

export function useRemoveCollaborator() {
  return useMutation(api.researchNodes.removeCollaborator);
}
