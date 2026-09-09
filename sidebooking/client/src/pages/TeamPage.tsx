export function TeamPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Team
        </h1>
        <button className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
          + Add Staff
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          ["Maria", "Owner", "Haircut & Styling"],
          ["Rhea", "Senior Stylist", "Coloring"],
          ["Dianne", "Reception", "Front desk & support"],
        ].map(([name, role, specialty]) => (
          <div key={name} className="page-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                {name.slice(0, 1)}
              </div>
              <div>
                <div className="font-semibold text-slate-900">{name}</div>
                <div className="text-sm text-slate-500">{role}</div>
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-600">{specialty}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
