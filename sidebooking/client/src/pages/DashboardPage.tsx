import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarClock,
  Clock3,
  CreditCard,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiRequest } from "../lib/api";

type Booking = {
  id: string;
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

export function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await apiRequest<{ bookings: Booking[] }>("/bookings/");
        setBookings(
          (data.bookings ?? []).map((row) => ({
            ...row,
            id: (row as any).id ?? (row as any)._id,
          })),
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load dashboard data",
        );
      }
    }
    void loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayBookings = bookings.filter((row) => row.date === today);
    const pending = bookings.filter((row) => row.status === "Pending");
    const revenue = bookings.reduce(
      (sum, row) =>
        sum +
        (row.payment === "Paid" ? 250 : row.payment === "Deposit" ? 150 : 0),
      0,
    );

    return [
      {
        label: "Today's Bookings",
        value: String(todayBookings.length || bookings.length || 0),
        change: "+14%",
        icon: CalendarClock,
      },
      {
        label: "Today's Revenue",
        value: `₱${revenue.toLocaleString()}`,
        change: "+9%",
        icon: CreditCard,
      },
      {
        label: "Pending",
        value: String(pending.length),
        change: `${Math.max(pending.length - 1, 0)} urgent`,
        icon: Clock3,
      },
      {
        label: "Upcoming",
        value: String(bookings.length),
        change: "+6%",
        icon: Users,
      },
    ];
  }, [bookings]);

  const schedule = bookings
    .slice(0, 4)
    .map((row) => ({
      time: row.time,
      customer: row.customer,
      service: row.service,
      staff: row.staff,
      status: row.status,
      payment: row.payment,
    }));
  const revenueData = bookings
    .slice(0, 7)
    .map((row, idx) => ({
      day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][idx % 7],
      value:
        1000 +
        idx * 400 +
        (row.payment === "Paid" ? 800 : row.payment === "Deposit" ? 400 : 100),
    }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-500">Good afternoon 👋</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
            Here’s what’s happening today.
          </h1>
        </div>
        <button className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
          + New Booking
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, change, icon: Icon }) => (
          <div key={label} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">
                  {value}
                </h2>
              </div>
              <div className="rounded-lg bg-slate-900 p-2 text-white">
                <Icon size={18} />
              </div>
            </div>
            <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
              <ArrowUpRight size={12} />
              {change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="page-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Today’s Schedule
            </h2>
            <button className="text-sm text-slate-600 hover:text-slate-900">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {schedule.length === 0 && (
              <div className="text-sm text-slate-500">No bookings yet.</div>
            )}
            {schedule.map((booking) => (
              <div
                key={`${booking.time}-${booking.customer}`}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 text-sm font-semibold text-slate-500">
                    {booking.time}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">
                      {booking.customer}
                    </div>
                    <div className="text-sm text-slate-500">
                      {booking.service}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 md:justify-end">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">
                    {booking.staff}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                    {booking.status}
                  </span>
                  <span className="rounded-full bg-sky-50 px-2.5 py-1 text-sky-700">
                    {booking.payment}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="page-card p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Needs Attention
          </h2>
          <ul className="mt-4 space-y-3">
            <li className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-500" />
              {Math.max(
                bookings.filter((row) => row.status === "Pending").length,
                0,
              )}{" "}
              pending booking(s) need confirmation
            </li>
            <li className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-500" />
              {Math.max(
                bookings.filter((row) => row.payment === "Unpaid").length,
                0,
              )}{" "}
              unpaid invoices
            </li>
          </ul>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="page-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Revenue Overview
            </h2>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1 text-xs text-slate-600">
              <button className="rounded-full bg-white px-2.5 py-1 font-medium text-slate-900">
                7 days
              </button>
              <button className="px-2.5 py-1">30 days</button>
              <button className="px-2.5 py-1">90 days</button>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#0f172a"
                  strokeWidth={2}
                  fill="url(#revenueFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="page-card p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Popular Services
          </h2>
          <div className="mt-5 space-y-4">
            {bookings.length > 0 ? (
              Array.from(
                new Map(bookings.map((row) => [row.service, 0])).keys(),
              )
                .slice(0, 4)
                .map((service, idx) => (
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-slate-700">{service}</span>
                    <span className="font-medium text-slate-900">
                      {Math.max(12 - idx * 2, 2)}%
                    </span>
                  </div>
                ))
            ) : (
              <div className="text-sm text-slate-500">No services yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
