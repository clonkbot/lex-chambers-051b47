import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function TasksView() {
  const tasks = useQuery(api.tasks.list);
  const toggleTask = useMutation(api.tasks.toggle);
  const removeTask = useMutation(api.tasks.remove);
  const [showAddTask, setShowAddTask] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const filteredTasks = tasks?.filter((t: { completed: boolean }) => {
    if (filter === "pending") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const pendingCount = tasks?.filter((t: { completed: boolean }) => !t.completed).length || 0;
  const completedCount = tasks?.filter((t: { completed: boolean }) => t.completed).length || 0;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-white">Tasks</h1>
          <p className="text-white/40 text-sm">Manage your to-do list</p>
        </div>
        <button
          onClick={() => setShowAddTask(true)}
          className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white px-4 py-2.5 font-serif text-sm tracking-wider transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Task
        </button>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-2 md:gap-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 text-sm border transition-colors ${
            filter === "all"
              ? "bg-amber-900/20 border-amber-600/50 text-amber-500"
              : "border-amber-900/30 text-white/60 hover:text-white"
          }`}
        >
          All ({tasks?.length || 0})
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 text-sm border transition-colors ${
            filter === "pending"
              ? "bg-amber-900/20 border-amber-600/50 text-amber-500"
              : "border-amber-900/30 text-white/60 hover:text-white"
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`px-4 py-2 text-sm border transition-colors ${
            filter === "completed"
              ? "bg-amber-900/20 border-amber-600/50 text-amber-500"
              : "border-amber-900/30 text-white/60 hover:text-white"
          }`}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Tasks List */}
      {tasks === undefined ? (
        <div className="text-white/40 text-center py-12">Loading tasks...</div>
      ) : filteredTasks?.length === 0 ? (
        <div className="bg-[#12121a] border border-amber-900/30 p-8 md:p-12 text-center">
          <svg className="w-12 h-12 text-amber-500/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <p className="text-white/60 text-lg font-serif mb-2">
            {filter === "completed"
              ? "No completed tasks"
              : filter === "pending"
              ? "All tasks completed!"
              : "No tasks yet"}
          </p>
          <p className="text-white/40 text-sm">
            {filter === "all" && "Create a task to get started"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks?.map((task: { _id: string; title: string; description?: string; completed: boolean; caseName: string | null; dueDate?: number }) => (
            <div
              key={task._id}
              className={`bg-[#12121a] border border-amber-900/30 p-4 flex items-start gap-4 transition-colors ${
                task.completed ? "opacity-60" : ""
              }`}
            >
              <button
                onClick={() => toggleTask({ id: task._id })}
                className={`w-5 h-5 mt-0.5 flex-shrink-0 border rounded-sm flex items-center justify-center transition-colors ${
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

              <div className="flex-1 min-w-0">
                <p className={`text-white text-sm ${task.completed ? "line-through" : ""}`}>
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-white/40 text-xs mt-1">{task.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {task.caseName && (
                    <span className="text-amber-500/60 text-xs bg-amber-900/20 px-2 py-0.5">
                      {task.caseName}
                    </span>
                  )}
                  {task.dueDate && (
                    <span className={`text-xs px-2 py-0.5 ${
                      !task.completed && task.dueDate < Date.now()
                        ? "bg-red-900/20 text-red-400"
                        : "bg-white/5 text-white/40"
                    }`}>
                      {formatDueDate(task.dueDate)}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => removeTask({ id: task._id })}
                className="text-white/20 hover:text-red-400 p-1 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <AddTaskModal onClose={() => setShowAddTask(false)} />
      )}
    </div>
  );
}

function AddTaskModal({ onClose }: { onClose: () => void }) {
  const cases = useQuery(api.cases.list, {});
  const createTask = useMutation(api.tasks.create);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    caseId: "",
    dueDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createTask({
        title: formData.title,
        description: formData.description || undefined,
        caseId: formData.caseId ? (formData.caseId as Id<"cases">) : undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate).getTime() : undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#12121a] border border-amber-900/30 w-full max-w-lg">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-amber-900/30">
          <h2 className="font-serif text-xl text-white">Add Task</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          <div>
            <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-600/60"
              placeholder="e.g., Prepare arguments"
              required
            />
          </div>

          <div>
            <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-600/60 h-20 resize-none"
              placeholder="Additional details..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
                Related Case
              </label>
              <select
                value={formData.caseId}
                onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
                className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-600/60"
              >
                <option value="">No case</option>
                {cases?.map((c: { _id: string; caseNumber: string }) => (
                  <option key={c._id} value={c._id}>
                    {c.caseNumber}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-600/60"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
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
              {isLoading ? "Adding..." : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatDueDate(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}
