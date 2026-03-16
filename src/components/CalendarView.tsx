import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface CalendarViewProps {
  onCaseSelect: (caseId: Id<"cases">) => void;
}

export function CalendarView({ onCaseSelect }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddHearing, setShowAddHearing] = useState(false);

  const hearings = useQuery(api.hearings.list);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDay = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const days = [];
  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getHearingsForDay = (day: number) => {
    if (!hearings) return [];
    const targetDate = new Date(year, month, day);
    return hearings.filter((h: { date: number; _id: string; title: string; caseId: string; caseName: string; time?: string; location?: string }) => {
      const hearingDate = new Date(h.date);
      return (
        hearingDate.getFullYear() === targetDate.getFullYear() &&
        hearingDate.getMonth() === targetDate.getMonth() &&
        hearingDate.getDate() === targetDate.getDate()
      );
    });
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const selectedDayHearings = selectedDate ? getHearingsForDay(selectedDate.getDate()) : [];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-white">Calendar</h1>
          <p className="text-white/40 text-sm">Schedule and manage hearings</p>
        </div>
        <button
          onClick={() => setShowAddHearing(true)}
          className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white px-4 py-2.5 font-serif text-sm tracking-wider transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Hearing
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-[#12121a] border border-amber-900/30 p-4 md:p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="p-2 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="font-serif text-lg md:text-xl text-white">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-amber-500/60 text-xs uppercase tracking-wider py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const dayHearings = day ? getHearingsForDay(day) : [];
              const isToday =
                day &&
                new Date().getDate() === day &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;
              const isSelected =
                day &&
                selectedDate &&
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === month &&
                selectedDate.getFullYear() === year;

              return (
                <button
                  key={index}
                  onClick={() => day && setSelectedDate(new Date(year, month, day))}
                  disabled={!day}
                  className={`min-h-[50px] md:min-h-[70px] p-1 md:p-2 text-left transition-colors ${
                    !day
                      ? "bg-transparent"
                      : isSelected
                      ? "bg-amber-900/30 border border-amber-600/50"
                      : isToday
                      ? "bg-amber-900/20 border border-amber-600/30"
                      : "bg-[#0a0a0f] border border-amber-900/20 hover:border-amber-600/30"
                  }`}
                >
                  {day && (
                    <>
                      <span className={`text-xs md:text-sm ${isToday ? "text-amber-500 font-bold" : "text-white/60"}`}>
                        {day}
                      </span>
                      {dayHearings.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {dayHearings.slice(0, 2).map((h: { title: string }, i: number) => (
                            <div
                              key={i}
                              className="h-1 md:h-1.5 bg-amber-500/60 rounded-full"
                              title={h.title}
                            />
                          ))}
                          {dayHearings.length > 2 && (
                            <span className="text-amber-500/60 text-[10px]">+{dayHearings.length - 2}</span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details */}
        <div className="bg-[#12121a] border border-amber-900/30 p-4 md:p-6">
          <h3 className="font-serif text-lg text-white mb-4">
            {selectedDate
              ? selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })
              : "Select a Date"}
          </h3>

          {selectedDate ? (
            selectedDayHearings.length > 0 ? (
              <div className="space-y-3">
                {selectedDayHearings.map((hearing: { _id: string; caseId: Id<"cases">; title: string; time?: string; caseName: string; location?: string }) => (
                  <button
                    key={hearing._id}
                    onClick={() => onCaseSelect(hearing.caseId)}
                    className="w-full bg-[#0a0a0f] border border-amber-900/20 hover:border-amber-600/40 p-3 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-amber-500 text-xs">{hearing.time || "Time TBD"}</span>
                    </div>
                    <p className="text-white text-sm">{hearing.title}</p>
                    <p className="text-white/40 text-xs mt-1">{hearing.caseName}</p>
                    {hearing.location && (
                      <p className="text-white/30 text-xs mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {hearing.location}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-10 h-10 text-amber-500/20 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-white/40 text-sm">No hearings scheduled</p>
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <p className="text-white/40 text-sm">Click on a date to see hearings</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Hearing Modal */}
      {showAddHearing && (
        <AddHearingModal onClose={() => setShowAddHearing(false)} />
      )}
    </div>
  );
}

function AddHearingModal({ onClose }: { onClose: () => void }) {
  const cases = useQuery(api.cases.list, {});
  const createHearing = useMutation(api.hearings.create);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    caseId: "",
    title: "",
    date: "",
    time: "",
    location: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.caseId) return;

    setIsLoading(true);
    try {
      await createHearing({
        caseId: formData.caseId as Id<"cases">,
        title: formData.title,
        date: new Date(formData.date).getTime(),
        time: formData.time || undefined,
        location: formData.location || undefined,
        notes: formData.notes || undefined,
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
          <h2 className="font-serif text-xl text-white">Add Hearing</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          <div>
            <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
              Case *
            </label>
            <select
              value={formData.caseId}
              onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
              className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-600/60"
              required
            >
              <option value="">Select a case</option>
              {cases?.map((c: { _id: string; caseNumber: string; title: string }) => (
                <option key={c._id} value={c._id}>
                  {c.caseNumber} - {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
              Hearing Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-600/60"
              placeholder="e.g., Arguments on Motion"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-600/60"
                required
              />
            </div>
            <div>
              <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-600/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-600/60"
              placeholder="e.g., Court Room 3"
            />
          </div>

          <div>
            <label className="block text-amber-500/70 text-xs uppercase tracking-wider mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-[#0a0a0f] border border-amber-900/40 px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-600/60 h-20 resize-none"
              placeholder="Additional notes..."
            />
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
              {isLoading ? "Adding..." : "Add Hearing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
