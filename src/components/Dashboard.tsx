import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Doc } from "../../convex/_generated/dataModel";
import { CasesList } from "./CasesList";
import { CalendarView } from "./CalendarView";
import { TasksView } from "./TasksView";
import { FinancialView } from "./FinancialView";
import { CaseDetail } from "./CaseDetail";
import { Id } from "../../convex/_generated/dataModel";

type View = "dashboard" | "cases" | "calendar" | "tasks" | "finance" | "case-detail";

interface DashboardProps {
  profile: Doc<"profiles">;
}

export function Dashboard({ profile }: DashboardProps) {
  const { signOut } = useAuthActions();
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [selectedCaseId, setSelectedCaseId] = useState<Id<"cases"> | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { id: "cases", label: "Cases", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { id: "calendar", label: "Calendar", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { id: "tasks", label: "Tasks", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
    { id: "finance", label: "Finance", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  const handleCaseSelect = (caseId: Id<"cases">) => {
    setSelectedCaseId(caseId);
    setCurrentView("case-detail");
  };

  const handleBackToCases = () => {
    setSelectedCaseId(null);
    setCurrentView("cases");
  };

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardOverview profile={profile} onNavigate={setCurrentView} onCaseSelect={handleCaseSelect} />;
      case "cases":
        return <CasesList onCaseSelect={handleCaseSelect} />;
      case "calendar":
        return <CalendarView onCaseSelect={handleCaseSelect} />;
      case "tasks":
        return <TasksView />;
      case "finance":
        return <FinancialView onCaseSelect={handleCaseSelect} />;
      case "case-detail":
        return selectedCaseId ? <CaseDetail caseId={selectedCaseId} onBack={handleBackToCases} /> : <CasesList onCaseSelect={handleCaseSelect} />;
      default:
        return <DashboardOverview profile={profile} onNavigate={setCurrentView} onCaseSelect={handleCaseSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-[#12121a] border-b border-amber-900/30 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-amber-600/30 bg-gradient-to-br from-amber-900/20 to-transparent flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-serif text-white text-lg">Lex<span className="text-amber-500">Chambers</span></span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-white/60 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute top-14 left-0 right-0 bg-[#12121a] border-b border-amber-900/30 p-4" onClick={(e) => e.stopPropagation()}>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id as View);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${
                    currentView === item.id || (currentView === "case-detail" && item.id === "cases")
                      ? "bg-amber-900/20 text-amber-500 border-l-2 border-amber-500"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t border-amber-900/30">
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400/60 hover:text-red-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 bg-[#12121a] border-r border-amber-900/30 flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-amber-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-amber-600/30 bg-gradient-to-br from-amber-900/20 to-transparent flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h1 className="font-serif text-lg text-white">Lex<span className="text-amber-500">Chambers</span></h1>
              <p className="text-amber-500/40 text-xs tracking-wider uppercase">Legal Suite</p>
            </div>
          </div>
        </div>

        {/* Profile */}
        <div className="p-4 border-b border-amber-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-700 to-amber-600 flex items-center justify-center text-white font-serif text-sm">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate">{profile.name}</p>
              <p className="text-amber-500/50 text-xs capitalize">{profile.role.replace("_", " ")}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as View)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${
                  currentView === item.id || (currentView === "case-detail" && item.id === "cases")
                    ? "bg-amber-900/20 text-amber-500 border-l-2 border-amber-500 -ml-px"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t border-amber-900/30">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400/60 hover:text-red-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 lg:min-h-screen">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {renderView()}
        </div>

        {/* Footer */}
        <footer className="p-4 border-t border-amber-900/20 text-center">
          <p className="text-white/20 text-xs">
            Requested by @web-user · Built by @clonkbot
          </p>
        </footer>
      </main>
    </div>
  );
}

// Dashboard Overview Component
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface DashboardOverviewProps {
  profile: Doc<"profiles">;
  onNavigate: (view: View) => void;
  onCaseSelect: (caseId: Id<"cases">) => void;
}

function DashboardOverview({ profile, onNavigate, onCaseSelect }: DashboardOverviewProps) {
  const stats = useQuery(api.cases.getStats);
  const upcomingHearings = useQuery(api.hearings.getUpcoming, { days: 7 });
  const tasks = useQuery(api.tasks.list);
  const financialSummary = useQuery(api.payments.getFinancialSummary);

  const pendingTasks = tasks?.filter((t: { completed: boolean }) => !t.completed) || [];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="font-serif text-2xl md:text-3xl text-white mb-2">
          Good {getTimeOfDay()}, <span className="text-amber-500">{profile.name.split(" ")[0]}</span>
        </h1>
        <p className="text-white/40 text-sm md:text-base">Here's your practice overview for today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          label="Active Cases"
          value={stats ? stats.total - stats.closed : "..."}
          icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          color="amber"
        />
        <StatCard
          label="Pending Hearings"
          value={stats?.pending_hearing || 0}
          icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          color="blue"
        />
        <StatCard
          label="Urgent Cases"
          value={stats?.urgent || 0}
          icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          color="red"
        />
        <StatCard
          label="Outstanding"
          value={financialSummary ? `₹${(financialSummary.outstanding / 1000).toFixed(0)}K` : "..."}
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          color="green"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Upcoming Hearings */}
        <div className="bg-[#12121a] border border-amber-900/30 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg text-white">Upcoming Hearings</h2>
            <button
              onClick={() => onNavigate("calendar")}
              className="text-amber-500/60 hover:text-amber-500 text-sm"
            >
              View All
            </button>
          </div>
          {upcomingHearings === undefined ? (
            <div className="text-white/40 text-sm">Loading...</div>
          ) : upcomingHearings.length === 0 ? (
            <div className="text-white/40 text-sm py-8 text-center">No upcoming hearings this week</div>
          ) : (
            <div className="space-y-3">
              {upcomingHearings.slice(0, 4).map((hearing: { _id: string; caseId: Id<"cases">; date: number; title: string; caseName: string; time?: string }) => (
                <button
                  key={hearing._id}
                  onClick={() => onCaseSelect(hearing.caseId)}
                  className="w-full flex items-start gap-3 p-3 bg-[#0a0a0f] border border-amber-900/20 hover:border-amber-600/40 transition-colors text-left"
                >
                  <div className="w-12 h-12 bg-amber-900/20 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-amber-500 text-xs">{new Date(hearing.date).toLocaleDateString("en-US", { month: "short" })}</span>
                    <span className="text-white font-serif text-lg">{new Date(hearing.date).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{hearing.title}</p>
                    <p className="text-white/40 text-xs truncate">{hearing.caseName}</p>
                    <p className="text-amber-500/60 text-xs mt-1">{hearing.time || "Time TBD"}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pending Tasks */}
        <div className="bg-[#12121a] border border-amber-900/30 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg text-white">Pending Tasks</h2>
            <button
              onClick={() => onNavigate("tasks")}
              className="text-amber-500/60 hover:text-amber-500 text-sm"
            >
              View All
            </button>
          </div>
          {tasks === undefined ? (
            <div className="text-white/40 text-sm">Loading...</div>
          ) : pendingTasks.length === 0 ? (
            <div className="text-white/40 text-sm py-8 text-center">All tasks completed!</div>
          ) : (
            <div className="space-y-2">
              {pendingTasks.slice(0, 5).map((task: { _id: string; title: string; caseName: string | null; dueDate?: number }) => (
                <div
                  key={task._id}
                  className="flex items-start gap-3 p-3 bg-[#0a0a0f] border border-amber-900/20"
                >
                  <div className="w-4 h-4 mt-0.5 border border-amber-600/40 rounded-sm flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{task.title}</p>
                    {task.caseName && (
                      <p className="text-white/40 text-xs truncate">{task.caseName}</p>
                    )}
                  </div>
                  {task.dueDate && (
                    <span className={`text-xs px-2 py-1 ${
                      task.dueDate < Date.now() ? "bg-red-900/20 text-red-400" : "bg-amber-900/20 text-amber-500/60"
                    }`}>
                      {formatDate(task.dueDate)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Case Status Distribution */}
      <div className="bg-[#12121a] border border-amber-900/30 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg text-white">Case Distribution</h2>
          <button
            onClick={() => onNavigate("cases")}
            className="text-amber-500/60 hover:text-amber-500 text-sm"
          >
            View Cases
          </button>
        </div>
        {stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatusBadge label="Filed" count={stats.filed} color="blue" />
            <StatusBadge label="Pending" count={stats.pending_hearing} color="amber" />
            <StatusBadge label="Awaiting Docs" count={stats.awaiting_documents} color="purple" />
            <StatusBadge label="Under Judgment" count={stats.under_judgment} color="orange" />
            <StatusBadge label="On Hold" count={stats.on_hold} color="gray" />
            <StatusBadge label="Closed" count={stats.closed} color="green" />
          </div>
        ) : (
          <div className="text-white/40 text-sm">Loading...</div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  const colors = {
    amber: "from-amber-900/30 border-amber-600/30 text-amber-500",
    blue: "from-blue-900/30 border-blue-600/30 text-blue-400",
    red: "from-red-900/30 border-red-600/30 text-red-400",
    green: "from-emerald-900/30 border-emerald-600/30 text-emerald-400",
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color as keyof typeof colors]} to-transparent border p-3 md:p-4`}>
      <div className="flex items-center gap-2 md:gap-3">
        <svg className="w-5 h-5 md:w-6 md:h-6 opacity-60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
        <div className="min-w-0">
          <p className="text-xl md:text-2xl font-serif">{value}</p>
          <p className="text-white/40 text-xs truncate">{label}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ label, count, color }: { label: string; count: number; color: string }) {
  const colors = {
    blue: "bg-blue-900/20 border-blue-600/30 text-blue-400",
    amber: "bg-amber-900/20 border-amber-600/30 text-amber-500",
    purple: "bg-purple-900/20 border-purple-600/30 text-purple-400",
    orange: "bg-orange-900/20 border-orange-600/30 text-orange-400",
    gray: "bg-gray-900/20 border-gray-600/30 text-gray-400",
    green: "bg-emerald-900/20 border-emerald-600/30 text-emerald-400",
  };

  return (
    <div className={`border p-3 text-center ${colors[color as keyof typeof colors]}`}>
      <p className="text-xl md:text-2xl font-serif">{count}</p>
      <p className="text-xs truncate opacity-70">{label}</p>
    </div>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return "Overdue";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
