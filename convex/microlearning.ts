import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { awardXp } from "./gamification";

// ===========================================================================
// LEARNING UNIT QUERIES
// ===========================================================================

export const getUnitById = query({
  args: { id: v.id("learningUnits") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getUnitBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("learningUnits")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const listPublishedUnits = query({
  args: {
    unitType: v.optional(v.string()),
    challengeId: v.optional(v.id("challenges")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let units = await ctx.db
      .query("learningUnits")
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();

    if (args.unitType) {
      units = units.filter((u) => u.unitType === args.unitType);
    }

    if (args.challengeId) {
      units = units.filter((u) => u.challengeId === args.challengeId);
    }

    if (args.limit) {
      units = units.slice(0, args.limit);
    }

    return units;
  },
});

// ===========================================================================
// LEARNING PATH QUERIES
// ===========================================================================

export const getPathById = query({
  args: { id: v.id("learningPaths") },
  handler: async (ctx, args) => {
    const path = await ctx.db.get(args.id);
    if (!path) return null;

    // Get path units
    const pathUnits = await ctx.db
      .query("pathUnits")
      .withIndex("by_path", (q) => q.eq("pathId", args.id))
      .collect();

    // Sort by position
    pathUnits.sort((a, b) => a.position - b.position);

    // Get unit details
    const unitsWithDetails = await Promise.all(
      pathUnits.map(async (pu) => {
        const unit = await ctx.db.get(pu.unitId);
        return {
          ...pu,
          unit,
        };
      })
    );

    return {
      ...path,
      units: unitsWithDetails,
    };
  },
});

export const getPathBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("learningPaths")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const listPublishedPaths = query({
  args: {
    challengeId: v.optional(v.id("challenges")),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let paths = await ctx.db
      .query("learningPaths")
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();

    if (args.challengeId) {
      paths = paths.filter((p) => p.challengeId === args.challengeId);
    }

    if (args.featured) {
      paths = paths.filter((p) => p.isFeatured);
    }

    return paths;
  },
});

// ===========================================================================
// USER PROGRESS QUERIES
// ===========================================================================

export const getUserUnitProgress = query({
  args: {
    userId: v.id("profiles"),
    unitId: v.id("learningUnits"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userUnitProgress")
      .withIndex("by_user_unit", (q) =>
        q.eq("userId", args.userId).eq("unitId", args.unitId)
      )
      .first();
  },
});

export const getUserPathProgress = query({
  args: {
    userId: v.id("profiles"),
    pathId: v.id("learningPaths"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userPathProgress")
      .withIndex("by_user_path", (q) =>
        q.eq("userId", args.userId).eq("pathId", args.pathId)
      )
      .first();
  },
});

export const getUserAllProgress = query({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    const unitProgress = await ctx.db
      .query("userUnitProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const pathProgress = await ctx.db
      .query("userPathProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get units and paths details
    const unitsWithDetails = await Promise.all(
      unitProgress.map(async (up) => {
        const unit = await ctx.db.get(up.unitId);
        return { ...up, unit };
      })
    );

    const pathsWithDetails = await Promise.all(
      pathProgress.map(async (pp) => {
        const path = await ctx.db.get(pp.pathId);
        return { ...pp, path };
      })
    );

    return {
      units: unitsWithDetails,
      paths: pathsWithDetails,
    };
  },
});

export const getDailyReviewQueue = query({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const queue = await ctx.db
      .query("dailyReviewQueue")
      .withIndex("by_user_pending", (q) =>
        q.eq("userId", args.userId).eq("scheduledDate", todayTimestamp).eq("isCompleted", false)
      )
      .collect();

    // Get unit details
    const queueWithUnits = await Promise.all(
      queue.map(async (item) => {
        const unit = await ctx.db.get(item.unitId);
        return { ...item, unit };
      })
    );

    // Sort by priority
    queueWithUnits.sort((a, b) => b.priority - a.priority);

    return queueWithUnits;
  },
});

export const getUnitsForReview = query({
  args: {
    userId: v.id("profiles"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const progress = await ctx.db
      .query("userUnitProgress")
      .withIndex("by_user_review", (q) => q.eq("userId", args.userId))
      .collect();

    // Filter to units due for review
    const dueForReview = progress.filter(
      (p) => p.nextReviewAt && p.nextReviewAt <= now
    );

    // Sort by due date
    dueForReview.sort((a, b) => (a.nextReviewAt ?? 0) - (b.nextReviewAt ?? 0));

    const limited = args.limit ? dueForReview.slice(0, args.limit) : dueForReview;

    // Get unit details
    const withUnits = await Promise.all(
      limited.map(async (p) => {
        const unit = await ctx.db.get(p.unitId);
        return { ...p, unit };
      })
    );

    return withUnits;
  },
});

// ===========================================================================
// LEARNING UNIT MUTATIONS
// ===========================================================================

export const createUnit = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    unitType: v.string(),
    content: v.any(),
    summary: v.optional(v.string()),
    estimatedMinutes: v.optional(v.number()),
    frontContent: v.optional(v.any()),
    backContent: v.optional(v.any()),
    hints: v.optional(v.any()),
    challengeId: v.optional(v.id("challenges")),
    researchNodeId: v.optional(v.id("researchNodes")),
    prerequisiteUnits: v.optional(v.array(v.id("learningUnits"))),
    difficultyScore: v.optional(v.number()),
    keywords: v.optional(v.array(v.string())),
    xpReward: v.optional(v.number()),
    createdBy: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("learningUnits", {
      title: args.title,
      slug: args.slug,
      unitType: args.unitType,
      content: args.content,
      summary: args.summary,
      estimatedMinutes: args.estimatedMinutes ?? 3,
      frontContent: args.frontContent,
      backContent: args.backContent,
      hints: args.hints,
      challengeId: args.challengeId,
      researchNodeId: args.researchNodeId,
      prerequisiteUnits: args.prerequisiteUnits,
      difficultyScore: args.difficultyScore ?? 0.5,
      keywords: args.keywords,
      isPublished: false,
      xpReward: args.xpReward ?? 10,
      totalAttempts: 0,
      createdBy: args.createdBy,
    });
  },
});

export const updateUnit = mutation({
  args: {
    id: v.id("learningUnits"),
    title: v.optional(v.string()),
    content: v.optional(v.any()),
    summary: v.optional(v.string()),
    frontContent: v.optional(v.any()),
    backContent: v.optional(v.any()),
    hints: v.optional(v.any()),
    difficultyScore: v.optional(v.number()),
    keywords: v.optional(v.array(v.string())),
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

export const publishUnit = mutation({
  args: { id: v.id("learningUnits") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isPublished: true });
    return await ctx.db.get(args.id);
  },
});

// ===========================================================================
// LEARNING PATH MUTATIONS
// ===========================================================================

export const createPath = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    targetAudience: v.optional(v.string()),
    learningObjectives: v.optional(v.array(v.string())),
    estimatedHours: v.optional(v.number()),
    challengeId: v.optional(v.id("challenges")),
    completionXp: v.optional(v.number()),
    createdBy: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("learningPaths", {
      title: args.title,
      slug: args.slug,
      description: args.description,
      coverImageUrl: args.coverImageUrl,
      targetAudience: args.targetAudience,
      learningObjectives: args.learningObjectives,
      estimatedHours: args.estimatedHours,
      challengeId: args.challengeId,
      isPublished: false,
      isFeatured: false,
      completionXp: args.completionXp ?? 200,
      createdBy: args.createdBy,
    });
  },
});

export const addUnitToPath = mutation({
  args: {
    pathId: v.id("learningPaths"),
    unitId: v.id("learningUnits"),
    position: v.optional(v.number()),
    isRequired: v.optional(v.boolean()),
    unlockAfterUnits: v.optional(v.array(v.id("learningUnits"))),
  },
  handler: async (ctx, args) => {
    // Get current units for position
    const existingUnits = await ctx.db
      .query("pathUnits")
      .withIndex("by_path", (q) => q.eq("pathId", args.pathId))
      .collect();

    return await ctx.db.insert("pathUnits", {
      pathId: args.pathId,
      unitId: args.unitId,
      position: args.position ?? existingUnits.length,
      isRequired: args.isRequired ?? true,
      unlockAfterUnits: args.unlockAfterUnits,
    });
  },
});

export const publishPath = mutation({
  args: { id: v.id("learningPaths") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isPublished: true });
    return await ctx.db.get(args.id);
  },
});

// ===========================================================================
// PROGRESS MUTATIONS (SM-2 Spaced Repetition)
// ===========================================================================

export const recordAttempt = mutation({
  args: {
    userId: v.id("profiles"),
    unitId: v.id("learningUnits"),
    quality: v.number(), // 0-5 (0=total blackout, 5=perfect)
    timeSpentSeconds: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const unit = await ctx.db.get(args.unitId);
    if (!unit) throw new Error("Unit not found");

    // Get existing progress
    let progress = await ctx.db
      .query("userUnitProgress")
      .withIndex("by_user_unit", (q) =>
        q.eq("userId", args.userId).eq("unitId", args.unitId)
      )
      .first();

    const now = Date.now();

    if (!progress) {
      // Create initial progress
      progress = {
        _id: null as any,
        _creationTime: 0,
        userId: args.userId,
        unitId: args.unitId,
        masteryLevel: "learning",
        masteryScore: 0,
        totalAttempts: 0,
        successfulAttempts: 0,
        totalTimeSeconds: 0,
        reviewIntervalDays: 1,
        easeFactor: 2.5,
        consecutiveCorrect: 0,
        xpEarned: 0,
        firstSeenAt: now,
      };
    }

    // SM-2 Algorithm
    let newInterval: number;
    let newEaseFactor: number;
    let newConsecutive: number;
    let newMasteryLevel = progress.masteryLevel;
    let newMasteryScore = progress.masteryScore;
    let successful = false;

    if (args.quality < 3) {
      // Failed review, reset interval
      newInterval = 1;
      newEaseFactor = Math.max(1.3, progress.easeFactor - 0.2);
      newConsecutive = 0;

      // Potentially decrease mastery level
      if (progress.masteryLevel === "mastered") {
        newMasteryLevel = "proficient";
      } else if (progress.masteryLevel === "proficient") {
        newMasteryLevel = "familiar";
      }
    } else {
      // Successful review
      successful = true;
      newConsecutive = progress.consecutiveCorrect + 1;

      if (progress.reviewIntervalDays === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.ceil(progress.reviewIntervalDays * progress.easeFactor);
      }

      newEaseFactor =
        progress.easeFactor +
        (0.1 - (5 - args.quality) * (0.08 + (5 - args.quality) * 0.02));
      newEaseFactor = Math.max(1.3, newEaseFactor);

      // Update mastery level based on consecutive correct
      if (newConsecutive >= 5 && progress.masteryLevel === "proficient") {
        newMasteryLevel = "mastered";
      } else if (newConsecutive >= 3 && progress.masteryLevel === "familiar") {
        newMasteryLevel = "proficient";
      } else if (newConsecutive >= 2 && progress.masteryLevel === "practicing") {
        newMasteryLevel = "familiar";
      } else if (newConsecutive >= 1 && progress.masteryLevel === "learning") {
        newMasteryLevel = "practicing";
      }

      newMasteryScore = Math.min(1.0, progress.masteryScore + 0.1);
    }

    const nextReviewAt = now + newInterval * 24 * 60 * 60 * 1000;

    const updates = {
      masteryLevel: newMasteryLevel,
      masteryScore: newMasteryScore,
      totalAttempts: progress.totalAttempts + 1,
      successfulAttempts: progress.successfulAttempts + (successful ? 1 : 0),
      lastAttemptAt: now,
      lastScore: args.quality / 5.0,
      totalTimeSeconds: progress.totalTimeSeconds + (args.timeSpentSeconds ?? 0),
      nextReviewAt,
      reviewIntervalDays: newInterval,
      easeFactor: newEaseFactor,
      consecutiveCorrect: newConsecutive,
    };

    if (progress._id) {
      await ctx.db.patch(progress._id, updates);
    } else {
      await ctx.db.insert("userUnitProgress", {
        ...updates,
        userId: args.userId,
        unitId: args.unitId,
        xpEarned: 0,
        firstSeenAt: now,
      });
    }

    // Award XP on first successful completion or mastery improvement
    if (successful && (progress.successfulAttempts === 0 || newMasteryLevel !== progress.masteryLevel)) {
      await awardXp(ctx, {
        userId: args.userId,
        amount: unit.xpReward,
        reason: `Completed learning unit: ${unit.title}`,
        sourceType: "learning_unit",
        sourceId: args.unitId,
      });
    }

    // Update unit statistics
    const allProgress = await ctx.db
      .query("userUnitProgress")
      .withIndex("by_unit", (q) => q.eq("unitId", args.unitId))
      .collect();

    const avgScore =
      allProgress.reduce((sum, p) => sum + (p.lastScore ?? 0), 0) /
      allProgress.length;

    await ctx.db.patch(args.unitId, {
      totalAttempts: unit.totalAttempts + 1,
      averageScore: avgScore,
    });

    return { success: true, newMasteryLevel, nextReviewAt };
  },
});

export const generateDailyReview = mutation({
  args: {
    userId: v.id("profiles"),
    targetCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const targetCount = args.targetCount ?? 20;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    // Remove old incomplete reviews
    const oldReviews = await ctx.db
      .query("dailyReviewQueue")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        q.and(
          q.lt(q.field("scheduledDate"), todayTimestamp),
          q.eq(q.field("isCompleted"), false)
        )
      )
      .collect();

    for (const review of oldReviews) {
      await ctx.db.delete(review._id);
    }

    // Get units due for review
    const now = Date.now();
    const progress = await ctx.db
      .query("userUnitProgress")
      .withIndex("by_user_review", (q) => q.eq("userId", args.userId))
      .collect();

    const dueForReview = progress.filter(
      (p) => p.nextReviewAt && p.nextReviewAt <= now
    );

    // Check existing queue for today
    const existingQueue = await ctx.db
      .query("dailyReviewQueue")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", args.userId).eq("scheduledDate", todayTimestamp)
      )
      .collect();

    const existingUnitIds = new Set(existingQueue.map((q) => q.unitId));

    // Add new items to queue
    let added = 0;
    for (const p of dueForReview) {
      if (added >= targetCount) break;
      if (existingUnitIds.has(p.unitId)) continue;

      // Calculate priority
      let priority = 40;
      if (p.consecutiveCorrect === 0) priority = 100;
      else if (p.masteryLevel === "learning") priority = 80;
      else if (p.masteryLevel === "practicing") priority = 60;

      await ctx.db.insert("dailyReviewQueue", {
        userId: args.userId,
        unitId: p.unitId,
        scheduledDate: todayTimestamp,
        priority,
        reviewReason: "spaced_repetition",
        isCompleted: false,
      });

      added++;
    }

    return { added };
  },
});

export const completeReviewItem = mutation({
  args: { id: v.id("dailyReviewQueue") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isCompleted: true,
      completedAt: Date.now(),
    });
  },
});
