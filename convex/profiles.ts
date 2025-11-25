import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ===========================================================================
// PROFILE QUERIES
// ===========================================================================

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const getById = query({
  args: { id: v.id("profiles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("profiles").collect();
  },
});

export const getLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    const profiles = await ctx.db
      .query("profiles")
      .withIndex("by_xp")
      .order("desc")
      .take(limit);

    // Get badge counts for each profile
    const profilesWithStats = await Promise.all(
      profiles.map(async (profile) => {
        const badges = await ctx.db
          .query("userBadges")
          .withIndex("by_user", (q) => q.eq("userId", profile._id))
          .collect();

        const nodes = await ctx.db
          .query("researchNodes")
          .withIndex("by_creator", (q) => q.eq("createdBy", profile._id))
          .collect();

        return {
          ...profile,
          badgesCount: badges.length,
          nodesCount: nodes.length,
        };
      })
    );

    return profilesWithStats;
  },
});

// ===========================================================================
// PROFILE MUTATIONS
// ===========================================================================

export const create = mutation({
  args: {
    clerkId: v.optional(v.string()),
    email: v.string(),
    displayName: v.string(),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    role: v.optional(v.string()),
    institution: v.optional(v.string()),
    researchInterests: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const profileId = await ctx.db.insert("profiles", {
      clerkId: args.clerkId,
      email: args.email,
      displayName: args.displayName,
      avatarUrl: args.avatarUrl,
      bio: args.bio,
      role: args.role ?? "learner",
      institution: args.institution,
      researchInterests: args.researchInterests,
      xp: 0,
      level: 1,
      streakDays: 0,
      notificationSettings: { email: true, push: true },
      lastSeenAt: Date.now(),
    });
    return profileId;
  },
});

export const update = mutation({
  args: {
    id: v.id("profiles"),
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    institution: v.optional(v.string()),
    researchInterests: v.optional(v.array(v.string())),
    preferences: v.optional(v.any()),
    notificationSettings: v.optional(v.object({
      email: v.boolean(),
      push: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(id, filteredUpdates);
    return await ctx.db.get(id);
  },
});

export const updateLastSeen = mutation({
  args: { id: v.id("profiles") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { lastSeenAt: Date.now() });
  },
});

export const updateStreak = mutation({
  args: { id: v.id("profiles") },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.id);
    if (!profile) throw new Error("Profile not found");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const lastActivity = profile.streakLastActivity;
    if (!lastActivity) {
      // First activity
      await ctx.db.patch(args.id, {
        streakDays: 1,
        streakLastActivity: todayTimestamp,
      });
    } else {
      const lastDate = new Date(lastActivity);
      lastDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((todayTimestamp - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) {
        // Already updated today, do nothing
        return;
      } else if (daysDiff === 1) {
        // Continue streak
        await ctx.db.patch(args.id, {
          streakDays: profile.streakDays + 1,
          streakLastActivity: todayTimestamp,
        });
      } else {
        // Streak broken
        await ctx.db.patch(args.id, {
          streakDays: 1,
          streakLastActivity: todayTimestamp,
        });
      }
    }
  },
});
