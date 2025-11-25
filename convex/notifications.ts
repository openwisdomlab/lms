import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ===========================================================================
// NOTIFICATION QUERIES
// ===========================================================================

export const listForUser = query({
  args: {
    userId: v.id("profiles"),
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let notifications = ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc");

    let results = await notifications.take(args.limit ?? 50);

    if (args.unreadOnly) {
      results = results.filter((n) => !n.isRead);
    }

    return results;
  },
});

export const getUnreadCount = query({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", args.userId).eq("isRead", false)
      )
      .collect();

    return notifications.length;
  },
});

// ===========================================================================
// NOTIFICATION MUTATIONS
// ===========================================================================

export const create = mutation({
  args: {
    userId: v.id("profiles"),
    type: v.string(),
    title: v.string(),
    body: v.optional(v.string()),
    linkType: v.optional(v.string()),
    linkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      body: args.body,
      linkType: args.linkType,
      linkId: args.linkId,
      isRead: false,
    });
  },
});

export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isRead: true,
      readAt: Date.now(),
    });
  },
});

export const markAllAsRead = mutation({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", args.userId).eq("isRead", false)
      )
      .collect();

    const now = Date.now();
    for (const notification of unread) {
      await ctx.db.patch(notification._id, {
        isRead: true,
        readAt: now,
      });
    }

    return { marked: unread.length };
  },
});

export const remove = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ===========================================================================
// COMMENT QUERIES
// ===========================================================================

export const getCommentsForTarget = query({
  args: {
    commentableType: v.string(),
    commentableId: v.string(),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_target", (q) =>
        q.eq("commentableType", args.commentableType).eq("commentableId", args.commentableId)
      )
      .collect();

    // Get creator info and organize into threads
    const commentsWithCreators = await Promise.all(
      comments.map(async (comment) => {
        const creator = await ctx.db.get(comment.createdBy);
        return {
          ...comment,
          creator: creator
            ? { displayName: creator.displayName, avatarUrl: creator.avatarUrl }
            : null,
        };
      })
    );

    // Organize into threads (top-level and replies)
    const topLevel = commentsWithCreators.filter((c) => !c.parentId);
    const replies = commentsWithCreators.filter((c) => c.parentId);

    const threads = topLevel.map((comment) => ({
      ...comment,
      replies: replies.filter((r) => r.parentId === comment._id),
    }));

    return threads;
  },
});

// ===========================================================================
// COMMENT MUTATIONS
// ===========================================================================

export const createComment = mutation({
  args: {
    commentableType: v.string(),
    commentableId: v.string(),
    content: v.any(),
    parentId: v.optional(v.id("comments")),
    createdBy: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("comments", {
      commentableType: args.commentableType,
      commentableId: args.commentableId,
      content: args.content,
      parentId: args.parentId,
      isHidden: false,
      createdBy: args.createdBy,
    });
  },
});

export const updateComment = mutation({
  args: {
    id: v.id("comments"),
    content: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { content: args.content });
    return await ctx.db.get(args.id);
  },
});

export const hideComment = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isHidden: true });
  },
});

export const addReaction = mutation({
  args: {
    id: v.id("comments"),
    emoji: v.string(),
    userId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.id);
    if (!comment) throw new Error("Comment not found");

    const reactions = (comment.reactions ?? {}) as Record<string, string[]>;
    if (!reactions[args.emoji]) {
      reactions[args.emoji] = [];
    }

    if (!reactions[args.emoji].includes(args.userId)) {
      reactions[args.emoji].push(args.userId);
    }

    await ctx.db.patch(args.id, { reactions });
  },
});

export const removeReaction = mutation({
  args: {
    id: v.id("comments"),
    emoji: v.string(),
    userId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.id);
    if (!comment) throw new Error("Comment not found");

    const reactions = (comment.reactions ?? {}) as Record<string, string[]>;
    if (reactions[args.emoji]) {
      reactions[args.emoji] = reactions[args.emoji].filter(
        (id) => id !== args.userId
      );
      if (reactions[args.emoji].length === 0) {
        delete reactions[args.emoji];
      }
    }

    await ctx.db.patch(args.id, { reactions });
  },
});

export const deleteComment = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, args) => {
    // Delete replies first
    const replies = await ctx.db
      .query("comments")
      .withIndex("by_parent", (q) => q.eq("parentId", args.id))
      .collect();

    for (const reply of replies) {
      await ctx.db.delete(reply._id);
    }

    await ctx.db.delete(args.id);
  },
});
