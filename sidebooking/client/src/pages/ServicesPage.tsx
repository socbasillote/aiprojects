import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { addService } from "../features/booking/bookingSlice";

export function ServicesPage() {
  const dispatch = useDispatch();
  const services = useSelector((state: RootState) => state.booking.services);
  const [open, setOpen] = useState(false);
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    dispatch(addService({ name: String(form.get("name")), price: Number(form.get("price")), duration: Number(form.get("duration")) }));
    setOpen(false);
  }
  return <div className="space-y-5">
    <div className="flex items-center justify-between"><h1 className="text-3xl font-semibold tracking-tight text-slate-900">Services</h1><button onClick={() => setOpen(true)} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">+ Add Service</button></div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{services.map((service) => <div key={service.id} className="page-card p-5"><div className="mb-4 flex items-start justify-between"><div><h2 className="text-xl font-semibold text-slate-900">{service.name}</h2><p className="mt-1 text-sm text-slate-500">Online booking enabled</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Active</span></div><div className="text-2xl font-semibold text-slate-900">₱{service.price.toLocaleString()}</div><div className="mt-4 text-sm text-slate-600">{service.duration} minutes</div></div>)}</div>
    {open && <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/30 p-4"><form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"><h2 className="text-xl font-semibold">Add service</h2><div className="mt-5 space-y-4"><input name="name" required placeholder="Service name" className="w-full rounded-xl border border-slate-200 px-3 py-2.5" /><input name="price" required min="0" type="number" placeholder="Price (PHP)" className="w-full rounded-xl border border-slate-200 px-3 py-2.5" /><input name="duration" required min="5" type="number" placeholder="Duration (minutes)" className="w-full rounded-xl border border-slate-200 px-3 py-2.5" /></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setOpen(false)} className="rounded-xl border px-4 py-2.5">Cancel</button><button className="rounded-xl bg-slate-900 px-4 py-2.5 text-white">Save service</button></div></form></div>}
  </div>;
}
