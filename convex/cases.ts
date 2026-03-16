import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    status: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let cases = await ctx.db.query("cases").order("desc").collect();

    if (args.status && args.status !== "all") {
      cases = cases.filter((c) => c.status === args.status);
    }

    if (args.searchQuery) {
      const query = args.searchQuery.toLowerCase();
      cases = cases.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.caseNumber.toLowerCase().includes(query) ||
          c.clientName.toLowerCase().includes(query)
      );
    }

    return cases;
  },
});

export const get = query({
  args: { id: v.id("cases") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    caseNumber: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    clientName: v.string(),
    clientPhone: v.optional(v.string()),
    clientEmail: v.optional(v.string()),
    opposingParty: v.optional(v.string()),
    court: v.optional(v.string()),
    judge: v.optional(v.string()),
    status: v.union(
      v.literal("filed"),
      v.literal("pending_hearing"),
      v.literal("awaiting_documents"),
      v.literal("under_judgment"),
      v.literal("closed"),
      v.literal("on_hold")
    ),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    agreedFee: v.optional(v.number()),
    assignedTo: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    return await ctx.db.insert("cases", {
      ...args,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("cases"),
    caseNumber: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    clientName: v.optional(v.string()),
    clientPhone: v.optional(v.string()),
    clientEmail: v.optional(v.string()),
    opposingParty: v.optional(v.string()),
    court: v.optional(v.string()),
    judge: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("filed"),
      v.literal("pending_hearing"),
      v.literal("awaiting_documents"),
      v.literal("under_judgment"),
      v.literal("closed"),
      v.literal("on_hold")
    )),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent"))),
    agreedFee: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const assign = mutation({
  args: {
    caseId: v.id("cases"),
    assignedTo: v.id("users"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(args.caseId, {
      assignedTo: args.assignedTo,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("assignments", {
      caseId: args.caseId,
      assignedTo: args.assignedTo,
      assignedBy: userId,
      notes: args.notes,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("cases") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.delete(args.id);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const cases = await ctx.db.query("cases").collect();

    const stats = {
      total: cases.length,
      filed: cases.filter((c) => c.status === "filed").length,
      pending_hearing: cases.filter((c) => c.status === "pending_hearing").length,
      awaiting_documents: cases.filter((c) => c.status === "awaiting_documents").length,
      under_judgment: cases.filter((c) => c.status === "under_judgment").length,
      closed: cases.filter((c) => c.status === "closed").length,
      on_hold: cases.filter((c) => c.status === "on_hold").length,
      urgent: cases.filter((c) => c.priority === "urgent").length,
    };

    return stats;
  },
});
