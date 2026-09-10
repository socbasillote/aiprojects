import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiRequest } from "../lib/api";

type BusinessService = { id: string; name: string; price?: number; durationMinutes?: number; description?: string };
type BusinessData = { business: { name: string; description?: string }; services: BusinessService[] };
type Confirmation = { booking: { confirmationCode: string; status: string }; qr: string; emailDelivered: boolean };

export function PublicBookingPage() {
  const { slug = "maria-studio" } = useParams();
  const [data, setData] = useState<BusinessData | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiRequest<BusinessData>(`/public/${slug}`)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Booking page unavailable"));
  }, [slug]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);

    const form = new FormData(event.currentTarget);
    try {
      const payload = {
        customer: String(form.get("customer")),
        email: String(form.get("email")),
        service: String(form.get("service")),
        staff: String(form.get("staff") ?? "Maria"),
        date: String(form.get("date")),
        time: String(form.get("time")),
        payment: String(form.get("payment") ?? "Unpaid"),
        paymentMethod: String(form.get("paymentMethod") ?? "Cash"),
      };

      const next = await apiRequest<Confirmation>(`/public/${slug}/bookings`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setConfirmation(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create booking");
    } finally {
      setBusy(false);
    }
  }

  if (confirmation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">✓</div>
          <h1 className="text-2xl font-semibold text-slate-900">Booking received</h1>
          <p className="mt-2 text-sm text-slate-600">
            Your confirmation QR code has been sent to your email.
          </p>
          <img src={confirmation.qr} alt="Booking confirmation QR code" className="mx-auto mt-5 h-48 w-48" />
          <p className="mt-3 text-sm text-slate-500">
            Code: <strong className="text-slate-900">{confirmation.booking.confirmationCode}</strong>
          </p>
          {!confirmation.emailDelivered && (
            <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
              Email delivery is not configured yet. Save this QR code for your appointment.
            </p>
          )}
          <button onClick={() => setConfirmation(null)} className="mt-6 rounded-xl border border-slate-200 px-4 py-2.5 text-sm">
            Make another booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Online booking</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{data?.business.name ?? "Book an appointment"}</h1>
          <p className="mt-2 text-slate-600">
            {data?.business.description ?? "Choose a service and time that works for you."}
          </p>
        </div>

        <form onSubmit={submit} className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Your name
              <input name="customer" required minLength={2} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5" />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Email for confirmation
              <input name="email" required type="email" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5" />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Service
              <select name="service" required className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5">
                {(data?.services ?? []).map((service) => (
                  <option key={service.id} value={service.name}>{service.name}</option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Staff
              <input name="staff" required defaultValue="Maria" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5" />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Payment method
              <select name="paymentMethod" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5">
                <option>Cash</option>
                <option>Card</option>
                <option>GCash</option>
                <option>Bank transfer</option>
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Payment
              <select name="payment" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5">
                <option>Unpaid</option>
                <option>Deposit</option>
                <option>Paid</option>
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Date
              <input name="date" required type="date" min={new Date().toISOString().slice(0, 10)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5" />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Time
              <input name="time" required type="time" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5" />
            </label>
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={busy || !data} className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-50">
            {busy ? "Booking…" : "Confirm booking"}
          </button>
        </form>
      </div>
    </div>
  );
}
