"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { KnowledgeNode, KnowledgeEdge } from "@/components/knowledge/interactive-knowledge-graph";

interface UseKnowledgeGraphOptions {
  nodeId?: string;
  depth?: number;
  includeTypes?: string[];
  onlyPublic?: boolean;
}

interface UseKnowledgeGraphResult {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  addEvidenceLink: (hypothesisId: string, evidenceId: string, relationship: string) => Promise<void>;
  forkNode: (nodeId: string, newTitle?: string) => Promise<string | null>;
}

export function useKnowledgeGraph(options: UseKnowledgeGraphOptions = {}): UseKnowledgeGraphResult {
  const { nodeId, depth = 2, includeTypes, onlyPublic = true } = options;
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [edges, setEdges] = useState<KnowledgeEdge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  const fetchGraph = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // If we have a specific node, use the graph_neighbors function
      if (nodeId) {
        // First, get the node neighbors using the database function
        const { data: neighborsData, error: neighborsError } = await supabase.rpc(
          "get_graph_neighbors",
          {
            p_node_id: nodeId,
            p_depth: depth,
            p_limit: 50,
          }
        );

        if (neighborsError) throw neighborsError;

        // Get the center node
        const { data: centerNode, error: centerError } = await supabase
          .from("research_nodes")
          .select(`
            id,
            title,
            node_type,
            summary,
            confidence_level,
            fork_count,
            citation_count,
            is_verified,
            created_by,
            profiles!research_nodes_created_by_fkey (display_name)
          `)
          .eq("id", nodeId)
          .single();

        if (centerError) throw centerError;

        // Collect all node IDs
        const nodeIds = [nodeId, ...(neighborsData?.map((n: { node_id: string }) => n.node_id) || [])];

        // Fetch all nodes
        const { data: nodesData, error: nodesError } = await supabase
          .from("research_nodes")
          .select(`
            id,
            title,
            node_type,
            summary,
            confidence_level,
            fork_count,
            citation_count,
            is_verified,
            created_by,
            created_at,
            profiles!research_nodes_created_by_fkey (display_name)
          `)
          .in("id", nodeIds);

        if (nodesError) throw nodesError;

        // Transform nodes
        const transformedNodes: KnowledgeNode[] = (nodesData || []).map((node) => ({
          id: node.id,
          title: node.title,
          type: node.node_type as KnowledgeNode["type"],
          summary: node.summary || undefined,
          confidence: node.confidence_level || undefined,
          forkCount: node.fork_count || undefined,
          citationCount: node.citation_count || undefined,
          isVerified: node.is_verified || undefined,
          author: (node.profiles as { display_name: string } | null)?.display_name || undefined,
          createdAt: node.created_at,
          isCurrent: node.id === nodeId,
        }));

        // Fetch edges between these nodes
        const { data: linksData, error: linksError } = await supabase
          .from("knowledge_links")
          .select("id, source_node_id, target_node_id, link_type, strength, description")
          .or(`source_node_id.in.(${nodeIds.join(",")}),target_node_id.in.(${nodeIds.join(",")})`);

        if (linksError) throw linksError;

        // Filter edges to only include those where both nodes are in our set
        const nodeIdSet = new Set(nodeIds);
        const transformedEdges: KnowledgeEdge[] = (linksData || [])
          .filter((link) => nodeIdSet.has(link.source_node_id) && nodeIdSet.has(link.target_node_id))
          .map((link) => ({
            id: link.id,
            source: link.source_node_id,
            target: link.target_node_id,
            type: link.link_type as KnowledgeEdge["type"],
            strength: link.strength || undefined,
            label: link.description || undefined,
          }));

        setNodes(transformedNodes);
        setEdges(transformedEdges);
      } else {
        // Fetch all public nodes (global knowledge base)
        let query = supabase
          .from("research_nodes")
          .select(`
            id,
            title,
            node_type,
            summary,
            confidence_level,
            fork_count,
            citation_count,
            is_verified,
            created_by,
            created_at,
            profiles!research_nodes_created_by_fkey (display_name)
          `)
          .order("citation_count", { ascending: false })
          .limit(100);

        if (onlyPublic) {
          query = query.eq("is_public", true);
        }

        if (includeTypes && includeTypes.length > 0) {
          query = query.in("node_type", includeTypes);
        }

        const { data: nodesData, error: nodesError } = await query;

        if (nodesError) throw nodesError;

        const nodeIds = (nodesData || []).map((n) => n.id);

        // Transform nodes
        const transformedNodes: KnowledgeNode[] = (nodesData || []).map((node) => ({
          id: node.id,
          title: node.title,
          type: node.node_type as KnowledgeNode["type"],
          summary: node.summary || undefined,
          confidence: node.confidence_level || undefined,
          forkCount: node.fork_count || undefined,
          citationCount: node.citation_count || undefined,
          isVerified: node.is_verified || undefined,
          author: (node.profiles as { display_name: string } | null)?.display_name || undefined,
          createdAt: node.created_at,
        }));

        // Fetch edges
        if (nodeIds.length > 0) {
          const { data: linksData, error: linksError } = await supabase
            .from("knowledge_links")
            .select("id, source_node_id, target_node_id, link_type, strength, description");

          if (linksError) throw linksError;

          const nodeIdSet = new Set(nodeIds);
          const transformedEdges: KnowledgeEdge[] = (linksData || [])
            .filter((link) => nodeIdSet.has(link.source_node_id) && nodeIdSet.has(link.target_node_id))
            .map((link) => ({
              id: link.id,
              source: link.source_node_id,
              target: link.target_node_id,
              type: link.link_type as KnowledgeEdge["type"],
              strength: link.strength || undefined,
              label: link.description || undefined,
            }));

          setEdges(transformedEdges);
        }

        setNodes(transformedNodes);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch knowledge graph"));
    } finally {
      setIsLoading(false);
    }
  }, [supabase, nodeId, depth, includeTypes, onlyPublic]);

  // Add evidence link
  const addEvidenceLink = useCallback(
    async (hypothesisId: string, evidenceId: string, relationship: string) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // Create knowledge link
        const { error: linkError } = await supabase.from("knowledge_links").insert({
          source_node_id: evidenceId,
          target_node_id: hypothesisId,
          link_type: relationship,
          created_by: user.id,
        });

        if (linkError) throw linkError;

        // Create evidence chain record
        const { error: chainError } = await supabase.from("evidence_chains").insert({
          hypothesis_node_id: hypothesisId,
          evidence_node_id: evidenceId,
          relationship: relationship,
          strength: "experimental",
          created_by: user.id,
        });

        if (chainError) throw chainError;

        // Refetch graph
        await fetchGraph();
      } catch (err) {
        throw err instanceof Error ? err : new Error("Failed to add evidence link");
      }
    },
    [supabase, fetchGraph]
  );

  // Fork node
  const forkNode = useCallback(
    async (nodeId: string, newTitle?: string): Promise<string | null> => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // Use the database function to fork
        const { data, error } = await supabase.rpc("fork_node_with_ancestry", {
          p_source_node_id: nodeId,
          p_user_id: user.id,
          p_new_title: newTitle,
          p_fork_reason: "Exploring alternative hypothesis",
        });

        if (error) throw error;

        return data as string;
      } catch (err) {
        throw err instanceof Error ? err : new Error("Failed to fork node");
      }
    },
    [supabase]
  );

  // Initial fetch
  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  return {
    nodes,
    edges,
    isLoading,
    error,
    refetch: fetchGraph,
    addEvidenceLink,
    forkNode,
  };
}

// Hook for getting evidence summary
export function useEvidenceSummary(hypothesisId: string) {
  const [summary, setSummary] = useState<{
    total: number;
    supporting: number;
    contradicting: number;
    avgConfidence: number;
    reproducibilityRate: number | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    if (!hypothesisId) return;

    const fetchSummary = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.rpc("get_evidence_summary", {
          p_hypothesis_id: hypothesisId,
        });

        if (error) throw error;

        if (data) {
          setSummary({
            total: data.total_evidence || 0,
            supporting: data.supporting || 0,
            contradicting: data.contradicting || 0,
            avgConfidence: data.avg_confidence || 0,
            reproducibilityRate: data.reproducibility_rate,
          });
        }
      } catch (err) {
        console.error("Failed to fetch evidence summary:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [hypothesisId, supabase]);

  return { summary, isLoading };
}

// Hook for getting fork tree
export function useForkTree(rootNodeId: string) {
  const [tree, setTree] = useState<{
    root: {
      id: string;
      title: string;
      author: string;
      forkCount: number;
    };
    forks: Array<{
      id: string;
      title: string;
      author: string;
      depth: number;
    }>;
    totalForks: number;
    maxDepth: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    if (!rootNodeId) return;

    const fetchTree = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.rpc("get_fork_tree", {
          p_root_node_id: rootNodeId,
        });

        if (error) throw error;

        if (data) {
          setTree({
            root: {
              id: data.root.id,
              title: data.root.title,
              author: data.root.author,
              forkCount: data.root.fork_count,
            },
            forks: (data.forks || []).map((f: { id: string; title: string; author: string; depth: number }) => ({
              id: f.id,
              title: f.title,
              author: f.author,
              depth: f.depth,
            })),
            totalForks: data.total_forks,
            maxDepth: data.max_depth,
          });
        }
      } catch (err) {
        console.error("Failed to fetch fork tree:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTree();
  }, [rootNodeId, supabase]);

  return { tree, isLoading };
}
