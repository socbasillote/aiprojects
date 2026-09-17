import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../lib/api";
import HeaderComponent from "./HomeComponent/HeaderComponent";

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

type ChosenSlot = {
  date: string;
  court: string;
  time: string;
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
  const [selectedCourt, setSelectedCourt] = useState<string>("Court 1");
  const [selectedSlots, setSelectedSlots] = useState<ChosenSlot[]>([]);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [courtPage, setCourtPage] = useState(0);
  const dateScrollerRef = useRef<HTMLDivElement | null>(null);
  const dragStartX = useRef<number | null>(null);
  const dragStartScrollLeft = useRef(0);
  const dragThreshold = 8;
  const isDraggingDatesRef = useRef(false);

  const courtsCount = Math.max(1, Number(data?.business?.courtsCount ?? 3));
  const courtNames = Array.from(
    { length: courtsCount },
    (_, index) => `Court ${index + 1}`,
  );

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
    setSelectedSlots([]);
    setSelectedCourt("Court 1");
  }

  useEffect(() => {
    apiRequest<BusinessData>(`/public/${slug}`)
      .then((payload) => {
        setData(payload);
        const firstAvailable =
          getDateOptions(45)[0] ?? dateKeyFromDate(new Date());
        setSelectedDate(firstAvailable);
        setSelectedCourt("Court 1");
        setSelectedSlots([]);
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
      if (!selectedDate || !date) {
        throw new Error("Choose a booking date first.");
      }
      if (selectedSlots.length === 0) {
        throw new Error("Choose at least one time slot.");
      }

      selectedSlots.forEach((slot) => {
        if (!isValidBookingTime(slot.time)) {
          throw new Error(
            "Choose booking times in 30-minute steps, such as 09:00 or 09:30.",
          );
        }
      });

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
        slots: selectedSlots.map((slot) => ({
          court: slot.court,
          time: slot.time,
        })),
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
            Code:{" "}
            <strong className="text-slate-950">
              {confirmation.booking.confirmationCode}
            </strong>
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
      <HeaderComponent />

      <main className="bg-[#eef6ed]">
        <section className="mx-auto max-w-6xl px-5 py-12">
          <div className="mb-8 text-center">
            <div className="text-xs font-black uppercase tracking-[0.26em] text-emerald-700">
              Court booking
            </div>

            <h2 className="mt-3 text-4xl font-black tracking-[-0.03em] text-slate-950">
              Reserve your court
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm font-medium text-slate-500">
              Pick your date and time first, then choose an available court.
            </p>
          </div>

          <form
            onSubmit={submit}
            className="overflow-hidden rounded-[2rem] border border-emerald-900/10 bg-white shadow-sm shadow-emerald-900/10"
          >
            {/* =========================================================
        STEP 1 — DATE
    ========================================================= */}
            <div className="border-b border-emerald-900/10 p-5 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-950 text-sm font-black text-lime-300">
                  1
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
                        Step 1
                      </p>
                      <h3 className="mt-1 text-xl font-black text-slate-950">
                        Choose your date
                      </h3>
                    </div>

                    {selectedDate && (
                      <span className="rounded-full bg-emerald-950 px-4 py-2 text-xs font-black text-lime-300">
                        {new Date(
                          `${selectedDate}T00:00:00`,
                        ).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>

                  <div
                    ref={dateScrollerRef}
                    onPointerDown={(
                      event: React.PointerEvent<HTMLDivElement>,
                    ) => {
                      const target = event.target as HTMLElement | null;
                      if (target?.closest("button")) return;

                      const el = dateScrollerRef.current;
                      if (!el) return;

                      dragStartX.current = event.clientX;
                      dragStartScrollLeft.current = el.scrollLeft;
                      isDraggingDatesRef.current = false;
                      el.setPointerCapture(event.pointerId);
                      el.style.cursor = "grabbing";
                    }}
                    onPointerMove={(event) => {
                      if (dragStartX.current === null) return;

                      const el = dateScrollerRef.current;
                      if (!el) return;

                      const delta = event.clientX - dragStartX.current;
                      if (Math.abs(delta) > dragThreshold) {
                        isDraggingDatesRef.current = true;
                        el.scrollLeft = dragStartScrollLeft.current - delta;
                      }
                    }}
                    onPointerUp={() => {
                      dragStartX.current = null;
                      isDraggingDatesRef.current = false;
                      if (dateScrollerRef.current) {
                        dateScrollerRef.current.style.cursor = "grab";
                      }
                    }}
                    onPointerLeave={() => {
                      dragStartX.current = null;
                      isDraggingDatesRef.current = false;
                      if (dateScrollerRef.current) {
                        dateScrollerRef.current.style.cursor = "grab";
                      }
                    }}
                    onPointerCancel={() => {
                      dragStartX.current = null;
                      isDraggingDatesRef.current = false;
                      if (dateScrollerRef.current) {
                        dateScrollerRef.current.style.cursor = "grab";
                      }
                    }}
                    className="mt-5 flex cursor-grab gap-2 overflow-x-auto pb-2 scroll-smooth"
                  >
                    {getDateOptions(45).map((date) => {
                      const booked = isDateFullyBooked(date);
                      const isActive = selectedDate === date;

                      const display = new Date(
                        `${date}T00:00:00`,
                      ).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      });

                      const [weekday, monthDay] = display.split(",");

                      return (
                        <button
                          key={date}
                          type="button"
                          disabled={booked}
                          onClick={() => chooseDate(date)}
                          className={`min-w-[110px] shrink-0 rounded-2xl border px-3 py-3 text-center transition ${
                            isActive
                              ? "border-emerald-950 bg-emerald-950 text-lime-300 shadow-md"
                              : "border-emerald-900/10 bg-[#eef6ed] text-slate-700 hover:border-emerald-950 hover:bg-lime-50"
                          } ${booked ? "cursor-not-allowed opacity-35" : ""}`}
                        >
                          <span className="block text-[10px] font-black uppercase tracking-wider">
                            {weekday}
                          </span>

                          <span className="mt-1 block text-sm font-black">
                            {monthDay}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <input
                    type="hidden"
                    name="date"
                    value={selectedDate}
                    required
                  />
                </div>
              </div>
            </div>

            {/* =========================================================
        STEP 3 — COURTS
    ========================================================= */}
            <div
              className={`border-b border-emerald-900/10 p-5 sm:p-7 ${
                !selectedDate ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                    selectedDate
                      ? "bg-emerald-950 text-lime-300"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  2
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
                        Step 2
                      </p>

                      <h3 className="mt-1 text-xl font-black text-slate-950">
                        Choose your court and time
                      </h3>
                    </div>

                    <span className="rounded-full bg-[#eef6ed] px-4 py-2 text-xs font-black text-slate-600">
                      {courtNames.length} courts
                    </span>
                  </div>

                  {!selectedDate ? (
                    <div className="mt-5 rounded-2xl border border-dashed border-emerald-900/15 bg-[#eef6ed] px-4 py-5 text-center">
                      <p className="text-sm font-bold text-slate-500">
                        Select a date first.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* 
                Replace these with state:
                const [courtPage, setCourtPage] = useState(0)
              */}
                      {(() => {
                        const courtsPerPage = 4;
                        const totalPages = Math.ceil(
                          courtNames.length / courtsPerPage,
                        );

                        const currentPage = Math.min(
                          courtPage,
                          Math.max(0, totalPages - 1),
                        );

                        const visibleCourts = courtNames.slice(
                          currentPage * courtsPerPage,
                          currentPage * courtsPerPage + courtsPerPage,
                        );

                        return (
                          <>
                            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                              {visibleCourts.map((court) => {
                                const isSelected = selectedCourt === court;

                                return (
                                  <div
                                    key={court}
                                    className={`rounded-3xl border p-4 transition ${
                                      isSelected
                                        ? "border-emerald-950 bg-emerald-950 shadow-md"
                                        : "border-emerald-900/10 bg-[#eef6ed]"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <div>
                                        <p
                                          className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                                            isSelected
                                              ? "text-lime-300"
                                              : "text-emerald-700"
                                          }`}
                                        >
                                          Court
                                        </p>

                                        <h4
                                          className={`mt-1 text-lg font-black ${
                                            isSelected
                                              ? "text-white"
                                              : "text-slate-950"
                                          }`}
                                        >
                                          {court}
                                        </h4>
                                      </div>

                                      {isSelected && (
                                        <div className="rounded-full bg-lime-300 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-950">
                                          Selected
                                        </div>
                                      )}
                                    </div>

                                    <div className="mt-4 space-y-2">
                                      {allSlots.map((slot) => {
                                        const isBooked = (
                                          data?.bookings ?? []
                                        ).some(
                                          (entry) =>
                                            entry.date === selectedDate &&
                                            entry.time === slot &&
                                            entry.court === court,
                                        );

                                        const exists = selectedSlots.some(
                                          (entry) =>
                                            entry.date === selectedDate &&
                                            entry.court === court &&
                                            entry.time === slot,
                                        );

                                        return (
                                          <button
                                            key={`${court}-${slot}`}
                                            type="button"
                                            disabled={isBooked}
                                            onClick={() => {
                                              setSelectedCourt(court);

                                              const nextSlot = {
                                                date: selectedDate,
                                                court,
                                                time: slot,
                                              };

                                              setSelectedSlots((current) => {
                                                const found = current.some(
                                                  (entry) =>
                                                    entry.date ===
                                                      selectedDate &&
                                                    entry.court === court &&
                                                    entry.time === slot,
                                                );

                                                if (found) {
                                                  return current.filter(
                                                    (entry) =>
                                                      !(
                                                        entry.date ===
                                                          selectedDate &&
                                                        entry.court === court &&
                                                        entry.time === slot
                                                      ),
                                                  );
                                                }

                                                return [...current, nextSlot];
                                              });
                                            }}
                                            className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-black transition ${
                                              exists
                                                ? "border-lime-300 bg-lime-300 text-emerald-950"
                                                : isSelected
                                                  ? "border-white/10 bg-white/10 text-white hover:bg-white/20"
                                                  : "border-emerald-900/10 bg-white text-slate-700 hover:border-emerald-950 hover:bg-lime-50"
                                            } ${
                                              isBooked
                                                ? "cursor-not-allowed opacity-35 line-through"
                                                : ""
                                            }`}
                                          >
                                            <span>{slot}</span>

                                            <span className="text-[9px] uppercase tracking-wider opacity-60">
                                              {isBooked
                                                ? "Booked"
                                                : exists
                                                  ? "Added"
                                                  : "Available"}
                                            </span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Pagination only when 5+ courts */}
                            {courtNames.length >= 5 && (
                              <div className="mt-5 flex items-center justify-between border-t border-emerald-900/10 pt-4">
                                <button
                                  type="button"
                                  disabled={currentPage === 0}
                                  onClick={() =>
                                    setCourtPage((page) =>
                                      Math.max(0, page - 1),
                                    )
                                  }
                                  className="rounded-xl border border-emerald-900/10 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-700 transition hover:bg-lime-50 disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                  ← Previous
                                </button>

                                <div className="flex items-center gap-2">
                                  {Array.from(
                                    { length: totalPages },
                                    (_, index) => (
                                      <button
                                        key={index}
                                        type="button"
                                        onClick={() => setCourtPage(index)}
                                        className={`h-8 min-w-8 rounded-full px-2 text-xs font-black transition ${
                                          currentPage === index
                                            ? "bg-emerald-950 text-lime-300"
                                            : "bg-[#eef6ed] text-slate-600 hover:bg-lime-50"
                                        }`}
                                      >
                                        {index + 1}
                                      </button>
                                    ),
                                  )}
                                </div>

                                <button
                                  type="button"
                                  disabled={currentPage === totalPages - 1}
                                  onClick={() =>
                                    setCourtPage((page) =>
                                      Math.min(totalPages - 1, page + 1),
                                    )
                                  }
                                  className="rounded-xl border border-emerald-900/10 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-700 transition hover:bg-lime-50 disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                  Next →
                                </button>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </>
                  )}

                  <input
                    type="hidden"
                    name="court"
                    value={selectedCourt}
                    required
                  />
                </div>
              </div>
            </div>

            {/* =========================================================
        STEP 4 — CUSTOMER DETAILS
    ========================================================= */}
            <div className="border-b border-emerald-900/10 p-5 sm:p-7">
              <div className="mb-5 flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-950 text-sm font-black text-lime-300">
                  3
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
                    Step 3
                  </p>

                  <h3 className="mt-1 text-xl font-black text-slate-950">
                    Your booking details
                  </h3>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Tell us who the booking is for.
                  </p>
                </div>
              </div>

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
            </div>

            {/* =========================================================
        SUMMARY
    ========================================================= */}
            <div className="bg-[#eef6ed] p-5 sm:p-7">
              <div className="rounded-3xl border border-emerald-900/10 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
                      Booking summary
                    </p>

                    <h3 className="mt-2 text-xl font-black text-slate-950">
                      {selectedDate
                        ? new Date(
                            `${selectedDate}T00:00:00`,
                          ).toLocaleDateString(undefined, {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })
                        : "Choose a date"}
                    </h3>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Selected
                    </p>

                    <p className="mt-1 text-sm font-black text-slate-950">
                      {selectedSlots.length} slot
                      {selectedSlots.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                {selectedSlots.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedSlots.map((entry) => (
                      <span
                        key={`${entry.date}-${entry.court}-${entry.time}`}
                        className="rounded-full bg-emerald-950 px-3 py-1.5 text-xs font-black text-lime-300"
                      >
                        {entry.court} · {entry.time}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <p className="mt-4 text-sm font-bold text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={
                  busy || !data || !selectedDate || selectedSlots.length === 0
                }
                className="mt-5 w-full rounded-2xl bg-emerald-950 px-4 py-4 text-sm font-black uppercase tracking-[0.26em] text-lime-300 shadow-sm transition hover:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy ? "Booking…" : "Confirm booking"}
              </button>
            </div>
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
              {["Club", "Courts", "Programs", "Events", "Reviews", "About"].map(
                (link) => (
                  <a
                    key={link}
                    href="#"
                    className="transition hover:text-lime-300"
                  >
                    {link}
                  </a>
                ),
              )}
              <a href="#" className="transition hover:text-lime-300">
                Contact
              </a>
            </nav>

            <div className="flex items-center gap-3">
              {["Instagram", "Facebook", "LinkedIn"].map((label) => (
                <a
                  key={label}
                  href="#"
                  className="inline-flex items-center justify-center"
                >
                  <svg
                    className="h-9 w-9 rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-lime-300 hover:text-slate-950"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-label={label}
                  >
                    {label === "Instagram" && (
                      <>
                        <rect
                          x="3"
                          y="3"
                          width="18"
                          height="18"
                          rx="5"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="4"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <circle cx="16.5" cy="7.5" r="1" fill="currentColor" />
                      </>
                    )}
                    {label === "Facebook" && (
                      <path
                        d="M14 8h3V4h-3c-3 0-5 2-5 5v2H7v4h2v6h4v-6h3l1-4h-4V9c0-.6.4-1 1-1Z"
                        fill="currentColor"
                      />
                    )}
                    {label === "LinkedIn" && (
                      <path
                        d="M4 4h4v16H4zM10 4h4v3h.2c.7-1.3 2.3-2.6 4.8-2.6C20.4 4.4 21 7 21 9.2V20h-4v-18.8C17 10.2 16.7 10 16.2 10H14v10h-4z"
                        fill="currentColor"
                      />
                    )}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs font-black uppercase tracking-[0.2em] text-emerald-200">
            <span>© 2026 PicklePark</span>
            <span className="text-lime-300">
              Open play • Club courts • Leagues
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
