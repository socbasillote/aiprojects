import { NavLink } from "react-router-dom";

const navigation = [
  {
    label: "Dashboard",
    to: "/dashboard",
  },
  {
    label: "Assessments",
    to: "/assessments",
  },
  {
    label: "Question Bank",
    to: "/question-bank",
  },
  {
    label: "Templates",
    to: "/templates",
  },
];

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <span className="text-xl font-bold tracking-tight text-slate-900">
          QuizForge
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "block rounded-lg px-3 py-2.5 text-sm font-medium transition",
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <button
          type="button"
          className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Settings
        </button>
      </div>
    </aside>
  );
}
