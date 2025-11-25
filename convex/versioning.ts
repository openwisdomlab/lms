import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { awardXp } from "./gamification";

// ===========================================================================
// NODE VERSION QUERIES
// ===========================================================================

export const getVersionsForNode = query({
  args: { nodeId: v.id("researchNodes") },
  handler: async (ctx, args) => {
    const versions = await ctx.db
      .query("nodeVersions")
      .withIndex("by_node", (q) => q.eq("nodeId", args.nodeId))
      .collect();

    // Sort by version number descending
    versions.sort((a, b) => b.versionNumber - a.versionNumber);

    // Get creator info
    const versionsWithCreator = await Promise.all(
      versions.map(async (version) => {
        const creator = await ctx.db.get(version.createdBy);
        return {
          ...version,
          creator: creator
            ? { displayName: creator.displayName, avatarUrl: creator.avatarUrl }
            : null,
        };
      })
    );

    return versionsWithCreator;
  },
});

export const getVersionById = query({
  args: { id: v.id("nodeVersions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getSpecificVersion = query({
  args: {
    nodeId: v.id("researchNodes"),
    versionNumber: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("nodeVersions")
      .withIndex("by_node_version", (q) =>
        q.eq("nodeId", args.nodeId).eq("versionNumber", args.versionNumber)
      )
      .first();
  },
});

// ===========================================================================
// NODE VERSION MUTATIONS
// ===========================================================================

export const createVersion = mutation({
  args: {
    nodeId: v.id("researchNodes"),
    changeMessage: v.optional(v.string()),
    changeType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const node = await ctx.db.get(args.nodeId);
    if (!node) throw new Error("Node not found");

    // Get next version number
    const existingVersions = await ctx.db
      .query("nodeVersions")
      .withIndex("by_node", (q) => q.eq("nodeId", args.nodeId))
      .collect();

    const maxVersion = existingVersions.reduce(
      (max, v) => Math.max(max, v.versionNumber),
      0
    );

    const versionId = await ctx.db.insert("nodeVersions", {
      nodeId: args.nodeId,
      versionNumber: maxVersion + 1,
      title: node.title,
      content: node.content,
      summary: node.summary,
      hypothesis: node.hypothesis,
      methodology: node.methodology,
      structuredContent: node.structuredContent,
      changeMessage: args.changeMessage ?? "Updated content",
      changeType: args.changeType ?? "minor",
      createdBy: node.createdBy,
    });

    // Update node's version counter
    await ctx.db.patch(args.nodeId, { version: maxVersion + 1 });

    return versionId;
  },
});

export const restoreVersion = mutation({
  args: {
    nodeId: v.id("researchNodes"),
    versionId: v.id("nodeVersions"),
  },
  handler: async (ctx, args) => {
    const version = await ctx.db.get(args.versionId);
    if (!version) throw new Error("Version not found");

    const node = await ctx.db.get(args.nodeId);
    if (!node) throw new Error("Node not found");

    // Create a new version with current state before restoring
    await ctx.db.insert("nodeVersions", {
      nodeId: args.nodeId,
      versionNumber: node.version + 1,
      title: node.title,
      content: node.content,
      summary: node.summary,
      hypothesis: node.hypothesis,
      methodology: node.methodology,
      structuredContent: node.structuredContent,
      changeMessage: `Before restoring to version ${version.versionNumber}`,
      changeType: "major",
      createdBy: node.createdBy,
    });

    // Restore the old version
    await ctx.db.patch(args.nodeId, {
      title: version.title,
      content: version.content,
      summary: version.summary,
      hypothesis: version.hypothesis,
      methodology: version.methodology,
      structuredContent: version.structuredContent,
      version: node.version + 2,
    });

    return { success: true };
  },
});

// ===========================================================================
// PUBLICATION REQUEST QUERIES
// ===========================================================================

export const getPublicationRequest = query({
  args: { id: v.id("publicationRequests") },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.id);
    if (!request) return null;

    const node = await ctx.db.get(request.nodeId);
    const creator = await ctx.db.get(request.createdBy);
    const reviewer = request.reviewerId
      ? await ctx.db.get(request.reviewerId)
      : null;

    return {
      ...request,
      node: node
        ? { _id: node._id, title: node.title, nodeType: node.nodeType }
        : null,
      creator: creator
        ? { displayName: creator.displayName, avatarUrl: creator.avatarUrl }
        : null,
      reviewer: reviewer
        ? { displayName: reviewer.displayName, avatarUrl: reviewer.avatarUrl }
        : null,
    };
  },
});

export const listPublicationRequests = query({
  args: {
    status: v.optional(v.string()),
    creatorId: v.optional(v.id("profiles")),
    reviewerId: v.optional(v.id("profiles")),
  },
  handler: async (ctx, args) => {
    let requests = await ctx.db.query("publicationRequests").collect();

    if (args.status) {
      requests = requests.filter((r) => r.status === args.status);
    }

    if (args.creatorId) {
      requests = requests.filter((r) => r.createdBy === args.creatorId);
    }

    if (args.reviewerId) {
      requests = requests.filter((r) => r.reviewerId === args.reviewerId);
    }

    // Sort by creation time descending
    requests.sort((a, b) => b._creationTime - a._creationTime);

    return requests;
  },
});

export const getPendingReviewsForUser = query({
  args: { reviewerId: v.id("profiles") },
  handler: async (ctx, args) => {
    const assignments = await ctx.db
      .query("reviewAssignments")
      .withIndex("by_reviewer", (q) => q.eq("reviewerId", args.reviewerId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    const requestsWithDetails = await Promise.all(
      assignments.map(async (assignment) => {
        const request = await ctx.db.get(assignment.publicationRequestId);
        const node = request ? await ctx.db.get(request.nodeId) : null;
        return {
          ...assignment,
          request,
          node: node
            ? { _id: node._id, title: node.title, nodeType: node.nodeType }
            : null,
        };
      })
    );

    return requestsWithDetails;
  },
});

// ===========================================================================
// PUBLICATION REQUEST MUTATIONS
// ===========================================================================

export const submitForPublication = mutation({
  args: {
    nodeId: v.id("researchNodes"),
    title: v.string(),
    description: v.optional(v.string()),
    targetChallengeId: v.optional(v.id("challenges")),
    createdBy: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    // Create a version snapshot
    const node = await ctx.db.get(args.nodeId);
    if (!node) throw new Error("Node not found");

    const existingVersions = await ctx.db
      .query("nodeVersions")
      .withIndex("by_node", (q) => q.eq("nodeId", args.nodeId))
      .collect();

    const maxVersion = existingVersions.reduce(
      (max, v) => Math.max(max, v.versionNumber),
      0
    );

    const versionId = await ctx.db.insert("nodeVersions", {
      nodeId: args.nodeId,
      versionNumber: maxVersion + 1,
      title: node.title,
      content: node.content,
      summary: node.summary,
      hypothesis: node.hypothesis,
      methodology: node.methodology,
      structuredContent: node.structuredContent,
      changeMessage: "Submitted for publication",
      changeType: "major",
      createdBy: args.createdBy,
    });

    // Create publication request
    const requestId = await ctx.db.insert("publicationRequests", {
      nodeId: args.nodeId,
      versionId,
      targetChallengeId: args.targetChallengeId,
      title: args.title,
      description: args.description,
      publicationType: args.targetChallengeId
        ? "challenge_submission"
        : "new_publication",
      status: "submitted",
      submittedAt: Date.now(),
      createdBy: args.createdBy,
    });

    return requestId;
  },
});

export const assignReviewer = mutation({
  args: {
    publicationRequestId: v.id("publicationRequests"),
    reviewerId: v.id("profiles"),
    assignedBy: v.optional(v.id("profiles")),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Update the request
    await ctx.db.patch(args.publicationRequestId, {
      reviewerId: args.reviewerId,
      status: "in_review",
    });

    // Create assignment record
    return await ctx.db.insert("reviewAssignments", {
      publicationRequestId: args.publicationRequestId,
      reviewerId: args.reviewerId,
      assignedBy: args.assignedBy,
      role: args.role ?? "reviewer",
      status: "pending",
      assignedAt: Date.now(),
    });
  },
});

export const submitReview = mutation({
  args: {
    publicationRequestId: v.id("publicationRequests"),
    reviewerId: v.id("profiles"),
    recommendation: v.string(), // approve, request_changes, reject
    reviewContent: v.optional(v.any()),
    reviewScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Update assignment
    const assignment = await ctx.db
      .query("reviewAssignments")
      .withIndex("by_request_reviewer", (q) =>
        q
          .eq("publicationRequestId", args.publicationRequestId)
          .eq("reviewerId", args.reviewerId)
      )
      .first();

    if (assignment) {
      await ctx.db.patch(assignment._id, {
        status: "completed",
        recommendation: args.recommendation,
        reviewContent: args.reviewContent,
        completedAt: Date.now(),
      });
    }

    // Update publication request status
    let newStatus: string;
    switch (args.recommendation) {
      case "approve":
        newStatus = "approved";
        break;
      case "request_changes":
        newStatus = "revision_requested";
        break;
      case "reject":
        newStatus = "rejected";
        break;
      default:
        newStatus = "in_review";
    }

    await ctx.db.patch(args.publicationRequestId, {
      status: newStatus,
      reviewedAt: Date.now(),
      reviewScore: args.reviewScore,
      reviewNotes: args.reviewContent,
    });

    return { success: true, newStatus };
  },
});

export const publishNode = mutation({
  args: { publicationRequestId: v.id("publicationRequests") },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.publicationRequestId);
    if (!request) throw new Error("Publication request not found");

    // Update request status
    await ctx.db.patch(args.publicationRequestId, {
      status: "published",
      publishedAt: Date.now(),
    });

    // Make node public and mark as verified
    await ctx.db.patch(request.nodeId, {
      isPublic: true,
      isVerified: true,
      isCanonical: true,
    });

    // Award XP
    const node = await ctx.db.get(request.nodeId);
    if (node) {
      await awardXp(ctx, {
        userId: node.createdBy,
        amount: 100,
        reason: "Research published",
        sourceType: "publication",
        sourceId: args.publicationRequestId,
      });
    }

    return { success: true };
  },
});

// ===========================================================================
// MERGE REQUEST QUERIES & MUTATIONS
// ===========================================================================

export const getMergeRequest = query({
  args: { id: v.id("mergeRequests") },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.id);
    if (!request) return null;

    const sourceNode = await ctx.db.get(request.sourceNodeId);
    const targetNode = await ctx.db.get(request.targetNodeId);
    const creator = await ctx.db.get(request.createdBy);

    return {
      ...request,
      sourceNode: sourceNode
        ? { _id: sourceNode._id, title: sourceNode.title }
        : null,
      targetNode: targetNode
        ? { _id: targetNode._id, title: targetNode.title }
        : null,
      creator: creator
        ? { displayName: creator.displayName, avatarUrl: creator.avatarUrl }
        : null,
    };
  },
});

export const listMergeRequests = query({
  args: {
    status: v.optional(v.string()),
    targetNodeId: v.optional(v.id("researchNodes")),
  },
  handler: async (ctx, args) => {
    let requests = await ctx.db.query("mergeRequests").collect();

    if (args.status) {
      requests = requests.filter((r) => r.status === args.status);
    }

    if (args.targetNodeId) {
      requests = requests.filter((r) => r.targetNodeId === args.targetNodeId);
    }

    return requests;
  },
});

export const createMergeRequest = mutation({
  args: {
    sourceNodeId: v.id("researchNodes"),
    targetNodeId: v.id("researchNodes"),
    title: v.string(),
    description: v.optional(v.string()),
    createdBy: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const sourceNode = await ctx.db.get(args.sourceNodeId);
    const targetNode = await ctx.db.get(args.targetNodeId);

    if (!sourceNode || !targetNode) {
      throw new Error("Source or target node not found");
    }

    // Find common ancestor using ancestry
    const sourceAncestry = await ctx.db
      .query("nodeAncestry")
      .withIndex("by_node", (q) => q.eq("nodeId", args.sourceNodeId))
      .first();

    const targetAncestry = await ctx.db
      .query("nodeAncestry")
      .withIndex("by_node", (q) => q.eq("nodeId", args.targetNodeId))
      .first();

    let commonAncestorId: any = undefined;
    if (sourceAncestry && targetAncestry) {
      for (const ancestorId of sourceAncestry.ancestryPath) {
        if (targetAncestry.ancestryPath.includes(ancestorId)) {
          commonAncestorId = ancestorId;
          break;
        }
      }
    }

    return await ctx.db.insert("mergeRequests", {
      sourceNodeId: args.sourceNodeId,
      targetNodeId: args.targetNodeId,
      title: args.title,
      description: args.description,
      commonAncestorId,
      strategy: "recursive",
      status: "pending",
      hasConflicts: false,
      reviewers: [],
      approvals: 0,
      requiredApprovals: 1,
      submittedAt: Date.now(),
      createdBy: args.createdBy,
    });
  },
});

export const approveMergeRequest = mutation({
  args: {
    id: v.id("mergeRequests"),
    approverId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.id);
    if (!request) throw new Error("Merge request not found");

    const newApprovals = request.approvals + 1;
    const newReviewers = [...request.reviewers, args.approverId];

    await ctx.db.patch(args.id, {
      approvals: newApprovals,
      reviewers: newReviewers,
      status: newApprovals >= request.requiredApprovals ? "approved" : "reviewing",
      reviewedAt: Date.now(),
    });

    return { success: true, approved: newApprovals >= request.requiredApprovals };
  },
});

export const executeMerge = mutation({
  args: {
    id: v.id("mergeRequests"),
    resolvedContent: v.optional(v.any()),
    mergedBy: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.id);
    if (!request) throw new Error("Merge request not found");

    if (request.status !== "approved") {
      throw new Error("Merge request is not approved");
    }

    const sourceNode = await ctx.db.get(request.sourceNodeId);
    const targetNode = await ctx.db.get(request.targetNodeId);

    if (!sourceNode || !targetNode) {
      throw new Error("Source or target node not found");
    }

    // Create version snapshot before merge
    const existingVersions = await ctx.db
      .query("nodeVersions")
      .withIndex("by_node", (q) => q.eq("nodeId", request.targetNodeId))
      .collect();

    const maxVersion = existingVersions.reduce(
      (max, v) => Math.max(max, v.versionNumber),
      0
    );

    await ctx.db.insert("nodeVersions", {
      nodeId: request.targetNodeId,
      versionNumber: maxVersion + 1,
      title: targetNode.title,
      content: targetNode.content,
      summary: targetNode.summary,
      hypothesis: targetNode.hypothesis,
      methodology: targetNode.methodology,
      structuredContent: targetNode.structuredContent,
      changeMessage: `Before merge: ${request.title}`,
      changeType: "major",
      createdBy: args.mergedBy,
    });

    // Merge content
    await ctx.db.patch(request.targetNodeId, {
      content: args.resolvedContent ?? sourceNode.content,
      structuredContent: sourceNode.structuredContent ?? targetNode.structuredContent,
      hypothesis: sourceNode.hypothesis ?? targetNode.hypothesis,
      methodology: sourceNode.methodology ?? targetNode.methodology,
      version: maxVersion + 2,
    });

    // Update merge request
    await ctx.db.patch(args.id, {
      status: "merged",
      mergedAt: Date.now(),
      mergedBy: args.mergedBy,
    });

    // Update ancestry to show merge
    const targetAncestry = await ctx.db
      .query("nodeAncestry")
      .withIndex("by_node", (q) => q.eq("nodeId", request.targetNodeId))
      .first();

    if (targetAncestry) {
      await ctx.db.patch(targetAncestry._id, {
        isMergeCommit: true,
        mergeParents: [request.sourceNodeId, request.targetNodeId],
      });
    }

    // Award XP to source node creator
    await awardXp(ctx, {
      userId: sourceNode.createdBy,
      amount: 50,
      reason: "Contribution merged",
      sourceType: "merge",
      sourceId: args.id,
    });

    // Update fork network
    const rootId = targetNode.rootId ?? request.targetNodeId;
    const forkNetwork = await ctx.db
      .query("forkNetwork")
      .withIndex("by_root", (q) => q.eq("rootNodeId", rootId))
      .first();

    if (forkNetwork) {
      await ctx.db.patch(forkNetwork._id, {
        lastMergeAt: Date.now(),
        totalMergedContributions: forkNetwork.totalMergedContributions + 1,
      });
    }

    return { success: true };
  },
});
