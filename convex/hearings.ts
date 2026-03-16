import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const hearings = await ctx.db
      .query("hearings")
      .withIndex("by_date")
      .order("asc")
      .collect();

    // Get case info for each hearing
    const hearingsWithCases = await Promise.all(
      hearings.map(async (hearing) => {
        const caseInfo = await ctx.db.get(hearing.caseId);
        return {
          ...hearing,
          caseName: caseInfo?.title || "Unknown Case",
          caseNumber: caseInfo?.caseNumber || "N/A",
        };
      })
    );

    return hearingsWithCases;
  },
});

export const listByCase = query({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("hearings")
      .withIndex("by_case", (q) => q.eq("caseId", args.caseId))
      .order("asc")
      .collect();
  },
});

export const getUpcoming = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const now = Date.now();
    const daysAhead = args.days || 7;
    const endDate = now + daysAhead * 24 * 60 * 60 * 1000;

    const hearings = await ctx.db
      .query("hearings")
      .withIndex("by_date")
      .order("asc")
      .collect();

    const upcoming = hearings.filter((h) => h.date >= now && h.date <= endDate);

    const hearingsWithCases = await Promise.all(
      upcoming.map(async (hearing) => {
        const caseInfo = await ctx.db.get(hearing.caseId);
        return {
          ...hearing,
          caseName: caseInfo?.title || "Unknown Case",
          caseNumber: caseInfo?.caseNumber || "N/A",
          clientName: caseInfo?.clientName || "Unknown",
        };
      })
    );

    return hearingsWithCases;
  },
});

export const create = mutation({
  args: {
    caseId: v.id("cases"),
    title: v.string(),
    date: v.number(),
    time: v.optional(v.string()),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("hearings", {
      ...args,
      reminderSent: false,
      createdBy: userId,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("hearings"),
    title: v.optional(v.string()),
    date: v.optional(v.number()),
    time: v.optional(v.string()),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("hearings") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.delete(args.id);
  },
});
