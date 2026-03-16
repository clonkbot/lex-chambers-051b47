import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // User profiles with roles
  profiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("partner"),
      v.literal("senior_lawyer"),
      v.literal("junior_lawyer"),
      v.literal("paralegal"),
      v.literal("clerk")
    ),
    phone: v.optional(v.string()),
    firmId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_role", ["role"]),

  // Cases
  cases: defineTable({
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
    createdBy: v.id("users"),
    assignedTo: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_creator", ["createdBy"])
    .index("by_assigned", ["assignedTo"])
    .index("by_status", ["status"])
    .index("by_case_number", ["caseNumber"]),

  // Hearings / Events
  hearings: defineTable({
    caseId: v.id("cases"),
    title: v.string(),
    date: v.number(),
    time: v.optional(v.string()),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    reminderSent: v.boolean(),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_case", ["caseId"])
    .index("by_date", ["date"]),

  // Documents
  documents: defineTable({
    caseId: v.id("cases"),
    name: v.string(),
    type: v.string(),
    storageId: v.optional(v.id("_storage")),
    url: v.optional(v.string()),
    uploadedBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_case", ["caseId"]),

  // Notes
  notes: defineTable({
    caseId: v.id("cases"),
    content: v.string(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_case", ["caseId"]),

  // Tasks / To-dos
  tasks: defineTable({
    caseId: v.optional(v.id("cases")),
    title: v.string(),
    description: v.optional(v.string()),
    completed: v.boolean(),
    dueDate: v.optional(v.number()),
    assignedTo: v.optional(v.id("users")),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_case", ["caseId"])
    .index("by_assigned", ["assignedTo"])
    .index("by_creator", ["createdBy"]),

  // Payments
  payments: defineTable({
    caseId: v.id("cases"),
    amount: v.number(),
    description: v.optional(v.string()),
    paymentDate: v.number(),
    recordedBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_case", ["caseId"]),

  // Case assignments history
  assignments: defineTable({
    caseId: v.id("cases"),
    assignedTo: v.id("users"),
    assignedBy: v.id("users"),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_case", ["caseId"])
    .index("by_assigned_to", ["assignedTo"]),
});
