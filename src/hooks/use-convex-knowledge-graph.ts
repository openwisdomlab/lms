"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// ===========================================================================
// KNOWLEDGE GRAPH HOOKS
// These replace the Supabase-based use-knowledge-graph.ts
// Convex provides automatic real-time updates via useQuery
// ===========================================================================

export function useNodeConnections(nodeId: Id<"researchNodes"> | null) {
  const connections = useQuery(
    api.knowledgeGraph.getNodeConnections,
    nodeId ? { nodeId } : "skip"
  );
  return connections;
}

export function useGraphNeighbors(
  nodeId: Id<"researchNodes"> | null,
  options?: { depth?: number; limit?: number }
) {
  const neighbors = useQuery(
    api.knowledgeGraph.getGraphNeighbors,
    nodeId ? { nodeId, ...options } : "skip"
  );
  return neighbors;
}

export function useOutgoingLinks(sourceNodeId: Id<"researchNodes"> | null) {
  const links = useQuery(
    api.knowledgeGraph.listBySourceNode,
    sourceNodeId ? { sourceNodeId } : "skip"
  );
  return links;
}

export function useIncomingLinks(targetNodeId: Id<"researchNodes"> | null) {
  const links = useQuery(
    api.knowledgeGraph.listByTargetNode,
    targetNodeId ? { targetNodeId } : "skip"
  );
  return links;
}

// Evidence chain hooks
export function useEvidenceForHypothesis(hypothesisNodeId: Id<"researchNodes"> | null) {
  const evidence = useQuery(
    api.knowledgeGraph.getEvidenceForHypothesis,
    hypothesisNodeId ? { hypothesisNodeId } : "skip"
  );
  return evidence;
}

export function useEvidenceSummary(hypothesisNodeId: Id<"researchNodes"> | null) {
  const summary = useQuery(
    api.knowledgeGraph.getEvidenceSummary,
    hypothesisNodeId ? { hypothesisNodeId } : "skip"
  );
  return summary;
}

// Mutations
export function useCreateKnowledgeLink() {
  return useMutation(api.knowledgeGraph.create);
}

export function useUpdateKnowledgeLink() {
  return useMutation(api.knowledgeGraph.update);
}

export function useVerifyKnowledgeLink() {
  return useMutation(api.knowledgeGraph.verify);
}

export function useDeleteKnowledgeLink() {
  return useMutation(api.knowledgeGraph.remove);
}

export function useCreateEvidenceChain() {
  return useMutation(api.knowledgeGraph.createEvidenceChain);
}

export function useEndorseEvidence() {
  return useMutation(api.knowledgeGraph.endorseEvidence);
}

export function useChallengeEvidence() {
  return useMutation(api.knowledgeGraph.challengeEvidence);
}

// ===========================================================================
// KNOWLEDGE GRAPH VISUALIZATION HOOK
// Provides data formatted for @xyflow/react
// ===========================================================================

export function useKnowledgeGraphVisualization(
  nodeId: Id<"researchNodes"> | null,
  options?: { depth?: number; limit?: number }
) {
  const data = useQuery(
    api.knowledgeGraph.getGraphNeighbors,
    nodeId ? { nodeId, ...options } : "skip"
  );

  if (!data) {
    return { nodes: [], edges: [], isLoading: !data };
  }

  // Transform to React Flow format
  const flowNodes = data.nodes.map((node: any) => ({
    id: node.id,
    type: "researchNode",
    position: { x: 0, y: 0 }, // Will be set by layout algorithm
    data: {
      label: node.title,
      nodeType: node.nodeType,
      summary: node.summary,
      depth: node.depth,
    },
  }));

  const flowEdges = data.edges.map((edge: any) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: "smoothstep",
    label: edge.linkType,
    data: {
      linkType: edge.linkType,
      strength: edge.strength,
    },
  }));

  return {
    nodes: flowNodes,
    edges: flowEdges,
    isLoading: false,
  };
}
