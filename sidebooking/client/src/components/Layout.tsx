import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Sparkles,
  UserCircle2,
  Users,
  Megaphone,
} from "lucide-react";
import { logout } from "../features/auth/authSlice";
import type { RootState } from "../store/store";

const businessNav = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Calendar", to: "/calendar", icon: CalendarDays },
  { label: "Bookings", to: "/bookings", icon: BriefcaseBusiness },
  { label: "Customers", to: "/customers", icon: Users },
];

const operationsNav = [
  { label: "Services", to: "/services", icon: Sparkles },
  { label: "Team", to: "/team", icon: UserCircle2 },
  { label: "Availability", to: "/calendar", icon: CalendarDays },
];

const growthNav = [
  { label: "Payments", to: "/bookings", icon: CreditCard },
  { label: "Promotions", to: "/promotions", icon: Megaphone },
  { label: "Reports", to: "/dashboard", icon: LayoutDashboard },
];

const footerNav = [
  { label: "Booking Page", to: "/book/maria-studio", icon: BriefcaseBusiness },
  { label: "Settings", to: "/settings", icon: Settings },
];

export function Layout({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="app-shell flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-slate-200 bg-white p-4 lg:flex lg:flex-col">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Sidebooking
            </div>
            <div className="mt-1 text-lg font-semibold">Maria Studio</div>
          </div>
          <button className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50">
            <Menu size={18} />
          </button>
        </div>

        <nav className="space-y-6 text-sm">
          <div>
            <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Business
            </div>
            <div className="space-y-1">
              {businessNav.map(({ label, to, icon: Icon }) => (
                <NavLink
                  key={label}
                  to={to}
                  className={({ isActive }) =>
                    `sidebar-item flex items-center gap-3 rounded-xl px-3 py-2 ${isActive ? "active" : ""}`
                  }
                >
                  <Icon size={16} className="shrink-0" />
                  <span className="leading-none">{label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Operations
            </div>
            <div className="space-y-1">
              {operationsNav.map(({ label, to, icon: Icon }) => (
                <NavLink
                  key={label}
                  to={to}
                  className={({ isActive }) =>
                    `sidebar-item flex items-center gap-3 rounded-xl px-3 py-2 ${isActive ? "active" : ""}`
                  }
                >
                  <Icon size={16} className="shrink-0" />
                  <span className="leading-none">{label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Growth
            </div>
            <div className="space-y-1">
              {growthNav.map(({ label, to, icon: Icon }) => (
                <NavLink
                  key={label}
                  to={to}
                  className={({ isActive }) =>
                    `sidebar-item flex items-center gap-3 rounded-xl px-3 py-2 ${isActive ? "active" : ""}`
                  }
                >
                  <Icon size={16} className="shrink-0" />
                  <span className="leading-none">{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        <div className="mt-auto space-y-1 border-t border-slate-200 pt-4">
          {footerNav.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                `sidebar-item flex items-center gap-3 rounded-xl px-3 py-2 ${isActive ? "active" : ""}`
              }
            >
              <Icon size={16} className="shrink-0" />
              <span className="leading-none">{label}</span>
            </NavLink>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                {user?.name.slice(0, 1) ?? "A"}
              </div>
              <div>
                <div className="font-medium text-slate-900">
                  {user?.name ?? "Alicia"}
                </div>
                <div className="text-xs text-slate-500">Owner</div>
              </div>
            </div>
            <button
              onClick={() => dispatch(logout())}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100"
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="min-h-screen flex-1 lg:ml-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3 px-4 py-4 lg:px-7">
            <div className="flex items-center gap-3">
              <button className="rounded-lg border border-slate-200 p-2 text-slate-600 lg:hidden">
                <Menu size={18} />
              </button>
              <div className="relative w-full max-w-md">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-300"
                  placeholder="Search bookings or customers"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50">
                <Bell size={18} />
              </button>
              <button
                onClick={() => navigate("/bookings?new=1")}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                <span className="inline-flex items-center gap-2">
                  New Booking
                </span>
              </button>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-7">{children}</div>
      </main>
    </div>
  );
}
