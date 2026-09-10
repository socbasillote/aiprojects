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

export function CalendarPage() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBookings() {
      try {
        const data = await apiRequest<{ bookings: Booking[] }>("/bookings/");
        setBookings(data.bookings ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load bookings");
      }
    }
    void loadBookings();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Calendar</h1>
        <button className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">+ New Booking</button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="page-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">Previous</button>
            <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">Today</button>
            <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">Next</button>
          </div>
          <div className="text-sm font-medium text-slate-700">{new Date().toLocaleString("default", { month: "long", year: "numeric" })}</div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-sm text-slate-500">
          {days.map((day) => <div key={day} className="py-2 font-medium text-slate-600">{day}</div>)}
          {Array.from({ length: 35 }).map((_, idx) => {
            const booking = bookings[idx % Math.max(bookings.length, 1)];
            return <div key={idx} className={`min-h-24 rounded-xl border border-slate-200 p-2 ${idx === 10 ? "bg-slate-900 text-white" : "bg-slate-50"}`}>
              <div className="text-left text-sm font-medium">{idx % 7 === 0 ? "" : idx - 1 < 30 ? idx : ""}</div>
              {booking && <div className="mt-3 rounded-md bg-white/10 px-2 py-1 text-left text-xs">{booking.customer.slice(0, 8)} — {booking.service}</div>}
            </div>;
          })}
        </div>
      </div>
    </div>
  );
}
