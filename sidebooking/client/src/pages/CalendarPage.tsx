export function CalendarPage() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Calendar
        </h1>
        <button className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
          + New Booking
        </button>
      </div>

      <div className="page-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">
              Previous
            </button>
            <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">
              Today
            </button>
            <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">
              Next
            </button>
          </div>
          <div className="text-sm font-medium text-slate-700">
            September 2026
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-sm text-slate-500">
          {days.map((day) => (
            <div key={day} className="py-2 font-medium text-slate-600">
              {day}
            </div>
          ))}

          {Array.from({ length: 35 }).map((_, idx) => (
            <div
              key={idx}
              className={`min-h-24 rounded-xl border border-slate-200 p-2 ${idx === 10 ? "bg-slate-900 text-white" : "bg-slate-50"}`}
            >
              <div className="text-left text-sm font-medium">
                {idx % 7 === 0 ? "" : idx - 1 < 30 ? idx : ""}
              </div>
              {idx === 10 && (
                <div className="mt-3 rounded-md bg-white/10 px-2 py-1 text-left text-xs">
                  Anna — Haircut
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
