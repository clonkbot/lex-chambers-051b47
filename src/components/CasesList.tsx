import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface CasesListProps {
  onCaseSelect: (caseId: Id<"cases">) => void;
}

type Status = "filed" | "pending_hearing" | "awaiting_documents" | "under_judgment" | "closed" | "on_hold";
type Priority = "low" | "medium" | "high" | "urgent";

export function CasesList({ onCaseSelect }: CasesListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showNewCaseForm, setShowNewCaseForm] = useState(false);

  const cases = useQuery(api.cases.list, {
    status: statusFilter === "all" ? undefined : statusFilter,
    searchQuery: searchQuery || undefined,
  });

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-white">Cases</h1>
          <p className="text-white/40 text-sm">Manage your legal cases</p>
        </div>
        <button
          onClick={() => setShowNewCaseForm(true)}
          className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white px-4 py-2.5 font-serif text-sm tracking-wider transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Case
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cases, clients, numbers..."
            className="w-full bg-[#12121a] border border-amber-900/30 pl-10 pr-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-amber-600/50 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#12121a] border border-amber-900/30 px-4 py-2.5 text-white focus:outline-none focus:border-amber-600/50 text-sm min-w-[140px]"
        >
          <option value="all">All Status</option>
          <option value="filed">Filed</option>
          <option value="pending_hearing">Pending Hearing</option>
          <option value="awaiting_documents">Awaiting Documents</option>
          <option value="under_judgment">Under Judgment</option>
          <option value="on_hold">On Hold</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Cases List */}
      {cases === undefined ? (
        <div className="text-white/40 text-center py-12">Loading cases...</div>
      ) : cases.length === 0 ? (
        <div className="bg-[#12121a] border border-amber-900/30 p-8 md:p-12 text-center">
          <svg className="w-12 h-12 text-amber-500/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-white/60 text-lg font-serif mb-2">No cases found</p>
          <p className="text-white/40 text-sm">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Create your first case to get started"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((caseItem: { _id: Id<"cases">; caseNumber: string; status: Status; priority: Priority; title: string; clientName: string; court?: string; createdAt: number }) => (
            <button
              key={caseItem._id}
              onClick={() => onCaseSelect(caseItem._id)}
              className="w-full bg-[#12121a] border border-amber-900/30 hover:border-amber-600/50 p-4 md:p-5 text-left transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-amber-500/60 text-xs font-mono">{caseItem.caseNumber}</span>
                    <StatusBadge status={caseItem.status} />
                    <PriorityBadge priority={caseItem.priority} />
                  </div>
                  <h3 className="text-white font-serif text-base md:text-lg truncate">{caseItem.title}</h3>
                  <p className="text-white/40 text-sm mt-1">Client: {caseItem.clientName}</p>
                </div>
                <div className="flex items-center justify-between md:flex-col md:items-end md:justify-start gap-2 md:text-right">
                  {caseItem.court && (
                    <span className="text-white/30 text-xs truncate max-w-[150px]">{caseItem.court}</span>
                  )}
                  <span className="text-white/20 text-xs">
                    {new Date(caseItem.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* New Case Modal */}
      {showNewCaseForm && (
        <NewCaseModal onClose={() => setShowNewCaseForm(false)} />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const styles = {
    filed: "bg-blue-900/30 text-blue-400 border-blue-600/30",
    pending_hearing: "bg-amber-900/30 text-amber-400 border-amber-600/30",
    awaiting_documents: "bg-purple-900/30 text-purple-400 border-purple-600/30",
    under_judgment: "bg-orange-900/30 text-orange-400 border-orange-600/30",
    on_hold: "bg-gray-900/30 text-gray-400 border-gray-600/30",
    closed: "bg-emerald-900/30 text-emerald-400 border-emerald-600/30",
  };

  const labels = {
    filed: "Filed",
    pending_hearing: "Pending",
    awaiting_documents: "Awaiting Docs",
    under_judgment: "Judgment",
    on_hold: "On Hold",
    closed: "Closed",
  };

  return (
    <span className={`text-xs px-2 py-0.5 border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  if (priority === "low") return null;

  const styles = {
    medium: "bg-yellow-900/30 text-yellow-400",
    high: "bg-orange-900/30 text-orange-400",
    urgent: "bg-red-900/30 text-red-400",
  };

  return (
    <span className={`text-xs px-2 py-0.5 ${styles[priority]}`}>
      {priority.toUpperCase()}
    </span>
  );
}

function NewCaseModal({ onClose }: { onClose: () => void }) {
  const createCase = useMutation(api.cases.create);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    caseNumber: "",
    title: "",
    description: "",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    opposingParty: "",
    court: "",
    judge: "",
    status: "filed" as Status,
    priority: "medium" as Priority,
    agreedFee: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createCase({
        caseNumber: formData.caseNumber,
        title: formData.title,
        description: formData.description || undefined,
        clientName: formData.clientName,
        clientPhone: formData.clientPhone || undefined,
        clientEmail: formData.clientEmail || undefined,
        opposingParty: formData.opposingParty || undefined,
        court: formData.court || undefined,
        judge: formData.judge || undefined,
        status: formData.status,
        priority: formData.priority,
        agreedFee: formData.agreedFee ? parseFloat(formData.agreedFee) : undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#12121a] border border-amber-900/30 w-full max-w-2xl my-4 md:my-8">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-amber-900/30">
          <h2 className="font-serif text-xl text-white">New Case</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
                Case Number *
              </label>
              <input
                type="text"
                value={formData.caseNumber}
                onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-600/60"
                placeholder="e.g., CWP/2024/12345"
                required
              />
            </div>
            <div>
              <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
                Case Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-600/60"
                placeholder="e.g., Smith vs. State"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-600/60 h-20 resize-none"
              placeholder="Brief case description..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
                Client Name *
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-600/60"
                required
              />
            </div>
            <div>
              <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
                Client Phone
              </label>
              <input
                type="tel"
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-600/60"
              />
            </div>
            <div>
              <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
                Client Email
              </label>
              <input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-600/60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
                Opposing Party
              </label>
              <input
                type="text"
                value={formData.opposingParty}
                onChange={(e) => setFormData({ ...formData, opposingParty: e.target.value })}
                className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-600/60"
              />
            </div>
            <div>
              <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
                Court
              </label>
              <input
                type="text"
                value={formData.court}
                onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-600/60"
                placeholder="e.g., High Court of Delhi"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
                Judge
              </label>
              <input
                type="text"
                value={formData.judge}
                onChange={(e) => setFormData({ ...formData, judge: e.target.value })}
                className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-600/60"
              />
            </div>
            <div>
              <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
                className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-600/60"
              >
                <option value="filed">Filed</option>
                <option value="pending_hearing">Pending Hearing</option>
                <option value="awaiting_documents">Awaiting Documents</option>
                <option value="under_judgment">Under Judgment</option>
                <option value="on_hold">On Hold</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-600/60"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
                Agreed Fee (₹)
              </label>
              <input
                type="number"
                value={formData.agreedFee}
                onChange={(e) => setFormData({ ...formData, agreedFee: e.target.value })}
                className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-600/60"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-amber-900/30">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-2.5 border border-amber-900/40 text-white/60 hover:text-white hover:border-amber-600/50 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-none bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white px-6 py-2.5 text-sm transition-all disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Create Case"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
