import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ===========================================================================
// KNOWLEDGE LINK QUERIES
// ===========================================================================

export const getById = query({
  args: { id: v.id("knowledgeLinks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listBySourceNode = query({
  args: { sourceNodeId: v.id("researchNodes") },
  handler: async (ctx, args) => {
    const links = await ctx.db
      .query("knowledgeLinks")
      .withIndex("by_source", (q) => q.eq("sourceNodeId", args.sourceNodeId))
      .collect();

    // Get target node info
    const linksWithNodes = await Promise.all(
      links.map(async (link) => {
        const targetNode = await ctx.db.get(link.targetNodeId);
        return {
          ...link,
          targetNode: targetNode
            ? {
                _id: targetNode._id,
                title: targetNode.title,
                nodeType: targetNode.nodeType,
                summary: targetNode.summary,
              }
            : null,
        };
      })
    );

    return linksWithNodes;
  },
});

export const listByTargetNode = query({
  args: { targetNodeId: v.id("researchNodes") },
  handler: async (ctx, args) => {
    const links = await ctx.db
      .query("knowledgeLinks")
      .withIndex("by_target", (q) => q.eq("targetNodeId", args.targetNodeId))
      .collect();

    // Get source node info
    const linksWithNodes = await Promise.all(
      links.map(async (link) => {
        const sourceNode = await ctx.db.get(link.sourceNodeId);
        return {
          ...link,
          sourceNode: sourceNode
            ? {
                _id: sourceNode._id,
                title: sourceNode.title,
                nodeType: sourceNode.nodeType,
                summary: sourceNode.summary,
              }
            : null,
        };
      })
    );

    return linksWithNodes;
  },
});

export const getNodeConnections = query({
  args: { nodeId: v.id("researchNodes") },
  handler: async (ctx, args) => {
    // Get outgoing links
    const outgoing = await ctx.db
      .query("knowledgeLinks")
      .withIndex("by_source", (q) => q.eq("sourceNodeId", args.nodeId))
      .collect();

    // Get incoming links
    const incoming = await ctx.db
      .query("knowledgeLinks")
      .withIndex("by_target", (q) => q.eq("targetNodeId", args.nodeId))
      .collect();

    // Get connected node details
    const connectedNodeIds = new Set<string>();
    outgoing.forEach((link) => connectedNodeIds.add(link.targetNodeId));
    incoming.forEach((link) => connectedNodeIds.add(link.sourceNodeId));

    const connectedNodes = await Promise.all(
      Array.from(connectedNodeIds).map(async (id) => {
        const node = await ctx.db.get(id as any);
        return node;
      })
    );

    const nodeMap = new Map(
      connectedNodes.filter(Boolean).map((n) => [n!._id, n])
    );

    return {
      outgoing: outgoing.map((link) => ({
        ...link,
        targetNode: nodeMap.get(link.targetNodeId),
      })),
      incoming: incoming.map((link) => ({
        ...link,
        sourceNode: nodeMap.get(link.sourceNodeId),
      })),
    };
  },
});

export const getGraphNeighbors = query({
  args: {
    nodeId: v.id("researchNodes"),
    depth: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const maxDepth = args.depth ?? 2;
    const maxNodes = args.limit ?? 50;

    const visited = new Set<string>();
    const nodes: any[] = [];
    const edges: any[] = [];

    async function traverse(currentNodeId: string, currentDepth: number) {
      if (
        currentDepth > maxDepth ||
        visited.has(currentNodeId) ||
        nodes.length >= maxNodes
      ) {
        return;
      }

      visited.add(currentNodeId);

      const node = await ctx.db.get(currentNodeId as any);
      if (!node) return;

      nodes.push({
        id: node._id,
        title: node.title,
        nodeType: node.nodeType,
        summary: node.summary,
        depth: currentDepth,
      });

      if (currentDepth < maxDepth) {
        // Get outgoing links
        const outgoing = await ctx.db
          .query("knowledgeLinks")
          .withIndex("by_source", (q) => q.eq("sourceNodeId", currentNodeId as any))
          .collect();

        // Get incoming links
        const incoming = await ctx.db
          .query("knowledgeLinks")
          .withIndex("by_target", (q) => q.eq("targetNodeId", currentNodeId as any))
          .collect();

        for (const link of outgoing) {
          edges.push({
            id: link._id,
            source: link.sourceNodeId,
            target: link.targetNodeId,
            linkType: link.linkType,
            strength: link.strength,
          });
          await traverse(link.targetNodeId, currentDepth + 1);
        }

        for (const link of incoming) {
          if (!edges.find((e) => e.id === link._id)) {
            edges.push({
              id: link._id,
              source: link.sourceNodeId,
              target: link.targetNodeId,
              linkType: link.linkType,
              strength: link.strength,
            });
          }
          await traverse(link.sourceNodeId, currentDepth + 1);
        }
      }
    }

    await traverse(args.nodeId, 0);

    return { nodes, edges };
  },
});

// ===========================================================================
// KNOWLEDGE LINK MUTATIONS
// ===========================================================================

export const create = mutation({
  args: {
    sourceNodeId: v.id("researchNodes"),
    targetNodeId: v.id("researchNodes"),
    linkType: v.string(),
    strength: v.optional(v.number()),
    description: v.optional(v.string()),
    contextSnippet: v.optional(v.string()),
    isBidirectional: v.optional(v.boolean()),
    metadata: v.optional(v.any()),
    createdBy: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    // Check if link already exists
    const existing = await ctx.db
      .query("knowledgeLinks")
      .withIndex("by_source_target", (q) =>
        q.eq("sourceNodeId", args.sourceNodeId).eq("targetNodeId", args.targetNodeId)
      )
      .filter((q) => q.eq(q.field("linkType"), args.linkType))
      .first();

    if (existing) {
      throw new Error("Link already exists");
    }

    const linkId = await ctx.db.insert("knowledgeLinks", {
      sourceNodeId: args.sourceNodeId,
      targetNodeId: args.targetNodeId,
      linkType: args.linkType,
      strength: args.strength ?? 1.0,
      description: args.description,
      contextSnippet: args.contextSnippet,
      isVerified: false,
      isBidirectional: args.isBidirectional ?? false,
      metadata: args.metadata,
      createdBy: args.createdBy,
    });

    return linkId;
  },
});

export const update = mutation({
  args: {
    id: v.id("knowledgeLinks"),
    strength: v.optional(v.number()),
    description: v.optional(v.string()),
    contextSnippet: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(id, filteredUpdates);
    return await ctx.db.get(id);
  },
});

export const verify = mutation({
  args: {
    id: v.id("knowledgeLinks"),
    verifiedBy: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isVerified: true,
      verifiedBy: args.verifiedBy,
    });
    return await ctx.db.get(args.id);
  },
});

export const remove = mutation({
  args: { id: v.id("knowledgeLinks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ===========================================================================
// EVIDENCE CHAIN QUERIES & MUTATIONS
// ===========================================================================

export const getEvidenceForHypothesis = query({
  args: { hypothesisNodeId: v.id("researchNodes") },
  handler: async (ctx, args) => {
    const chains = await ctx.db
      .query("evidenceChains")
      .withIndex("by_hypothesis", (q) =>
        q.eq("hypothesisNodeId", args.hypothesisNodeId)
      )
      .collect();

    // Get evidence node details
    const chainsWithNodes = await Promise.all(
      chains.map(async (chain) => {
        const evidenceNode = await ctx.db.get(chain.evidenceNodeId);
        return {
          ...chain,
          evidenceNode: evidenceNode
            ? {
                _id: evidenceNode._id,
                title: evidenceNode.title,
                nodeType: evidenceNode.nodeType,
                summary: evidenceNode.summary,
              }
            : null,
        };
      })
    );

    return chainsWithNodes;
  },
});

export const getEvidenceSummary = query({
  args: { hypothesisNodeId: v.id("researchNodes") },
  handler: async (ctx, args) => {
    const chains = await ctx.db
      .query("evidenceChains")
      .withIndex("by_hypothesis", (q) =>
        q.eq("hypothesisNodeId", args.hypothesisNodeId)
      )
      .collect();

    const summary = {
      hypothesisId: args.hypothesisNodeId,
      totalEvidence: chains.length,
      supporting: chains.filter((c) => c.relationship === "supports").length,
      contradicting: chains.filter((c) => c.relationship === "contradicts").length,
      partial: chains.filter((c) => c.relationship === "partially_supports").length,
      inconclusive: chains.filter((c) => c.relationship === "inconclusive").length,
      avgConfidence:
        chains.length > 0
          ? chains.reduce((acc, c) => acc + (c.confidence ?? 0), 0) / chains.length
          : 0,
      strengthDistribution: chains.reduce(
        (acc, c) => {
          acc[c.strength] = (acc[c.strength] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      reproducibilityRate:
        chains.reduce((acc, c) => acc + c.reproductionAttempts, 0) > 0
          ? chains.reduce((acc, c) => acc + c.successfulReproductions, 0) /
            chains.reduce((acc, c) => acc + c.reproductionAttempts, 0)
          : null,
    };

    return summary;
  },
});

export const createEvidenceChain = mutation({
  args: {
    hypothesisNodeId: v.id("researchNodes"),
    evidenceNodeId: v.id("researchNodes"),
    relationship: v.string(),
    strength: v.string(),
    confidence: v.optional(v.number()),
    evidenceSummary: v.optional(v.string()),
    keyFindings: v.optional(v.array(v.string())),
    methodologyNotes: v.optional(v.string()),
    contextSnippet: v.optional(v.string()),
    pageReference: v.optional(v.string()),
    createdBy: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    // Check if chain already exists
    const existing = await ctx.db
      .query("evidenceChains")
      .withIndex("by_hypothesis_evidence", (q) =>
        q
          .eq("hypothesisNodeId", args.hypothesisNodeId)
          .eq("evidenceNodeId", args.evidenceNodeId)
      )
      .first();

    if (existing) {
      throw new Error("Evidence chain already exists");
    }

    const chainId = await ctx.db.insert("evidenceChains", {
      hypothesisNodeId: args.hypothesisNodeId,
      evidenceNodeId: args.evidenceNodeId,
      relationship: args.relationship,
      strength: args.strength,
      confidence: args.confidence,
      evidenceSummary: args.evidenceSummary,
      keyFindings: args.keyFindings,
      methodologyNotes: args.methodologyNotes,
      contextSnippet: args.contextSnippet,
      pageReference: args.pageReference,
      reproductionAttempts: 0,
      successfulReproductions: 0,
      isPeerReviewed: false,
      endorsements: 0,
      challenges: 0,
      createdBy: args.createdBy,
    });

    // Also create a knowledge link
    await ctx.db.insert("knowledgeLinks", {
      sourceNodeId: args.evidenceNodeId,
      targetNodeId: args.hypothesisNodeId,
      linkType: args.relationship,
      strength: args.confidence ?? 0.5,
      isVerified: false,
      createdBy: args.createdBy,
    });

    return chainId;
  },
});

export const endorseEvidence = mutation({
  args: { id: v.id("evidenceChains") },
  handler: async (ctx, args) => {
    const chain = await ctx.db.get(args.id);
    if (!chain) throw new Error("Evidence chain not found");

    await ctx.db.patch(args.id, {
      endorsements: chain.endorsements + 1,
    });
  },
});

export const challengeEvidence = mutation({
  args: { id: v.id("evidenceChains") },
  handler: async (ctx, args) => {
    const chain = await ctx.db.get(args.id);
    if (!chain) throw new Error("Evidence chain not found");

    await ctx.db.patch(args.id, {
      challenges: chain.challenges + 1,
    });
  },
});
