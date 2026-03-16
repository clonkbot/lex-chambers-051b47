import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listByCase = query({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("payments")
      .withIndex("by_case", (q) => q.eq("caseId", args.caseId))
      .order("desc")
      .collect();
  },
});

export const getFinancialSummary = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const cases = await ctx.db.query("cases").collect();
    const payments = await ctx.db.query("payments").collect();

    let totalAgreedFees = 0;
    let totalReceived = 0;

    cases.forEach((c) => {
      if (c.agreedFee) {
        totalAgreedFees += c.agreedFee;
      }
    });

    payments.forEach((p) => {
      totalReceived += p.amount;
    });

    const outstanding = totalAgreedFees - totalReceived;

    // Get case-wise summary
    const caseWise = await Promise.all(
      cases.map(async (c) => {
        const casePayments = payments.filter((p) => p.caseId === c._id);
        const paid = casePayments.reduce((sum, p) => sum + p.amount, 0);
        return {
          caseId: c._id,
          caseNumber: c.caseNumber,
          title: c.title,
          clientName: c.clientName,
          agreedFee: c.agreedFee || 0,
          paid,
          outstanding: (c.agreedFee || 0) - paid,
        };
      })
    );

    return {
      totalAgreedFees,
      totalReceived,
      outstanding,
      caseWise: caseWise.filter((c) => c.agreedFee > 0 || c.paid > 0),
    };
  },
});

export const create = mutation({
  args: {
    caseId: v.id("cases"),
    amount: v.number(),
    description: v.optional(v.string()),
    paymentDate: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("payments", {
      ...args,
      recordedBy: userId,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("payments") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.delete(args.id);
  },
});
