import { query, mutation, internalMutation, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// ===========================================================================
// XP & LEVEL QUERIES
// ===========================================================================

export const getXpTransactions = query({
  args: {
    userId: v.id("profiles"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("xpTransactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit ?? 50);

    return transactions;
  },
});

export const getUserStats = query({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.userId);
    if (!profile) return null;

    // Count nodes
    const nodes = await ctx.db
      .query("researchNodes")
      .withIndex("by_creator", (q) => q.eq("createdBy", args.userId))
      .collect();

    // Count artifacts
    const artifacts = await ctx.db
      .query("artifacts")
      .withIndex("by_creator", (q) => q.eq("createdBy", args.userId))
      .collect();

    // Count links created
    const links = await ctx.db
      .query("knowledgeLinks")
      .filter((q) => q.eq(q.field("createdBy"), args.userId))
      .collect();

    // Count badges
    const badges = await ctx.db
      .query("userBadges")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Count teams
    const teams = await ctx.db
      .query("teamMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return {
      userId: args.userId,
      xp: profile.xp,
      level: profile.level,
      streakDays: profile.streakDays,
      nodesCreated: nodes.length,
      artifactsCreated: artifacts.length,
      linksCreated: links.length,
      badgesEarned: badges.length,
      teamsJoined: teams.length,
    };
  },
});

// ===========================================================================
// XP MUTATIONS
// ===========================================================================

// Internal helper function for awarding XP (can be called from other mutations)
export async function awardXp(
  ctx: MutationCtx,
  args: {
    userId: Id<"profiles">;
    amount: number;
    reason: string;
    sourceType?: string;
    sourceId?: Id<any>;
  }
) {
  const profile = await ctx.db.get(args.userId);
  if (!profile) throw new Error("Profile not found");

  // Record transaction
  await ctx.db.insert("xpTransactions", {
    userId: args.userId,
    amount: args.amount,
    reason: args.reason,
    sourceType: args.sourceType,
    sourceId: args.sourceId?.toString(),
  });

  // Calculate new XP and level
  const newXp = profile.xp + args.amount;
  const newLevel = Math.max(1, Math.floor(newXp / 1000) + 1);

  // Update profile
  await ctx.db.patch(args.userId, {
    xp: newXp,
    level: newLevel,
  });

  return { newXp, newLevel };
}

export const awardXpMutation = mutation({
  args: {
    userId: v.id("profiles"),
    amount: v.number(),
    reason: v.string(),
    sourceType: v.optional(v.string()),
    sourceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await awardXp(ctx, {
      userId: args.userId,
      amount: args.amount,
      reason: args.reason,
      sourceType: args.sourceType,
      sourceId: args.sourceId as any,
    });
  },
});

// ===========================================================================
// BADGE QUERIES
// ===========================================================================

export const listBadges = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query("badges")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    }
    return await ctx.db.query("badges").collect();
  },
});

export const getBadgeBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("badges")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const getUserBadges = query({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    const userBadges = await ctx.db
      .query("userBadges")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get badge details
    const badgesWithDetails = await Promise.all(
      userBadges.map(async (ub) => {
        const badge = await ctx.db.get(ub.badgeId);
        return {
          ...ub,
          badge,
        };
      })
    );

    return badgesWithDetails;
  },
});

// ===========================================================================
// BADGE MUTATIONS
// ===========================================================================

export const createBadge = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    iconUrl: v.optional(v.string()),
    category: v.string(),
    requirementType: v.string(),
    requirementValue: v.number(),
    requirementMetadata: v.optional(v.any()),
    xpBonus: v.optional(v.number()),
    isRare: v.optional(v.boolean()),
    isHidden: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("badges", {
      name: args.name,
      slug: args.slug,
      description: args.description,
      iconUrl: args.iconUrl,
      category: args.category,
      requirementType: args.requirementType,
      requirementValue: args.requirementValue,
      requirementMetadata: args.requirementMetadata,
      xpBonus: args.xpBonus ?? 0,
      isRare: args.isRare ?? false,
      isHidden: args.isHidden ?? false,
    });
  },
});

export const awardBadge = mutation({
  args: {
    userId: v.id("profiles"),
    badgeId: v.id("badges"),
    earnedFor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if already earned
    const existing = await ctx.db
      .query("userBadges")
      .withIndex("by_user_badge", (q) =>
        q.eq("userId", args.userId).eq("badgeId", args.badgeId)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    // Get badge for XP bonus
    const badge = await ctx.db.get(args.badgeId);
    if (!badge) throw new Error("Badge not found");

    // Award badge
    const userBadgeId = await ctx.db.insert("userBadges", {
      userId: args.userId,
      badgeId: args.badgeId,
      earnedAt: Date.now(),
      earnedFor: args.earnedFor,
    });

    // Award XP bonus if any
    if (badge.xpBonus > 0) {
      await awardXp(ctx, {
        userId: args.userId,
        amount: badge.xpBonus,
        reason: `Earned badge: ${badge.name}`,
        sourceType: "badge",
        sourceId: args.badgeId,
      });
    }

    return userBadgeId;
  },
});

// ===========================================================================
// PROGRESS TRACKING
// ===========================================================================

export const getChallengeProgress = query({
  args: {
    userId: v.id("profiles"),
    challengeId: v.id("challenges"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("challengeProgress")
      .withIndex("by_user_challenge", (q) =>
        q.eq("userId", args.userId).eq("challengeId", args.challengeId)
      )
      .first();
  },
});

export const listUserChallengeProgress = query({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("challengeProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get challenge details
    const progressWithChallenges = await Promise.all(
      progress.map(async (p) => {
        const challenge = await ctx.db.get(p.challengeId);
        return {
          ...p,
          challenge,
        };
      })
    );

    return progressWithChallenges;
  },
});

export const updateChallengeProgress = mutation({
  args: {
    userId: v.id("profiles"),
    challengeId: v.id("challenges"),
    status: v.optional(v.string()),
    progressPercentage: v.optional(v.number()),
    milestones: v.optional(v.array(v.any())),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("challengeProgress")
      .withIndex("by_user_challenge", (q) =>
        q.eq("userId", args.userId).eq("challengeId", args.challengeId)
      )
      .first();

    const now = Date.now();

    if (existing) {
      const updates: any = { lastActivityAt: now };
      if (args.status !== undefined) updates.status = args.status;
      if (args.progressPercentage !== undefined)
        updates.progressPercentage = args.progressPercentage;
      if (args.milestones !== undefined) updates.milestones = args.milestones;

      if (args.status === "completed" && existing.status !== "completed") {
        updates.completedAt = now;

        // Award challenge XP
        const challenge = await ctx.db.get(args.challengeId);
        if (challenge) {
          await awardXp(ctx, {
            userId: args.userId,
            amount: challenge.xpReward,
            reason: `Completed challenge: ${challenge.title}`,
            sourceType: "challenge",
            sourceId: args.challengeId,
          });
        }
      }

      await ctx.db.patch(existing._id, updates);
      return existing._id;
    } else {
      return await ctx.db.insert("challengeProgress", {
        userId: args.userId,
        challengeId: args.challengeId,
        status: args.status ?? "in_progress",
        progressPercentage: args.progressPercentage ?? 0,
        milestones: args.milestones ?? [],
        startedAt: now,
        lastActivityAt: now,
      });
    }
  },
});

// ===========================================================================
// NODE INTERACTIONS
// ===========================================================================

export const recordInteraction = mutation({
  args: {
    userId: v.id("profiles"),
    nodeId: v.id("researchNodes"),
    interactionType: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if interaction already exists
    const existing = await ctx.db
      .query("nodeInteractions")
      .withIndex("by_user_node_type", (q) =>
        q
          .eq("userId", args.userId)
          .eq("nodeId", args.nodeId)
          .eq("interactionType", args.interactionType)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("nodeInteractions", {
      userId: args.userId,
      nodeId: args.nodeId,
      interactionType: args.interactionType,
    });
  },
});

export const removeInteraction = mutation({
  args: {
    userId: v.id("profiles"),
    nodeId: v.id("researchNodes"),
    interactionType: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("nodeInteractions")
      .withIndex("by_user_node_type", (q) =>
        q
          .eq("userId", args.userId)
          .eq("nodeId", args.nodeId)
          .eq("interactionType", args.interactionType)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const getUserInteractions = query({
  args: {
    userId: v.id("profiles"),
    interactionType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const interactions = await ctx.db
      .query("nodeInteractions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    if (args.interactionType) {
      return interactions.filter(
        (i) => i.interactionType === args.interactionType
      );
    }

    return interactions;
  },
});
