import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ===========================================================================
// EDITING SESSION QUERIES
// Convex provides automatic real-time updates via useQuery
// ===========================================================================

export const getActiveSessionsForNode = query({
  args: { nodeId: v.id("researchNodes") },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("editingSessions")
      .withIndex("by_node_active", (q) =>
        q.eq("nodeId", args.nodeId).eq("isActive", true)
      )
      .collect();

    // Get user details for each session
    const sessionsWithUsers = await Promise.all(
      sessions.map(async (session) => {
        const user = await ctx.db.get(session.userId);
        return {
          ...session,
          user: user
            ? {
                _id: user._id,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
              }
            : null,
        };
      })
    );

    return sessionsWithUsers;
  },
});

export const getUserActiveSessions = query({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("editingSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const getSessionById = query({
  args: { id: v.id("editingSessions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// ===========================================================================
// EDITING SESSION MUTATIONS
// ===========================================================================

export const startSession = mutation({
  args: {
    nodeId: v.id("researchNodes"),
    userId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    // Check for existing session
    const existing = await ctx.db
      .query("editingSessions")
      .withIndex("by_node_user", (q) =>
        q.eq("nodeId", args.nodeId).eq("userId", args.userId)
      )
      .first();

    const now = Date.now();

    if (existing) {
      // Reactivate existing session
      await ctx.db.patch(existing._id, {
        isActive: true,
        lastActivityAt: now,
        endedAt: undefined,
      });
      return existing._id;
    }

    // Create new session
    return await ctx.db.insert("editingSessions", {
      nodeId: args.nodeId,
      userId: args.userId,
      isActive: true,
      startedAt: now,
      lastActivityAt: now,
    });
  },
});

export const updateCursor = mutation({
  args: {
    sessionId: v.id("editingSessions"),
    cursorPosition: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      cursorPosition: args.cursorPosition,
      lastActivityAt: Date.now(),
    });
  },
});

export const heartbeat = mutation({
  args: { sessionId: v.id("editingSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    await ctx.db.patch(args.sessionId, {
      lastActivityAt: Date.now(),
    });
  },
});

export const endSession = mutation({
  args: { sessionId: v.id("editingSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    await ctx.db.patch(args.sessionId, {
      isActive: false,
      endedAt: Date.now(),
    });
  },
});

export const endAllUserSessions = mutation({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("editingSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const now = Date.now();
    for (const session of sessions) {
      await ctx.db.patch(session._id, {
        isActive: false,
        endedAt: now,
      });
    }
  },
});

// ===========================================================================
// COLLABORATION EVENTS
// These enable real-time broadcasting of edits, cursor moves, etc.
// ===========================================================================

export const getRecentEvents = query({
  args: {
    nodeId: v.id("researchNodes"),
    limit: v.optional(v.number()),
    since: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let events = ctx.db
      .query("collaborationEvents")
      .withIndex("by_node", (q) => q.eq("nodeId", args.nodeId))
      .order("desc");

    let results = await events.take(args.limit ?? 100);

    if (args.since) {
      results = results.filter((e) => e._creationTime > args.since!);
    }

    return results.reverse();
  },
});

export const broadcastEvent = mutation({
  args: {
    nodeId: v.id("researchNodes"),
    userId: v.id("profiles"),
    sessionId: v.optional(v.id("editingSessions")),
    eventType: v.string(),
    eventData: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("collaborationEvents", {
      nodeId: args.nodeId,
      userId: args.userId,
      sessionId: args.sessionId,
      eventType: args.eventType,
      eventData: args.eventData,
    });
  },
});

// ===========================================================================
// TEAMS
// ===========================================================================

export const getTeamById = query({
  args: { id: v.id("teams") },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.id);
    if (!team) return null;

    const members = await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (q) => q.eq("teamId", args.id))
      .collect();

    const membersWithProfiles = await Promise.all(
      members.map(async (m) => {
        const profile = await ctx.db.get(m.userId);
        return {
          ...m,
          profile: profile
            ? {
                displayName: profile.displayName,
                avatarUrl: profile.avatarUrl,
              }
            : null,
        };
      })
    );

    const creator = await ctx.db.get(team.createdBy);

    return {
      ...team,
      members: membersWithProfiles,
      creator: creator
        ? { displayName: creator.displayName, avatarUrl: creator.avatarUrl }
        : null,
    };
  },
});

export const getTeamBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("teams")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const listPublicTeams = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const teams = await ctx.db
      .query("teams")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .take(args.limit ?? 50);

    return teams;
  },
});

export const getUserTeams = query({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const teams = await Promise.all(
      memberships.map(async (m) => {
        const team = await ctx.db.get(m.teamId);
        return {
          ...m,
          team,
        };
      })
    );

    return teams.filter((t) => t.team !== null);
  },
});

export const createTeam = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    challengeId: v.optional(v.id("challenges")),
    researchFocus: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    maxMembers: v.optional(v.number()),
    joinPolicy: v.optional(v.string()),
    createdBy: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const teamId = await ctx.db.insert("teams", {
      name: args.name,
      slug: args.slug,
      description: args.description,
      avatarUrl: args.avatarUrl,
      challengeId: args.challengeId,
      researchFocus: args.researchFocus,
      isPublic: args.isPublic ?? true,
      maxMembers: args.maxMembers ?? 10,
      joinPolicy: args.joinPolicy ?? "approval",
      totalXp: 0,
      createdBy: args.createdBy,
    });

    // Add creator as lead
    await ctx.db.insert("teamMembers", {
      teamId: teamId,
      userId: args.createdBy,
      role: "lead",
      joinedAt: Date.now(),
    });

    return teamId;
  },
});

export const joinTeam = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.id("profiles"),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if already a member
    const existing = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_user", (q) =>
        q.eq("teamId", args.teamId).eq("userId", args.userId)
      )
      .first();

    if (existing) {
      throw new Error("Already a member of this team");
    }

    // Check capacity
    const team = await ctx.db.get(args.teamId);
    if (!team) throw new Error("Team not found");

    const memberCount = await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    if (memberCount.length >= team.maxMembers) {
      throw new Error("Team is full");
    }

    return await ctx.db.insert("teamMembers", {
      teamId: args.teamId,
      userId: args.userId,
      role: args.role ?? "member",
      joinedAt: Date.now(),
    });
  },
});

export const leaveTeam = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_user", (q) =>
        q.eq("teamId", args.teamId).eq("userId", args.userId)
      )
      .first();

    if (membership) {
      await ctx.db.delete(membership._id);
    }
  },
});

export const updateMemberRole = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.id("profiles"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_user", (q) =>
        q.eq("teamId", args.teamId).eq("userId", args.userId)
      )
      .first();

    if (!membership) {
      throw new Error("Membership not found");
    }

    await ctx.db.patch(membership._id, { role: args.role });
  },
});
