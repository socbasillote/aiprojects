import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiRequest } from "../lib/api";

type BusinessService = {
  id: string;
  name: string;
  price?: number;
  durationMinutes?: number;
  description?: string;
};
type BookingEntry = {
  date: string;
  time: string;
};
type BusinessData = {
  business: {
    name: string;
    description?: string;
    openHour?: string;
    closeHour?: string;
    slotsPerHour?: number;
  };
  services: BusinessService[];
  bookings?: BookingEntry[];
};
type Confirmation = {
  booking: { confirmationCode: string; status: string };
  qr: string;
  emailDelivered: boolean;
};

const isValidBookingTime = (value: string) =>
  /^([01]\d|2[0-3]):(00|30)$/.test(value);

function minutesFromTime(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function getSlots(openHour = "08:00", closeHour = "20:00", slotsPerHour = 2) {
  const start = minutesFromTime(openHour);
  const end = minutesFromTime(closeHour);
  const interval = 60 / Math.max(1, Math.min(2, slotsPerHour ?? 2));
  const slots: string[] = [];

  for (let minute = start; minute < end; minute += interval) {
    const hour = Math.floor(minute / 60);
    const minuteOfHour = minute % 60;
    slots.push(
      `${String(hour).padStart(2, "0")}:${String(minuteOfHour).padStart(2, "0")}`,
    );
  }

  return slots;
}

function dateKeyFromDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateOptions(daysAhead = 45) {
  const dates: string[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  for (let i = 0; i < daysAhead; i += 1) {
    const next = new Date(start);
    next.setDate(start.getDate() + i);
    dates.push(dateKeyFromDate(next));
  }

  return dates;
}

export function PublicBookingPage() {
  const { slug = "maria-studio" } = useParams();
  const [data, setData] = useState<BusinessData | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const allSlots = getSlots(
    data?.business?.openHour ?? "08:00",
    data?.business?.closeHour ?? "20:00",
    data?.business?.slotsPerHour ?? 2,
  );

  function isDateFullyBooked(date: string) {
    const dayBookings = (data?.bookings ?? []).filter((entry) => entry.date === date);
    return (
      allSlots.length > 0 &&
      allSlots.every((slot) => dayBookings.some((entry) => entry.time === slot))
    );
  }

  function chooseDate(date: string) {
    setSelectedDate(date);
    const availableTimes = allSlots.filter(
      (slot) => !(data?.bookings ?? []).some((entry) => entry.date === date && entry.time === slot),
    );
    setSelectedTime(availableTimes[0] ?? "");
  }

  useEffect(() => {
    apiRequest<BusinessData>(`/public/${slug}`)
      .then((payload) => {
        setData(payload);
        const firstAvailable = getDateOptions(45)[0] ?? dateKeyFromDate(new Date());
        const firstAvailableSlots = getSlots(
          payload.business.openHour ?? "08:00",
          payload.business.closeHour ?? "20:00",
          payload.business.slotsPerHour ?? 2,
        ).filter(
          (slot) =>
            !(payload.bookings ?? []).some(
              (entry) => entry.date === firstAvailable && entry.time === slot,
            ),
        );
        setSelectedDate(firstAvailable);
        setSelectedTime(firstAvailableSlots[0] ?? "");
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Booking page unavailable",
        ),
      );
  }, [slug]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);

    const form = new FormData(event.currentTarget);
    try {
      const date = selectedDate || String(form.get("date") ?? "");
      const time = selectedTime || String(form.get("time") ?? "");
      if (!isValidBookingTime(time)) {
        throw new Error(
          "Choose a booking time in 30-minute steps, such as 09:00 or 09:30.",
        );
      }

      const paymentMethod = String(form.get("paymentMethod") ?? "PayPal");
      const payment =
        paymentMethod === "PayPal"
          ? "Paid"
          : String(form.get("payment") ?? "Unpaid");

      const payload = {
        customer: String(form.get("customer")),
        email: String(form.get("email")),
        service: String(form.get("service")),
        staff: String(form.get("staff") ?? "Maria"),
        date,
        time,
        payment,
        paymentMethod,
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
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            ✓
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Booking received
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Your confirmation QR code has been sent to your email.
          </p>
          <img
            src={confirmation.qr}
            alt="Booking confirmation QR code"
            className="mx-auto mt-5 h-48 w-48"
          />
          <p className="mt-3 text-sm text-slate-500">
            Code:{" "}
            <strong className="text-slate-900">
              {confirmation.booking.confirmationCode}
            </strong>
          </p>
          {!confirmation.emailDelivered && (
            <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
              Email delivery is not configured yet. Save this QR code for your
              appointment.
            </p>
          )}
          <button
            onClick={() => setConfirmation(null)}
            className="mt-6 rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
          >
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Online booking
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            {data?.business.name ?? "Book an appointment"}
          </h1>
          <p className="mt-2 text-slate-600">
            {data?.business.description ??
              "Choose a service and time that works for you."}
          </p>
        </div>

        <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Your name
              <input
                name="customer"
                required
                minLength={2}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Email for confirmation
              <input
                name="email"
                required
                type="email"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Service
              <select
                name="service"
                required
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"
              >
                {(data?.services ?? []).map((service) => (
                  <option key={service.id} value={service.name}>
                    {service.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Staff
              <input
                name="staff"
                required
                defaultValue="Maria"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Payment method
              <select
                name="paymentMethod"
                defaultValue="PayPal"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"
              >
                <option>Cash</option>
                <option>Card</option>
                <option>GCash</option>
                <option>Bank transfer</option>
                <option>PayPal</option>
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Payment
              <select
                name="payment"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"
              >
                <option>Unpaid</option>
                <option>Deposit</option>
                <option>Paid</option>
              </select>
            </label>

            <div className="sm:col-span-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">
                    Choose date
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
                    {selectedDate ? selectedDate : "Select a date"}
                  </span>
                </div>
                <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                  {getDateOptions(45).map((date) => {
                    const booked = isDateFullyBooked(date);
                    const isActive = selectedDate === date;
                    const display = new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    });

                    return (
                      <button
                        key={date}
                        type="button"
                        disabled={booked}
                        onClick={() => chooseDate(date)}
                        className={`min-w-21 rounded-2xl border px-3 py-2.5 text-center transition ${
                          isActive
                            ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-900 hover:bg-slate-50"
                        } ${booked ? "cursor-not-allowed opacity-45" : ""}`}
                      >
                        <span className="block text-[10px] font-semibold uppercase tracking-wide">
                          {display.split(",")[0]}
                        </span>
                        <span className="mt-1 block text-xs font-semibold">
                          {display.split(",")[1] ?? display}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <input type="hidden" name="date" value={selectedDate} required />
              </div>
            </div>

            <div className="sm:col-span-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">
                    Choose time
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
                    {selectedTime ? selectedTime : "No slot"}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {allSlots.map((slot) => {
                    const isBooked = (data?.bookings ?? []).some(
                      (entry) => entry.date === selectedDate && entry.time === slot,
                    );
                    const isActive = selectedTime === slot;

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isBooked}
                        onClick={() => setSelectedTime(slot)}
                        className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                          isActive
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-900 hover:bg-slate-50"
                        } ${isBooked ? "cursor-not-allowed line-through opacity-45" : ""}`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
                <input type="hidden" name="time" value={selectedTime} required />
              </div>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={busy || !data}
            className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-50"
          >
            {busy ? "Booking…" : "Confirm booking"}
          </button>
        </form>
      </div>
    </div>
  );
}
