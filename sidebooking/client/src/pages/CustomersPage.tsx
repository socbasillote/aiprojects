import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

type Customer = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status?: "active" | "inactive";
  notes?: string;
};

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCustomers() {
      try {
        const data = await apiRequest<{ customers: Customer[] }>("/customers/");
        setCustomers(data.customers ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load customers");
      }
    }
    void loadCustomers();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Customers</h1>
        <button className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">+ Add Customer</button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="page-card p-5">
        <div className="grid gap-4 md:grid-cols-3">
          {customers.map((customer) => (
            <div key={customer.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                  {customer.name.slice(0, 1)}
                </div>
                <div>
                  <div className="font-medium text-slate-900">{customer.name}</div>
                  <div className="text-sm text-slate-500">{customer.email ?? customer.phone ?? "No contact"}</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>{customer.status ?? "active"}</span>
                <span className="font-medium text-slate-900">{customer.phone ? "Phone" : "Email"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
