import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ===========================================================================
// CHALLENGE QUERIES
// ===========================================================================

export const getById = query({
  args: { id: v.id("challenges") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("challenges")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const listPublished = query({
  args: {
    difficulty: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let challenges = ctx.db
      .query("challenges")
      .withIndex("by_published", (q) => q.eq("isPublished", true));

    const results = await challenges.collect();

    // Filter by difficulty if specified
    let filtered = results;
    if (args.difficulty) {
      filtered = results.filter((c) => c.difficulty === args.difficulty);
    }

    // Apply limit
    if (args.limit) {
      filtered = filtered.slice(0, args.limit);
    }

    // Get creator info
    const challengesWithCreator = await Promise.all(
      filtered.map(async (challenge) => {
        const creator = await ctx.db.get(challenge.createdBy);
        return {
          ...challenge,
          creator: creator ? { displayName: creator.displayName, avatarUrl: creator.avatarUrl } : null,
        };
      })
    );

    return challengesWithCreator;
  },
});

export const listFeatured = query({
  args: {},
  handler: async (ctx) => {
    const challenges = await ctx.db
      .query("challenges")
      .filter((q) =>
        q.and(q.eq(q.field("isPublished"), true), q.eq(q.field("isFeatured"), true))
      )
      .collect();

    return challenges;
  },
});

export const listByCreator = query({
  args: { creatorId: v.id("profiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("challenges")
      .withIndex("by_creator", (q) => q.eq("createdBy", args.creatorId))
      .collect();
  },
});

// ===========================================================================
// CHALLENGE MUTATIONS
// ===========================================================================

export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    problemStatement: v.string(),
    researchField: v.array(v.string()),
    difficulty: v.optional(v.string()),
    estimatedHours: v.optional(v.number()),
    coverImageUrl: v.optional(v.string()),
    realWorldContext: v.optional(v.string()),
    keywords: v.optional(v.array(v.string())),
    introductionContent: v.optional(v.any()),
    resources: v.optional(v.any()),
    xpReward: v.optional(v.number()),
    createdBy: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const challengeId = await ctx.db.insert("challenges", {
      title: args.title,
      slug: args.slug,
      description: args.description,
      problemStatement: args.problemStatement,
      researchField: args.researchField,
      difficulty: args.difficulty ?? "intermediate",
      estimatedHours: args.estimatedHours,
      coverImageUrl: args.coverImageUrl,
      realWorldContext: args.realWorldContext,
      keywords: args.keywords,
      introductionContent: args.introductionContent,
      resources: args.resources,
      xpReward: args.xpReward ?? 100,
      isPublished: false,
      isFeatured: false,
      createdBy: args.createdBy,
    });
    return challengeId;
  },
});

export const update = mutation({
  args: {
    id: v.id("challenges"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    problemStatement: v.optional(v.string()),
    researchField: v.optional(v.array(v.string())),
    difficulty: v.optional(v.string()),
    estimatedHours: v.optional(v.number()),
    coverImageUrl: v.optional(v.string()),
    realWorldContext: v.optional(v.string()),
    keywords: v.optional(v.array(v.string())),
    introductionContent: v.optional(v.any()),
    resources: v.optional(v.any()),
    xpReward: v.optional(v.number()),
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

export const publish = mutation({
  args: { id: v.id("challenges") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isPublished: true,
      publishedAt: Date.now(),
    });
    return await ctx.db.get(args.id);
  },
});

export const unpublish = mutation({
  args: { id: v.id("challenges") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isPublished: false,
    });
    return await ctx.db.get(args.id);
  },
});

export const setFeatured = mutation({
  args: {
    id: v.id("challenges"),
    isFeatured: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isFeatured: args.isFeatured });
    return await ctx.db.get(args.id);
  },
});

export const remove = mutation({
  args: { id: v.id("challenges") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
