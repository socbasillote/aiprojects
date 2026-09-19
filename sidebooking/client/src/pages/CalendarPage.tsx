import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

type Booking = {
  id: string;
  confirmationCode?: string;
  customer: string;
  email: string;
  service: string;
  staff: string;
  date: string;
  time: string;
  status: "Confirmed" | "Pending" | "Completed" | "Rejected";
  payment: "Unpaid" | "Deposit" | "Paid";
  paymentMethod:
    | "Cash"
    | "Card"
    | "GCash"
    | "Bank transfer"
    | "PayPal"
    | "PayMongo";
};

function normalizeBooking(raw: Partial<Booking> & { _id?: string }) {
  return {
    ...raw,
    id: raw.id ?? String(raw._id ?? ""),
    customer: raw.customer ?? "",
    email: raw.email ?? "",
    service: raw.service ?? "",
    staff: raw.staff ?? "Maria",
    date: raw.date ?? toDateKey(new Date()),
    time: raw.time ?? "09:00",
    status: raw.status ?? "Pending",
    payment: raw.payment ?? "Unpaid",
    paymentMethod: raw.paymentMethod ?? "PayPal",
  } as Booking;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function CalendarPage() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editDraft, setEditDraft] = useState<Booking | null>(null);
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [draft, setDraft] = useState({
    customer: "",
    email: "",
    service: "",
    staff: "Maria",
    date: toDateKey(new Date()),
    time: "09:00",
    status: "Pending" as Booking["status"],
    payment: "Unpaid" as Booking["payment"],
    paymentMethod: "PayPal" as Booking["paymentMethod"],
  });

  useEffect(() => {
    async function loadBookings() {
      try {
        const data = await apiRequest<{ bookings: Booking[] }>("/bookings/");
        setBookings(data.bookings ?? []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load bookings",
        );
      }
    }
    void loadBookings();
  }, []);

  async function createBooking(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      await apiRequest<{ booking: Booking }>("/bookings/", {
        method: "POST",
        body: JSON.stringify(draft),
      });
      const data = await apiRequest<{ bookings: Booking[] }>("/bookings/");
      setBookings(
        (data.bookings ?? []).map((row) =>
          normalizeBooking(row as Partial<Booking> & { _id?: string }),
        ),
      );
      setShowForm(false);
      setDraft({
        ...draft,
        customer: "",
        email: "",
        service: "",
        staff: "Maria",
        date: toDateKey(new Date()),
        time: "09:00",
        payment: "Unpaid",
        paymentMethod: "PayPal",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create booking");
    } finally {
      setBusy(false);
    }
  }

  const calendarStart = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1,
  );
  const startOffset = calendarStart.getDay();
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0,
  ).getDate();
  const calendarCells = Array.from({ length: 42 }, (_, idx) => {
    const dayNumber = idx - startOffset + 1;
    const isInMonth = dayNumber >= 1 && dayNumber <= daysInMonth;
    const date = isInMonth
      ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNumber)
      : null;
    return {
      date,
      key: date ? toDateKey(date) : "",
      dayNumber: isInMonth ? dayNumber : null,
    };
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Booking calendar
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Calendar
          </h1>
        </div>
        <button
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          onClick={() => setShowForm(true)}
        >
          + New Booking
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="page-card overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-linear-to-r from-slate-900 to-slate-800 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/20"
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() - 1,
                      1,
                    ),
                  )
                }
              >
                Previous
              </button>
              <button
                className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/20"
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      new Date().getFullYear(),
                      new Date().getMonth(),
                      1,
                    ),
                  )
                }
              >
                Today
              </button>
              <button
                className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/20"
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1,
                      1,
                    ),
                  )
                }
              >
                Next
              </button>
            </div>
            <div className="text-sm font-semibold tracking-wide text-slate-100">
              {currentMonth.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {days.map((day) => (
              <div key={day} className="rounded-lg bg-slate-50 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {calendarCells.map((cell, idx) => {
              if (!cell.date) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-28 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-2"
                  />
                );
              }

              const dateBookings = bookings.filter(
                (booking) => booking.date === cell.key,
              );
              const isToday = cell.key === toDateKey(new Date());
              return (
                <div
                  key={cell.key}
                  className={`min-h-28 rounded-2xl border p-2 shadow-sm transition ${
                    isToday
                      ? "border-violet-400 bg-violet-50/40"
                      : "border-slate-200 bg-white hover:shadow-md"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-left text-sm font-semibold text-slate-700">
                      {cell.dayNumber}
                    </span>
                    {isToday && (
                      <span className="rounded-full bg-violet-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                        Today
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {dateBookings.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-slate-200 px-2 py-1 text-[10px] font-medium text-slate-400">
                        Free
                      </div>
                    ) : (
                      dateBookings.map((booking) => (
                        <button
                          key={booking.id}
                          type="button"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setEditDraft({ ...booking });
                          }}
                          className={`w-full rounded-xl px-2 py-1 text-left text-[11px] leading-4 shadow-sm transition ${
                            booking.status === "Rejected"
                              ? "bg-red-600 text-white hover:bg-red-500"
                              : booking.status === "Confirmed"
                                ? "bg-emerald-600 text-white hover:bg-emerald-500"
                                : booking.status === "Completed"
                                  ? "bg-sky-600 text-white hover:bg-sky-500"
                                  : "bg-slate-900 text-white hover:bg-slate-700"
                          }`}
                        >
                          <div className="truncate font-semibold">
                            {booking.customer.slice(0, 12)} — {booking.service}
                          </div>
                          <div className="mt-0.5 opacity-90">
                            {booking.time}
                          </div>
                          {booking.status === "Rejected" && (
                            <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-100">
                              Rejected
                            </div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-xl rounded-3xl border border-white/40 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">
                  Quick booking
                </div>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                  Create Appointment
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-full border border-slate-200 px-3 py-1 text-slate-500 transition hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={createBooking}
              className="grid gap-4 sm:grid-cols-2"
            >
              <label className="text-sm font-medium text-slate-700">
                Customer
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-500"
                  required
                  value={draft.customer}
                  onChange={(event) =>
                    setDraft({ ...draft, customer: event.target.value })
                  }
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Email
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-500"
                  required
                  type="email"
                  value={draft.email}
                  onChange={(event) =>
                    setDraft({ ...draft, email: event.target.value })
                  }
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Service
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-500"
                  required
                  value={draft.service}
                  onChange={(event) =>
                    setDraft({ ...draft, service: event.target.value })
                  }
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Staff
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-500"
                  required
                  value={draft.staff}
                  onChange={(event) =>
                    setDraft({ ...draft, staff: event.target.value })
                  }
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Date
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-500"
                  required
                  type="date"
                  value={draft.date}
                  onChange={(event) =>
                    setDraft({ ...draft, date: event.target.value })
                  }
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Time
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-500"
                  value={draft.time}
                  onChange={(event) =>
                    setDraft({ ...draft, time: event.target.value })
                  }
                >
                  {[
                    "08:00",
                    "08:30",
                    "09:00",
                    "09:30",
                    "10:00",
                    "10:30",
                    "11:00",
                    "11:30",
                    "12:00",
                    "12:30",
                    "13:00",
                    "13:30",
                    "14:00",
                    "14:30",
                    "15:00",
                    "15:30",
                    "16:00",
                    "16:30",
                    "17:00",
                    "17:30",
                    "18:00",
                  ].map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700">
                Status
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-500"
                  value={draft.status}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      status: event.target.value as Booking["status"],
                    })
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700">
                Payment
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-500"
                  value={draft.payment}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      payment: event.target.value as Booking["payment"],
                    })
                  }
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Deposit">Deposit</option>
                  <option value="Paid">Paid</option>
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                Payment method
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-500"
                  value={draft.paymentMethod}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      paymentMethod: event.target
                        .value as Booking["paymentMethod"],
                    })
                  }
                >
                  <option>Cash</option>
                  <option>Card</option>
                  <option>GCash</option>
                  <option>Bank transfer</option>
                  <option>PayPal</option>
                  <option>PayMongo</option>
                </select>
              </label>

              <div className="sm:col-span-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
                >
                  {busy ? "Saving..." : "Save booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
