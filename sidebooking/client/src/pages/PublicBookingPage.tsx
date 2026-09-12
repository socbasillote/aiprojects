import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
  court?: string;
};

type BusinessData = {
  business: {
    name: string;
    description?: string;
    openHour?: string;
    closeHour?: string;
    slotsPerHour?: number;
    courtsCount?: number;
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
  const [selectedCourt, setSelectedCourt] = useState<string>("Court 1");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const courtsCount = Math.max(1, Number(data?.business?.courtsCount ?? 3));
  const courtNames = Array.from({ length: courtsCount }, (_, index) => `Court ${index + 1}`);

  const allSlots = getSlots(
    data?.business?.openHour ?? "08:00",
    data?.business?.closeHour ?? "20:00",
    data?.business?.slotsPerHour ?? 2,
  );

  function isDateFullyBooked(date: string) {
    const dayBookings = (data?.bookings ?? []).filter(
      (entry) => entry.date === date,
    );
    return (
      allSlots.length > 0 &&
      allSlots.every((slot) => dayBookings.some((entry) => entry.time === slot))
    );
  }

  function chooseDate(date: string) {
    setSelectedDate(date);
    const availableTimes = allSlots.filter(
      (slot) =>
        !(data?.bookings ?? []).some(
          (entry) => entry.date === date && entry.time === slot,
        ),
    );
    setSelectedTime(availableTimes[0] ?? "");
  }

  useEffect(() => {
    apiRequest<BusinessData>(`/public/${slug}`)
      .then((payload) => {
        setData(payload);
        const firstAvailable =
          getDateOptions(45)[0] ?? dateKeyFromDate(new Date());
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
        court: selectedCourt,
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
      <div className="flex min-h-screen items-center justify-center bg-[#eef6ed] p-4">
        <div className="w-full max-w-md rounded-4xl border border-emerald-900/10 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-lime-200 text-emerald-800">
            ✓
          </div>
          <h1 className="text-3xl font-black tracking-[-0.03em] text-slate-950">
            Booking received
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Your confirmation QR code has been sent to your email.
          </p>
          <img
            src={confirmation.qr}
            alt="Booking confirmation QR code"
            className="mx-auto mt-5 h-48 w-48 rounded-2xl border border-emerald-900/10 bg-white p-2"
          />
          <p className="mt-4 text-sm font-black uppercase tracking-[0.2em] text-slate-500">
            Code: <strong className="text-slate-950">{confirmation.booking.confirmationCode}</strong>
          </p>
          {!confirmation.emailDelivered && (
            <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs font-bold text-amber-800">
              Email delivery is not configured yet. Save this QR code for your
              appointment.
            </p>
          )}
          <button
            onClick={() => setConfirmation(null)}
            className="mt-6 rounded-2xl border border-emerald-900/20 bg-white px-5 py-2.5 text-sm font-black text-slate-900 transition hover:bg-emerald-950 hover:text-white"
          >
            Make another booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef6ed] text-slate-900">
      <header className="border-b border-emerald-900/10 bg-[#173f2d] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-lime-300 bg-lime-300 text-sm font-black text-slate-950 shadow-sm">
              PB
            </span>
            <span className="text-lg font-black tracking-tight">
              PicklePark
            </span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {[
              "Club",
              "Courts",
              "Programs",
              "Events",
              "Reviews",
              "About",
            ].map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm font-bold uppercase tracking-[0.14em] text-emerald-50 transition hover:text-lime-300"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2 text-sm font-bold text-emerald-50 transition hover:bg-white/10"
            >
              Club login
            </Link>
            <Link
              to="/book/maria-studio"
              className="rounded-xl bg-lime-300 px-4 py-2.5 text-sm font-black text-slate-950 shadow-sm transition hover:bg-lime-200"
            >
              Book a Court
            </Link>
          </div>
        </div>
      </header>

      <main className="bg-[#eef6ed]">
        <section className="relative overflow-hidden border-b border-emerald-900/10 bg-[#183f2e] text-white">
          <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-lime-300/20 blur-3xl" />
          <div className="absolute left-0 top-16 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />

          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 md:grid-cols-[0.8fr,1.2fr]">
            <div className="max-w-xl">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-lime-300" />
                <span className="text-xs font-black uppercase tracking-[0.26em] text-lime-200">
                  Pickleball Club
                </span>
              </div>

              <h1 className="mt-6 text-5xl font-black leading-none tracking-[-0.045em] md:text-6xl">
                {data?.business.name ?? "Book a Court"}
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-8 text-emerald-50">
                {data?.business.description ?? "Choose a service and time that works for you."}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/"
                  className="rounded-2xl border border-white/30 px-7 py-3 text-sm font-black text-white transition hover:bg-white/10"
                >
                  Back to club
                </Link>
                <span className="rounded-2xl bg-lime-300 px-7 py-3 text-sm font-black text-slate-950">
                  Open daily
                </span>
              </div>
            </div>

            <aside className="relative">
              <div className="rounded-4xl border border-lime-300/30 bg-white/8 p-2 shadow-2xl shadow-slate-950/50 backdrop-blur">
                <div className="rounded-[1.7rem] bg-[#eaf7d7] p-5 text-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1600&q=80"
                    className="h-64 w-full rounded-[1.4rem] object-cover"
                    alt=""
                  />
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {[
                      ["Today", "Open"],
                      ["Court", "03"],
                      ["Status", "Live"],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-emerald-900/10 bg-white p-3 text-center">
                        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                          {label}
                        </div>
                        <div className="mt-2 text-lg font-black text-slate-900">
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12">
          <div className="mb-8 text-center">
            <div className="text-xs font-black uppercase tracking-[0.26em] text-emerald-700">
              Court booking
            </div>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.03em] text-slate-950">
              Reserve your court
            </h2>
          </div>

          <form
            onSubmit={submit}
            className="rounded-4xl border border-emerald-900/10 bg-white p-6 shadow-sm shadow-emerald-900/10"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-black uppercase tracking-[0.2em] text-slate-700">
                Your name
                <input
                  name="customer"
                  required
                  minLength={2}
                  className="mt-2 w-full rounded-2xl border border-emerald-900/10 bg-[#eef6ed] px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-emerald-700"
                />
              </label>

              <label className="text-sm font-black uppercase tracking-[0.2em] text-slate-700">
                Email for confirmation
                <input
                  name="email"
                  required
                  type="email"
                  className="mt-2 w-full rounded-2xl border border-emerald-900/10 bg-[#eef6ed] px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-emerald-700"
                />
              </label>

              <label className="text-sm font-black uppercase tracking-[0.2em] text-slate-700">
                Service
                <select
                  name="service"
                  required
                  className="mt-2 w-full rounded-2xl border border-emerald-900/10 bg-[#eef6ed] px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-emerald-700"
                >
                  {(data?.services ?? []).map((service) => (
                    <option key={service.id} value={service.name}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-black uppercase tracking-[0.2em] text-slate-700">
                Staff
                <input
                  name="staff"
                  required
                  defaultValue="Maria"
                  className="mt-2 w-full rounded-2xl border border-emerald-900/10 bg-[#eef6ed] px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-emerald-700"
                />
              </label>

              <label className="text-sm font-black uppercase tracking-[0.2em] text-slate-700">
                Payment method
                <select
                  name="paymentMethod"
                  defaultValue="PayPal"
                  className="mt-2 w-full rounded-2xl border border-emerald-900/10 bg-[#eef6ed] px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-emerald-700"
                >
                  <option>Cash</option>
                  <option>Card</option>
                  <option>GCash</option>
                  <option>Bank transfer</option>
                  <option>PayPal</option>
                </select>
              </label>

              <label className="text-sm font-black uppercase tracking-[0.2em] text-slate-700">
                Payment
                <select
                  name="payment"
                  className="mt-2 w-full rounded-2xl border border-emerald-900/10 bg-[#eef6ed] px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-emerald-700"
                >
                  <option>Unpaid</option>
                  <option>Deposit</option>
                  <option>Paid</option>
                </select>
              </label>
            </div>

            <div className="mt-6 rounded-4xl border border-emerald-900/10 bg-[#eef6ed] p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-700">
                  Choose date
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-slate-500 shadow-sm">
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
                      className={`min-w-24 rounded-2xl border px-3 py-2.5 text-center transition ${
                        isActive
                          ? "border-emerald-950 bg-emerald-950 text-lime-300 shadow-sm"
                          : "border-emerald-900/10 bg-white text-slate-700 hover:border-emerald-950 hover:bg-lime-50"
                      } ${booked ? "cursor-not-allowed opacity-45" : ""}`}
                    >
                      <span className="block text-[10px] font-black uppercase tracking-wide">
                        {display.split(",")[0]}
                      </span>
                      <span className="mt-1 block text-xs font-black">
                        {display.split(",")[1] ?? display}
                      </span>
                    </button>
                  );
                })}
              </div>
              <input type="hidden" name="date" value={selectedDate} required />
            </div>

            <div className="mt-6 rounded-4xl border border-emerald-900/10 bg-[#eef6ed] p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-700">
                  Choose court and time
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-slate-500 shadow-sm">
                  {selectedCourt} • {selectedTime ? selectedTime : "No slot"}
                </span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {courtNames.map((court) => (
                  <div
                    key={court}
                    className="rounded-3xl border border-emerald-900/10 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">
                        {court}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedCourt(court)}
                        className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] transition ${
                          selectedCourt === court
                            ? "bg-emerald-950 text-lime-300"
                            : "border border-emerald-900/20 bg-white text-slate-700 hover:bg-lime-50"
                        }`}
                      >
                        {selectedCourt === court ? "Selected" : "Select"}
                      </button>
                    </div>

                    <div className="mt-4 space-y-2">
                      {allSlots.map((slot) => {
                        const isBooked = (data?.bookings ?? []).some(
                          (entry) =>
                            entry.date === selectedDate &&
                            entry.time === slot &&
                            entry.court === court,
                        );
                        const isActive = selectedCourt === court && selectedTime === slot;

                        return (
                          <button
                            key={`${court}-${slot}`}
                            type="button"
                            disabled={isBooked}
                            onClick={() => {
                              setSelectedCourt(court);
                              setSelectedTime(slot);
                            }}
                            className={`flex w-full items-center justify-center rounded-2xl border px-3 py-2 text-sm font-black transition ${
                              isActive
                                ? "border-emerald-950 bg-emerald-950 text-lime-300"
                                : "border-emerald-900/10 bg-[#eef6ed] text-slate-700 hover:border-emerald-950 hover:bg-lime-50"
                            } ${isBooked ? "cursor-not-allowed line-through opacity-45" : ""}`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <input type="hidden" name="court" value={selectedCourt} required />
              <input type="hidden" name="time" value={selectedTime} required />
            </div>

            {error && <p className="mt-4 text-sm font-bold text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={busy || !data}
              className="mt-6 w-full rounded-2xl bg-emerald-950 px-4 py-3 text-sm font-black uppercase tracking-[0.26em] text-lime-300 shadow-sm transition hover:bg-slate-950 disabled:opacity-50"
            >
              {busy ? "Booking…" : "Confirm booking"}
            </button>
          </form>
        </section>
      </main>

      <footer className="border-t border-emerald-900/10 bg-[#173f2d] text-emerald-50">
        <div className="mx-auto max-w-7xl px-5 py-10">
          <div className="flex flex-wrap items-center justify-between gap-10">
            <Link to="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-lime-300 bg-lime-300 text-sm font-black text-slate-950">
                PB
              </span>
              <span className="text-lg font-black tracking-tight text-white">
                PicklePark
              </span>
            </Link>

            <nav className="flex flex-wrap items-center gap-5 text-xs font-black uppercase tracking-[0.18em]">
              {[
                "Club",
                "Courts",
                "Programs",
                "Events",
                "Reviews",
                "About",
              ].map((link) => (
                <a key={link} href="#" className="transition hover:text-lime-300">
                  {link}
                </a>
              ))}
              <a href="#" className="transition hover:text-lime-300">
                Contact
              </a>
            </nav>

            <div className="flex items-center gap-3">
              {['Instagram', 'Facebook', 'LinkedIn'].map((label) => (
                <a key={label} href="#" className="inline-flex items-center justify-center">
                  <svg className="h-9 w-9 rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-lime-300 hover:text-slate-950" viewBox="0 0 24 24" fill="none" aria-label={label}>
                    {label === "Instagram" && <><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" /><circle cx="16.5" cy="7.5" r="1" fill="currentColor" /></>}
                    {label === "Facebook" && <path d="M14 8h3V4h-3c-3 0-5 2-5 5v2H7v4h2v6h4v-6h3l1-4h-4V9c0-.6.4-1 1-1Z" fill="currentColor" />}
                    {label === "LinkedIn" && <path d="M4 4h4v16H4zM10 4h4v3h.2c.7-1.3 2.3-2.6 4.8-2.6C20.4 4.4 21 7 21 9.2V20h-4v-18.8C17 10.2 16.7 10 16.2 10H14v10h-4z" fill="currentColor" />}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs font-black uppercase tracking-[0.2em] text-emerald-200">
            <span>© 2026 PicklePark</span>
            <span className="text-lime-300">Open play • Club courts • Leagues</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
