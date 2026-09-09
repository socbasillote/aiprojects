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

const stats = [
  {
    label: "Today's Bookings",
    value: "12",
    change: "+14%",
    icon: CalendarClock,
  },
  {
    label: "Today's Revenue",
    value: "₱8,400",
    change: "+9%",
    icon: CreditCard,
  },
  { label: "Pending", value: "4", change: "2 urgent", icon: Clock3 },
  { label: "Upcoming", value: "28", change: "+6%", icon: Users },
];

const revenue = [
  { day: "Mon", value: 4200 },
  { day: "Tue", value: 5100 },
  { day: "Wed", value: 4700 },
  { day: "Thu", value: 6200 },
  { day: "Fri", value: 6800 },
  { day: "Sat", value: 7600 },
  { day: "Sun", value: 7100 },
];

const schedule = [
  {
    time: "09:00",
    customer: "Anna Santos",
    service: "Haircut",
    staff: "Maria",
    status: "Confirmed",
    payment: "Paid",
  },
  {
    time: "10:30",
    customer: "Jean Santos",
    service: "Balayage",
    staff: "Rhea",
    status: "Pending",
    payment: "Deposit",
  },
  {
    time: "12:00",
    customer: "Kai Reyes",
    service: "Facial",
    staff: "Dianne",
    status: "Confirmed",
    payment: "Paid",
  },
  {
    time: "14:00",
    customer: "Mona Cruz",
    service: "Massage",
    staff: "Lia",
    status: "Needs Review",
    payment: "Unpaid",
  },
];

const needsAttention = [
  "3 pending bookings need confirmation",
  "2 unpaid invoices due today",
  "1 cancellation request pending",
  "2 no-shows flagged",
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-500">Good afternoon, Alicia 👋</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
            Here’s what’s happening today.
          </h1>
        </div>
        <button className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
          + New Booking
        </button>
      </div>

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
            {needsAttention.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800"
              >
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-500" />
                {item}
              </li>
            ))}
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
                data={revenue}
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
            {[
              { name: "Haircut", count: 48, share: "31%" },
              { name: "Balayage", count: 21, share: "24%" },
              { name: "Facial", count: 17, share: "19%" },
              { name: "Massage", count: 13, share: "13%" },
            ].map((service) => (
              <div key={service.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-slate-700">{service.name}</span>
                  <span className="font-medium text-slate-900">
                    {service.share}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100">
                  <div
                    className="h-2.5 rounded-full bg-slate-900"
                    style={{ width: service.share }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
