import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

type Booking = {
  id: string;
  customer: string;
  email: string;
  service: string;
  staff: string;
  date: string;
  time: string;
  status: "Confirmed" | "Pending" | "Completed";
  payment: "Unpaid" | "Deposit" | "Paid";
  paymentMethod: "Cash" | "Card" | "GCash" | "Bank transfer";
};

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
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

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
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Calendar
        </h1>
        <button className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
          + New Booking
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="page-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600"
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
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600"
              onClick={() =>
                setCurrentMonth(
                  new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                )
              }
            >
              Today
            </button>
            <button
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600"
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
          <div className="text-sm font-medium text-slate-700">
            {currentMonth.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-sm text-slate-500">
          {days.map((day) => (
            <div key={day} className="py-2 font-medium text-slate-600">
              {day}
            </div>
          ))}
          {calendarCells.map((cell, idx) => {
            if (!cell.date) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-24 rounded-xl border border-slate-200 bg-slate-50/50 p-2"
                />
              );
            }

            const dateBookings = bookings.filter(
              (booking) => booking.date === cell.key,
            );
            return (
              <div
                key={cell.key}
                className="min-h-24 rounded-xl border border-slate-200 bg-slate-50 p-2"
              >
                <div className="text-left text-sm font-medium text-slate-700">
                  {cell.dayNumber}
                </div>
                <div className="mt-2 space-y-1">
                  {dateBookings.length === 0
                    ? null
                    : dateBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="rounded-md bg-slate-900 px-2 py-1 text-left text-[11px] leading-4 text-white"
                        >
                          <div className="font-medium">
                            {booking.customer.slice(0, 12)} — {booking.service}
                          </div>
                          <div className="text-slate-300">{booking.time}</div>
                        </div>
                      ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
