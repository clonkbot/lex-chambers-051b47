import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface CaseDetailProps {
  caseId: Id<"cases">;
  onBack: () => void;
}

type Tab = "overview" | "hearings" | "notes" | "tasks" | "payments";

export function CaseDetail({ caseId, onBack }: CaseDetailProps) {
  const caseData = useQuery(api.cases.get, { id: caseId });
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  if (caseData === undefined) {
    return (
      <div className="text-white/40 text-center py-12">Loading case details...</div>
    );
  }

  if (caseData === null) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">Case not found</p>
        <button onClick={onBack} className="text-amber-500 mt-4">
          Back to Cases
        </button>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "hearings", label: "Hearings" },
    { id: "notes", label: "Notes" },
    { id: "tasks", label: "Tasks" },
    { id: "payments", label: "Payments" },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors self-start"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">Back</span>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-amber-500/60 text-xs font-mono">{caseData.caseNumber}</span>
            <StatusBadge status={caseData.status} />
            <PriorityBadge priority={caseData.priority} />
          </div>
          <h1 className="font-serif text-xl md:text-2xl lg:text-3xl text-white truncate">{caseData.title}</h1>
          <p className="text-white/40 text-sm mt-1">Client: {caseData.clientName}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-amber-900/30 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-amber-500 border-b-2 border-amber-500"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab caseData={caseData} />}
      {activeTab === "hearings" && <HearingsTab caseId={caseId} />}
      {activeTab === "notes" && <NotesTab caseId={caseId} />}
      {activeTab === "tasks" && <TasksTab caseId={caseId} />}
      {activeTab === "payments" && <PaymentsTab caseId={caseId} caseData={caseData} />}
    </div>
  );
}

function OverviewTab({ caseData }: { caseData: NonNullable<ReturnType<typeof useQuery<typeof api.cases.get>>> }) {
  const updateCase = useMutation(api.cases.update);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(caseData.status);

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus as typeof caseData.status);
    await updateCase({
      id: caseData._id,
      status: newStatus as typeof caseData.status,
    });
  };

  const statusOptions = [
    { value: "filed", label: "Filed" },
    { value: "pending_hearing", label: "Pending Hearing" },
    { value: "awaiting_documents", label: "Awaiting Documents" },
    { value: "under_judgment", label: "Under Judgment" },
    { value: "on_hold", label: "On Hold" },
    { value: "closed", label: "Closed" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      {/* Case Info */}
      <div className="bg-[#12121a] border border-amber-900/30 p-4 md:p-6 space-y-4">
        <h3 className="font-serif text-lg text-white mb-4">Case Information</h3>

        <InfoRow label="Case Number" value={caseData.caseNumber} />
        <InfoRow label="Title" value={caseData.title} />
        <InfoRow label="Description" value={caseData.description || "—"} />
        <InfoRow label="Court" value={caseData.court || "—"} />
        <InfoRow label="Judge" value={caseData.judge || "—"} />
        <InfoRow label="Opposing Party" value={caseData.opposingParty || "—"} />

        <div className="pt-4 border-t border-amber-900/20">
          <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-600/60"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <InfoRow
          label="Created"
          value={new Date(caseData.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        />
      </div>

      {/* Client Info */}
      <div className="bg-[#12121a] border border-amber-900/30 p-4 md:p-6 space-y-4">
        <h3 className="font-serif text-lg text-white mb-4">Client Information</h3>

        <InfoRow label="Name" value={caseData.clientName} />
        <InfoRow label="Phone" value={caseData.clientPhone || "—"} />
        <InfoRow label="Email" value={caseData.clientEmail || "—"} />

        <div className="pt-4 border-t border-amber-900/20">
          <h4 className="text-amber-500/70 text-xs uppercase tracking-wider mb-3">Financial</h4>
          <InfoRow
            label="Agreed Fee"
            value={caseData.agreedFee ? `₹${caseData.agreedFee.toLocaleString()}` : "Not set"}
          />
        </div>
      </div>
    </div>
  );
}

function HearingsTab({ caseId }: { caseId: Id<"cases"> }) {
  const hearings = useQuery(api.hearings.listByCase, { caseId });
  const createHearing = useMutation(api.hearings.create);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createHearing({
      caseId,
      title: formData.title,
      date: new Date(formData.date).getTime(),
      time: formData.time || undefined,
      location: formData.location || undefined,
    });
    setFormData({ title: "", date: "", time: "", location: "" });
    setShowForm(false);
  };

  return (
    <div className="bg-[#12121a] border border-amber-900/30 p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg text-white">Hearings</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-amber-500 hover:text-amber-400 text-sm flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 bg-[#0a0a0f] border border-amber-900/20 space-y-3">
          <input
            type="text"
            placeholder="Hearing title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-transparent border border-amber-900/40 px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-600/60"
            required
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="bg-transparent border border-amber-900/40 px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-600/60"
              required
            />
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="bg-transparent border border-amber-900/40 px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-600/60"
            />
            <input
              type="text"
              placeholder="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="bg-transparent border border-amber-900/40 px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-600/60"
            />
          </div>
          <button
            type="submit"
            className="bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 text-sm"
          >
            Add Hearing
          </button>
        </form>
      )}

      {hearings === undefined ? (
        <div className="text-white/40 text-sm">Loading...</div>
      ) : hearings.length === 0 ? (
        <div className="text-white/40 text-sm text-center py-8">No hearings scheduled</div>
      ) : (
        <div className="space-y-2">
          {hearings.map((hearing: { _id: string; date: number; title: string; time?: string; location?: string }) => (
            <div key={hearing._id} className="flex items-start gap-3 p-3 bg-[#0a0a0f] border border-amber-900/20">
              <div className="w-12 h-12 bg-amber-900/20 flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-amber-500 text-xs">
                  {new Date(hearing.date).toLocaleDateString("en-US", { month: "short" })}
                </span>
                <span className="text-white font-serif">{new Date(hearing.date).getDate()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm">{hearing.title}</p>
                <p className="text-amber-500/60 text-xs">{hearing.time || "Time TBD"}</p>
                {hearing.location && (
                  <p className="text-white/30 text-xs mt-1">{hearing.location}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NotesTab({ caseId }: { caseId: Id<"cases"> }) {
  const notes = useQuery(api.notes.listByCase, { caseId });
  const createNote = useMutation(api.notes.create);
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    await createNote({ caseId, content: content.trim() });
    setContent("");
  };

  return (
    <div className="bg-[#12121a] border border-amber-900/30 p-4 md:p-6">
      <h3 className="font-serif text-lg text-white mb-4">Notes</h3>

      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a note..."
          className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-600/60 h-24 resize-none"
        />
        <button
          type="submit"
          disabled={!content.trim()}
          className="mt-2 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white px-4 py-2 text-sm"
        >
          Add Note
        </button>
      </form>

      {notes === undefined ? (
        <div className="text-white/40 text-sm">Loading...</div>
      ) : notes.length === 0 ? (
        <div className="text-white/40 text-sm text-center py-8">No notes yet</div>
      ) : (
        <div className="space-y-3">
          {notes.map((note: { _id: string; content: string; createdAt: number }) => (
            <div key={note._id} className="p-4 bg-[#0a0a0f] border border-amber-900/20">
              <p className="text-white text-sm whitespace-pre-wrap">{note.content}</p>
              <p className="text-white/30 text-xs mt-2">
                {new Date(note.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TasksTab({ caseId }: { caseId: Id<"cases"> }) {
  const tasks = useQuery(api.tasks.listByCase, { caseId });
  const createTask = useMutation(api.tasks.create);
  const toggleTask = useMutation(api.tasks.toggle);
  const [title, setTitle] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createTask({ title: title.trim(), caseId });
    setTitle("");
  };

  return (
    <div className="bg-[#12121a] border border-amber-900/30 p-4 md:p-6">
      <h3 className="font-serif text-lg text-white mb-4">Tasks</h3>

      <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task..."
          className="flex-1 bg-[#0a0a0f] border border-amber-900/40 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-600/60"
        />
        <button
          type="submit"
          disabled={!title.trim()}
          className="bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white px-4 py-2.5 text-sm"
        >
          Add
        </button>
      </form>

      {tasks === undefined ? (
        <div className="text-white/40 text-sm">Loading...</div>
      ) : tasks.length === 0 ? (
        <div className="text-white/40 text-sm text-center py-8">No tasks yet</div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task: { _id: string; title: string; completed: boolean }) => (
            <div
              key={task._id}
              className={`flex items-center gap-3 p-3 bg-[#0a0a0f] border border-amber-900/20 ${
                task.completed ? "opacity-60" : ""
              }`}
            >
              <button
                onClick={() => toggleTask({ id: task._id })}
                className={`w-5 h-5 flex-shrink-0 border rounded-sm flex items-center justify-center ${
                  task.completed
                    ? "bg-amber-600 border-amber-600"
                    : "border-amber-600/40 hover:border-amber-600"
                }`}
              >
                {task.completed && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span className={`text-sm ${task.completed ? "text-white/40 line-through" : "text-white"}`}>
                {task.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PaymentsTab({ caseId, caseData }: { caseId: Id<"cases">; caseData: NonNullable<ReturnType<typeof useQuery<typeof api.cases.get>>> }) {
  const payments = useQuery(api.payments.listByCase, { caseId });
  const createPayment = useMutation(api.payments.create);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    paymentDate: new Date().toISOString().split("T")[0],
  });

  const totalPaid = payments?.reduce((sum: number, p: { amount: number }) => sum + p.amount, 0) || 0;
  const outstanding = (caseData.agreedFee || 0) - totalPaid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPayment({
      caseId,
      amount: parseFloat(formData.amount),
      description: formData.description || undefined,
      paymentDate: new Date(formData.paymentDate).getTime(),
    });
    setFormData({ amount: "", description: "", paymentDate: new Date().toISOString().split("T")[0] });
    setShowForm(false);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#12121a] border border-amber-900/30 p-4">
          <p className="text-white/40 text-xs uppercase">Agreed Fee</p>
          <p className="text-white font-serif text-lg">₹{(caseData.agreedFee || 0).toLocaleString()}</p>
        </div>
        <div className="bg-[#12121a] border border-emerald-900/30 p-4">
          <p className="text-white/40 text-xs uppercase">Received</p>
          <p className="text-emerald-400 font-serif text-lg">₹{totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-[#12121a] border border-amber-900/30 p-4">
          <p className="text-white/40 text-xs uppercase">Outstanding</p>
          <p className={`font-serif text-lg ${outstanding > 0 ? "text-amber-400" : "text-emerald-400"}`}>
            ₹{outstanding.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-[#12121a] border border-amber-900/30 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg text-white">Payment History</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-amber-500 hover:text-amber-400 text-sm flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Payment
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-4 p-4 bg-[#0a0a0f] border border-amber-900/20 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="bg-transparent border border-amber-900/40 px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-600/60"
                required
              />
              <input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                className="bg-transparent border border-amber-900/40 px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-600/60"
                required
              />
            </div>
            <input
              type="text"
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-transparent border border-amber-900/40 px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-600/60"
            />
            <button
              type="submit"
              className="bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 text-sm"
            >
              Record Payment
            </button>
          </form>
        )}

        {payments === undefined ? (
          <div className="text-white/40 text-sm">Loading...</div>
        ) : payments.length === 0 ? (
          <div className="text-white/40 text-sm text-center py-8">No payments recorded</div>
        ) : (
          <div className="space-y-2">
            {payments.map((payment: { _id: string; amount: number; description?: string; paymentDate: number }) => (
              <div key={payment._id} className="flex items-center justify-between p-3 bg-[#0a0a0f] border border-amber-900/20">
                <div>
                  <p className="text-emerald-400 font-serif">₹{payment.amount.toLocaleString()}</p>
                  {payment.description && (
                    <p className="text-white/40 text-xs">{payment.description}</p>
                  )}
                </div>
                <p className="text-white/30 text-xs">
                  {new Date(payment.paymentDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-amber-500/70 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="text-white text-sm">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    filed: "bg-blue-900/30 text-blue-400 border-blue-600/30",
    pending_hearing: "bg-amber-900/30 text-amber-400 border-amber-600/30",
    awaiting_documents: "bg-purple-900/30 text-purple-400 border-purple-600/30",
    under_judgment: "bg-orange-900/30 text-orange-400 border-orange-600/30",
    on_hold: "bg-gray-900/30 text-gray-400 border-gray-600/30",
    closed: "bg-emerald-900/30 text-emerald-400 border-emerald-600/30",
  };

  const labels: Record<string, string> = {
    filed: "Filed",
    pending_hearing: "Pending",
    awaiting_documents: "Awaiting Docs",
    under_judgment: "Judgment",
    on_hold: "On Hold",
    closed: "Closed",
  };

  return (
    <span className={`text-xs px-2 py-0.5 border ${styles[status] || ""}`}>
      {labels[status] || status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  if (priority === "low") return null;

  const styles: Record<string, string> = {
    medium: "bg-yellow-900/30 text-yellow-400",
    high: "bg-orange-900/30 text-orange-400",
    urgent: "bg-red-900/30 text-red-400",
  };

  return (
    <span className={`text-xs px-2 py-0.5 ${styles[priority] || ""}`}>
      {priority.toUpperCase()}
    </span>
  );
}
