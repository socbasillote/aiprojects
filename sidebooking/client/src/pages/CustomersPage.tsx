export function CustomersPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Customers
        </h1>
        <button className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
          + Add Customer
        </button>
      </div>

      <div className="page-card p-5">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Anna Santos", "anna@example.com", "12 bookings", "₱18,400"],
            ["Jean Santos", "jean@example.com", "8 bookings", "₱12,600"],
            ["Mona Cruz", "mona@example.com", "15 bookings", "₱22,150"],
          ].map(([name, email, bookings, value]) => (
            <div
              key={name}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                  {name.slice(0, 1)}
                </div>
                <div>
                  <div className="font-medium text-slate-900">{name}</div>
                  <div className="text-sm text-slate-500">{email}</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>{bookings}</span>
                <span className="font-medium text-slate-900">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
