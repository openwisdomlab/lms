import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ===========================================================================
// RESEARCH NODE QUERIES
// ===========================================================================

export const getById = query({
  args: { id: v.id("researchNodes") },
  handler: async (ctx, args) => {
    const node = await ctx.db.get(args.id);
    if (!node) return null;

    const creator = await ctx.db.get(node.createdBy);
    return {
      ...node,
      creator: creator
        ? { displayName: creator.displayName, avatarUrl: creator.avatarUrl }
        : null,
    };
  },
});

export const getBySlug = query({
  args: { slug: v.string(), creatorId: v.id("profiles") },
  handler: async (ctx, args) => {
    const nodes = await ctx.db
      .query("researchNodes")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .collect();

    // Filter by creator
    return nodes.find((n) => n.createdBy === args.creatorId) ?? null;
  },
});

export const listPublic = query({
  args: {
    nodeType: v.optional(v.string()),
    challengeId: v.optional(v.id("challenges")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let nodes = await ctx.db
      .query("researchNodes")
      .withIndex("by_public", (q) => q.eq("isPublic", true))
      .collect();

    // Filter by node type
    if (args.nodeType) {
      nodes = nodes.filter((n) => n.nodeType === args.nodeType);
    }

    // Filter by challenge
    if (args.challengeId) {
      nodes = nodes.filter((n) => n.challengeId === args.challengeId);
    }

    // Apply limit
    if (args.limit) {
      nodes = nodes.slice(0, args.limit);
    }

    // Get creator info
    const nodesWithCreator = await Promise.all(
      nodes.map(async (node) => {
        const creator = await ctx.db.get(node.createdBy);
        return {
          ...node,
          creator: creator
            ? { displayName: creator.displayName, avatarUrl: creator.avatarUrl }
            : null,
        };
      })
    );

    return nodesWithCreator;
  },
});

export const listByCreator = query({
  args: { creatorId: v.id("profiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("researchNodes")
      .withIndex("by_creator", (q) => q.eq("createdBy", args.creatorId))
      .collect();
  },
});

export const listByChallenge = query({
  args: { challengeId: v.id("challenges") },
  handler: async (ctx, args) => {
    const nodes = await ctx.db
      .query("researchNodes")
      .withIndex("by_challenge", (q) => q.eq("challengeId", args.challengeId))
      .collect();

    // Only return public nodes
    return nodes.filter((n) => n.isPublic);
  },
});

export const listForks = query({
  args: { nodeId: v.id("researchNodes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("researchNodes")
      .withIndex("by_forked_from", (q) => q.eq("forkedFromId", args.nodeId))
      .collect();
  },
});

export const getWithCollaborators = query({
  args: { id: v.id("researchNodes") },
  handler: async (ctx, args) => {
    const node = await ctx.db.get(args.id);
    if (!node) return null;

    const collaborators = await ctx.db
      .query("nodeCollaborators")
      .withIndex("by_node", (q) => q.eq("nodeId", args.id))
      .collect();

    const collaboratorProfiles = await Promise.all(
      collaborators.map(async (c) => {
        const profile = await ctx.db.get(c.userId);
        return {
          ...c,
          profile: profile
            ? { displayName: profile.displayName, avatarUrl: profile.avatarUrl }
            : null,
        };
      })
    );

    const creator = await ctx.db.get(node.createdBy);

    return {
      ...node,
      creator: creator
        ? { displayName: creator.displayName, avatarUrl: creator.avatarUrl }
        : null,
      collaborators: collaboratorProfiles,
    };
  },
});

// ===========================================================================
// RESEARCH NODE MUTATIONS
// ===========================================================================

export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    nodeType: v.string(),
    content: v.any(),
    summary: v.optional(v.string()),
    challengeId: v.optional(v.id("challenges")),
    parentNodeId: v.optional(v.id("researchNodes")),
    hypothesis: v.optional(v.string()),
    methodology: v.optional(v.string()),
    confidenceLevel: v.optional(v.number()),
    isPublic: v.optional(v.boolean()),
    isCollaborative: v.optional(v.boolean()),
    structuredContent: v.optional(v.any()),
    createdBy: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const nodeId = await ctx.db.insert("researchNodes", {
      title: args.title,
      slug: args.slug,
      nodeType: args.nodeType,
      content: args.content,
      summary: args.summary,
      challengeId: args.challengeId,
      parentNodeId: args.parentNodeId,
      hypothesis: args.hypothesis,
      methodology: args.methodology,
      confidenceLevel: args.confidenceLevel,
      isPublic: args.isPublic ?? false,
      isVerified: false,
      isCollaborative: args.isCollaborative ?? false,
      version: 1,
      forkCount: 0,
      viewCount: 0,
      citationCount: 0,
      structuredContent: args.structuredContent,
      createdBy: args.createdBy,
    });

    // Create ancestry record
    await ctx.db.insert("nodeAncestry", {
      nodeId: nodeId,
      ancestryPath: [],
      forkDepth: 0,
      isMergeCommit: false,
      derivationType: "original",
    });

    return nodeId;
  },
});

export const update = mutation({
  args: {
    id: v.id("researchNodes"),
    title: v.optional(v.string()),
    content: v.optional(v.any()),
    summary: v.optional(v.string()),
    hypothesis: v.optional(v.string()),
    methodology: v.optional(v.string()),
    confidenceLevel: v.optional(v.number()),
    structuredContent: v.optional(v.any()),
    dataAttachments: v.optional(v.array(v.any())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const node = await ctx.db.get(id);
    if (!node) throw new Error("Node not found");

    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    // Increment version on update
    await ctx.db.patch(id, {
      ...filteredUpdates,
      version: node.version + 1,
    });

    return await ctx.db.get(id);
  },
});

export const setPublic = mutation({
  args: {
    id: v.id("researchNodes"),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isPublic: args.isPublic });
    return await ctx.db.get(args.id);
  },
});

export const incrementViewCount = mutation({
  args: { id: v.id("researchNodes") },
  handler: async (ctx, args) => {
    const node = await ctx.db.get(args.id);
    if (!node) throw new Error("Node not found");

    await ctx.db.patch(args.id, { viewCount: node.viewCount + 1 });
  },
});

export const fork = mutation({
  args: {
    sourceNodeId: v.id("researchNodes"),
    userId: v.id("profiles"),
    newTitle: v.optional(v.string()),
    forkReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sourceNode = await ctx.db.get(args.sourceNodeId);
    if (!sourceNode) throw new Error("Source node not found");

    // Get parent ancestry
    const parentAncestry = await ctx.db
      .query("nodeAncestry")
      .withIndex("by_node", (q) => q.eq("nodeId", args.sourceNodeId))
      .first();

    // Determine root
    const rootId = sourceNode.rootId ?? args.sourceNodeId;

    // Create the forked node
    const newNodeId = await ctx.db.insert("researchNodes", {
      title: args.newTitle ?? `${sourceNode.title} (Fork)`,
      slug: `${sourceNode.slug}-fork-${Date.now().toString(36)}`,
      nodeType: sourceNode.nodeType,
      content: sourceNode.content,
      summary: sourceNode.summary,
      challengeId: sourceNode.challengeId,
      forkedFromId: args.sourceNodeId,
      rootId: rootId,
      branchType: "fork",
      hypothesis: sourceNode.hypothesis,
      methodology: sourceNode.methodology,
      confidenceLevel: sourceNode.confidenceLevel,
      structuredContent: sourceNode.structuredContent,
      isPublic: false,
      isVerified: false,
      isCollaborative: false,
      version: 1,
      forkCount: 0,
      viewCount: 0,
      citationCount: 0,
      createdBy: args.userId,
    });

    // Create ancestry record
    const ancestryPath = parentAncestry
      ? [...parentAncestry.ancestryPath, args.sourceNodeId]
      : [args.sourceNodeId];

    await ctx.db.insert("nodeAncestry", {
      nodeId: newNodeId,
      parentNodeId: args.sourceNodeId,
      parentVersion: sourceNode.version,
      ancestryPath: ancestryPath,
      forkDepth: (parentAncestry?.forkDepth ?? 0) + 1,
      isMergeCommit: false,
      derivationType: "fork",
      derivationReason: args.forkReason,
    });

    // Update fork count on source
    await ctx.db.patch(args.sourceNodeId, {
      forkCount: sourceNode.forkCount + 1,
    });

    // Create knowledge link
    await ctx.db.insert("knowledgeLinks", {
      sourceNodeId: newNodeId,
      targetNodeId: args.sourceNodeId,
      linkType: "derived_from",
      strength: 1.0,
      isVerified: true,
      createdBy: args.userId,
    });

    // Award XP
    const { awardXp } = await import("./gamification");
    await awardXp(ctx, {
      userId: args.userId,
      amount: 10,
      reason: "Forked a research node",
      sourceType: "node",
      sourceId: newNodeId,
    });

    // Update fork network
    const existingNetwork = await ctx.db
      .query("forkNetwork")
      .withIndex("by_root", (q) => q.eq("rootNodeId", rootId))
      .first();

    if (existingNetwork) {
      await ctx.db.patch(existingNetwork._id, {
        totalForks: existingNetwork.totalForks + 1,
        lastForkAt: Date.now(),
      });
    } else {
      await ctx.db.insert("forkNetwork", {
        rootNodeId: rootId,
        totalForks: 1,
        activeBranches: 1,
        totalContributors: 1,
        totalMergedContributions: 0,
        lastForkAt: Date.now(),
      });
    }

    return newNodeId;
  },
});

export const remove = mutation({
  args: { id: v.id("researchNodes") },
  handler: async (ctx, args) => {
    // Delete related records
    const links = await ctx.db
      .query("knowledgeLinks")
      .filter((q) =>
        q.or(
          q.eq(q.field("sourceNodeId"), args.id),
          q.eq(q.field("targetNodeId"), args.id)
        )
      )
      .collect();

    for (const link of links) {
      await ctx.db.delete(link._id);
    }

    const collaborators = await ctx.db
      .query("nodeCollaborators")
      .withIndex("by_node", (q) => q.eq("nodeId", args.id))
      .collect();

    for (const collaborator of collaborators) {
      await ctx.db.delete(collaborator._id);
    }

    await ctx.db.delete(args.id);
  },
});

// ===========================================================================
// COLLABORATOR MUTATIONS
// ===========================================================================

export const addCollaborator = mutation({
  args: {
    nodeId: v.id("researchNodes"),
    userId: v.id("profiles"),
    canEdit: v.optional(v.boolean()),
    canDelete: v.optional(v.boolean()),
    canInvite: v.optional(v.boolean()),
    invitedBy: v.optional(v.id("profiles")),
  },
  handler: async (ctx, args) => {
    // Check if already a collaborator
    const existing = await ctx.db
      .query("nodeCollaborators")
      .withIndex("by_node_user", (q) =>
        q.eq("nodeId", args.nodeId).eq("userId", args.userId)
      )
      .first();

    if (existing) {
      throw new Error("User is already a collaborator");
    }

    return await ctx.db.insert("nodeCollaborators", {
      nodeId: args.nodeId,
      userId: args.userId,
      canEdit: args.canEdit ?? true,
      canDelete: args.canDelete ?? false,
      canInvite: args.canInvite ?? false,
      invitedBy: args.invitedBy,
      joinedAt: Date.now(),
    });
  },
});

export const removeCollaborator = mutation({
  args: {
    nodeId: v.id("researchNodes"),
    userId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("nodeCollaborators")
      .withIndex("by_node_user", (q) =>
        q.eq("nodeId", args.nodeId).eq("userId", args.userId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const updateCollaboratorPermissions = mutation({
  args: {
    nodeId: v.id("researchNodes"),
    userId: v.id("profiles"),
    canEdit: v.optional(v.boolean()),
    canDelete: v.optional(v.boolean()),
    canInvite: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("nodeCollaborators")
      .withIndex("by_node_user", (q) =>
        q.eq("nodeId", args.nodeId).eq("userId", args.userId)
      )
      .first();

    if (!existing) {
      throw new Error("Collaborator not found");
    }

    const updates: Record<string, boolean> = {};
    if (args.canEdit !== undefined) updates.canEdit = args.canEdit;
    if (args.canDelete !== undefined) updates.canDelete = args.canDelete;
    if (args.canInvite !== undefined) updates.canInvite = args.canInvite;

    await ctx.db.patch(existing._id, updates);
  },
});
