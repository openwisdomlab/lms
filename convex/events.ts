import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { awardXp } from "./gamification";

// ===========================================================================
// EVENT QUERIES
// ===========================================================================

export const getById = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id);
    if (!event) return null;

    const creator = await ctx.db.get(event.createdBy);
    const sessions = await ctx.db
      .query("eventSessions")
      .withIndex("by_event", (q) => q.eq("eventId", args.id))
      .collect();

    return {
      ...event,
      creator: creator
        ? { displayName: creator.displayName, avatarUrl: creator.avatarUrl }
        : null,
      sessions,
    };
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const listUpcoming = query({
  args: {
    eventType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    let events = await ctx.db
      .query("events")
      .withIndex("by_date")
      .filter((q) =>
        q.and(
          q.eq(q.field("isPublished"), true),
          q.eq(q.field("isCancelled"), false),
          q.gte(q.field("startsAt"), now)
        )
      )
      .take(args.limit ?? 50);

    if (args.eventType) {
      events = events.filter((e) => e.eventType === args.eventType);
    }

    return events;
  },
});

export const listPast = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db
      .query("events")
      .withIndex("by_date")
      .filter((q) =>
        q.and(
          q.eq(q.field("isPublished"), true),
          q.lt(q.field("endsAt"), now)
        )
      )
      .order("desc")
      .take(args.limit ?? 50);
  },
});

export const getByCheckinCode = query({
  args: { checkinCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_checkin_code", (q) => q.eq("checkinCode", args.checkinCode))
      .first();
  },
});

// ===========================================================================
// EVENT REGISTRATION QUERIES
// ===========================================================================

export const getUserRegistration = query({
  args: {
    eventId: v.id("events"),
    userId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("eventRegistrations")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", args.userId)
      )
      .first();
  },
});

export const getEventRegistrations = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const registrations = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    const registrationsWithUsers = await Promise.all(
      registrations.map(async (reg) => {
        const user = await ctx.db.get(reg.userId);
        return {
          ...reg,
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

    return registrationsWithUsers;
  },
});

export const getUserEventHistory = query({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    const registrations = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const registrationsWithEvents = await Promise.all(
      registrations.map(async (reg) => {
        const event = await ctx.db.get(reg.eventId);
        return {
          ...reg,
          event,
        };
      })
    );

    return registrationsWithEvents.filter((r) => r.event !== null);
  },
});

// ===========================================================================
// EVENT MUTATIONS
// ===========================================================================

export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    eventType: v.string(),
    deliveryMode: v.string(),
    startsAt: v.number(),
    endsAt: v.number(),
    timezone: v.optional(v.string()),
    locationName: v.optional(v.string()),
    locationAddress: v.optional(v.string()),
    locationCoordinates: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    roomNumber: v.optional(v.string()),
    meetingUrl: v.optional(v.string()),
    meetingPlatform: v.optional(v.string()),
    maxCapacity: v.optional(v.number()),
    waitlistEnabled: v.optional(v.boolean()),
    prerequisites: v.optional(v.array(v.string())),
    materialsNeeded: v.optional(v.array(v.string())),
    preparationInstructions: v.optional(v.string()),
    challengeId: v.optional(v.id("challenges")),
    teamId: v.optional(v.id("teams")),
    xpReward: v.optional(v.number()),
    createdBy: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    // Generate checkin code
    const checkinCode = `EVT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    return await ctx.db.insert("events", {
      title: args.title,
      slug: args.slug,
      description: args.description,
      coverImageUrl: args.coverImageUrl,
      eventType: args.eventType,
      deliveryMode: args.deliveryMode,
      startsAt: args.startsAt,
      endsAt: args.endsAt,
      timezone: args.timezone ?? "UTC",
      locationName: args.locationName,
      locationAddress: args.locationAddress,
      locationCoordinates: args.locationCoordinates,
      roomNumber: args.roomNumber,
      meetingUrl: args.meetingUrl,
      meetingPlatform: args.meetingPlatform,
      maxCapacity: args.maxCapacity,
      currentRegistrations: 0,
      waitlistEnabled: args.waitlistEnabled ?? false,
      prerequisites: args.prerequisites,
      materialsNeeded: args.materialsNeeded,
      preparationInstructions: args.preparationInstructions,
      challengeId: args.challengeId,
      teamId: args.teamId,
      checkinCode,
      checkinEnabled: true,
      checkinWindowMinutes: 30,
      xpReward: args.xpReward ?? 50,
      isPublished: false,
      isCancelled: false,
      createdBy: args.createdBy,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    startsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    locationName: v.optional(v.string()),
    locationAddress: v.optional(v.string()),
    meetingUrl: v.optional(v.string()),
    maxCapacity: v.optional(v.number()),
    prerequisites: v.optional(v.array(v.string())),
    materialsNeeded: v.optional(v.array(v.string())),
    preparationInstructions: v.optional(v.string()),
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
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isPublished: true });
    return await ctx.db.get(args.id);
  },
});

export const cancel = mutation({
  args: {
    id: v.id("events"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isCancelled: true,
      cancellationReason: args.reason,
    });
    return await ctx.db.get(args.id);
  },
});

// ===========================================================================
// REGISTRATION MUTATIONS
// ===========================================================================

export const register = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.id("profiles"),
    deliveryPreference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    if (event.isCancelled) {
      throw new Error("Event has been cancelled");
    }

    // Check if already registered
    const existing = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", args.userId)
      )
      .first();

    if (existing) {
      throw new Error("Already registered for this event");
    }

    // Check capacity
    if (event.maxCapacity && event.currentRegistrations >= event.maxCapacity) {
      throw new Error("Event is full");
    }

    // Create registration
    const registrationId = await ctx.db.insert("eventRegistrations", {
      eventId: args.eventId,
      userId: args.userId,
      status: "registered",
      deliveryPreference: args.deliveryPreference,
      xpEarned: 0,
      registeredAt: Date.now(),
    });

    // Update registration count
    await ctx.db.patch(args.eventId, {
      currentRegistrations: event.currentRegistrations + 1,
    });

    return registrationId;
  },
});

export const cancelRegistration = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const registration = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", args.userId)
      )
      .first();

    if (!registration) {
      throw new Error("Registration not found");
    }

    await ctx.db.delete(registration._id);

    // Update registration count
    const event = await ctx.db.get(args.eventId);
    if (event) {
      await ctx.db.patch(args.eventId, {
        currentRegistrations: Math.max(0, event.currentRegistrations - 1),
      });
    }
  },
});

export const checkin = mutation({
  args: {
    checkinCode: v.string(),
    userId: v.id("profiles"),
    location: v.optional(v.object({ lat: v.number(), lng: v.number() })),
  },
  handler: async (ctx, args) => {
    // Find event by checkin code
    const event = await ctx.db
      .query("events")
      .withIndex("by_checkin_code", (q) => q.eq("checkinCode", args.checkinCode))
      .first();

    if (!event) {
      return { success: false, error: "Invalid check-in code" };
    }

    if (!event.checkinEnabled) {
      return { success: false, error: "Check-in is disabled for this event" };
    }

    if (event.isCancelled) {
      return { success: false, error: "Event has been cancelled" };
    }

    // Check timing window
    const now = Date.now();
    const windowMs = (event.checkinWindowMinutes ?? 30) * 60 * 1000;
    const windowStart = event.startsAt - windowMs;
    const windowEnd = event.endsAt + windowMs;

    if (now < windowStart || now > windowEnd) {
      return { success: false, error: "Check-in window closed" };
    }

    // Find or create registration
    let registration = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", event._id).eq("userId", args.userId)
      )
      .first();

    if (registration) {
      // Update existing registration
      await ctx.db.patch(registration._id, {
        status: "checked_in",
        checkedInAt: now,
        checkedInMethod: "qr_code",
        checkInLocation: args.location,
      });
    } else {
      // Auto-register and check in
      await ctx.db.insert("eventRegistrations", {
        eventId: event._id,
        userId: args.userId,
        status: "checked_in",
        checkedInAt: now,
        checkedInMethod: "qr_code",
        checkInLocation: args.location,
        xpEarned: 0,
        registeredAt: now,
      });

      // Update registration count
      await ctx.db.patch(event._id, {
        currentRegistrations: event.currentRegistrations + 1,
      });
    }

    // Award XP
    await awardXp(ctx, {
      userId: args.userId,
      amount: event.xpReward,
      reason: `Event check-in: ${event.title}`,
      sourceType: "event",
      sourceId: event._id,
    });

    return {
      success: true,
      eventTitle: event.title,
      xpEarned: event.xpReward,
    };
  },
});

// ===========================================================================
// EVENT SESSION MUTATIONS
// ===========================================================================

export const addSession = mutation({
  args: {
    eventId: v.id("events"),
    title: v.string(),
    description: v.optional(v.string()),
    startsAt: v.number(),
    endsAt: v.number(),
    facilitatorIds: v.optional(v.array(v.id("profiles"))),
    materialsUrl: v.optional(v.string()),
    slidesUrl: v.optional(v.string()),
    sessionOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get current session count for ordering
    const existingSessions = await ctx.db
      .query("eventSessions")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    return await ctx.db.insert("eventSessions", {
      eventId: args.eventId,
      title: args.title,
      description: args.description,
      startsAt: args.startsAt,
      endsAt: args.endsAt,
      facilitatorIds: args.facilitatorIds,
      materialsUrl: args.materialsUrl,
      slidesUrl: args.slidesUrl,
      sessionOrder: args.sessionOrder ?? existingSessions.length,
    });
  },
});

export const updateSession = mutation({
  args: {
    id: v.id("eventSessions"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    recordingUrl: v.optional(v.string()),
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
