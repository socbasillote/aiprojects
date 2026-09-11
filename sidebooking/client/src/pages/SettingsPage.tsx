import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

type BusinessSettings = {
  business: {
    id?: string;
    name: string;
    slug: string;
    description?: string;
    openHour?: string;
    closeHour?: string;
    slotsPerHour?: number;
  } | null;
};

export function SettingsPage() {
  const [business, setBusiness] = useState<BusinessSettings["business"] | null>(
    null,
  );
  const [openHour, setOpenHour] = useState("08:00");
  const [closeHour, setCloseHour] = useState("20:00");
  const [slotsPerHour, setSlotsPerHour] = useState(2);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await apiRequest<BusinessSettings>("/business/");
        const saved = data.business;
        if (saved) {
          setBusiness(saved);
          setOpenHour(saved.openHour ?? "08:00");
          setCloseHour(saved.closeHour ?? "20:00");
          setSlotsPerHour(saved.slotsPerHour ?? 2);
        }
      } catch (err) {
        setStatus(
          err instanceof Error ? err.message : "Unable to load settings",
        );
      }
    }
    void loadSettings();
  }, []);

  async function saveBusinessHours(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setStatus("");

    try {
      const payload = {
        name: business?.name ?? "Maria Studio",
        slug: business?.slug ?? "maria-studio",
        description: business?.description ?? "",
        openHour,
        closeHour,
        slotsPerHour,
        settings: {
          booking: {
            slotsPerHour,
          },
        },
      };

      await apiRequest<{ business: BusinessSettings["business"] }>(
        "/business/",
        {
          method: "PUT",
          body: JSON.stringify(payload),
        },
      );

      setStatus("Business hours updated");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Unable to update hours");
    } finally {
      setBusy(false);
    }
  }

  const categories = [
    {
      section: "Booking",
      items: [
        "Booking Types",
        "Booking Statuses",
        "Confirmation Rules",
        "Cancellation Rules",
        "Rescheduling Rules",
      ],
    },
    {
      section: "Payments",
      items: [
        "Payment Types",
        "Payment Statuses",
        "Deposit Rules",
        "Payment Due Dates",
        "Refund Rules",
      ],
    },
    {
      section: "Notifications",
      items: [
        "Booking Confirmation",
        "Payment Reminders",
        "Booking Reminders",
        "Cancellation",
        "Follow-ups",
      ],
    },
    {
      section: "Automation",
      items: [
        "Auto-confirm",
        "Auto-cancel",
        "Payment Overdue",
        "No-show",
        "Follow-up",
      ],
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your studio profile and preferences.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="page-card p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Business Profile
          </h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Studio name</span>
              <span className="font-medium text-slate-900">
                {business?.name ?? "Maria Studio"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Booking page</span>
              <span className="font-medium text-slate-900">
                /book/{business?.slug ?? "maria-studio"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Currency</span>
              <span className="font-medium text-slate-900">PHP</span>
            </div>
          </div>
        </section>

        <section className="page-card p-5">
          <h2 className="text-lg font-semibold text-slate-900">Preferences</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Appointment reminders</span>
              <span className="font-medium text-slate-900">Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Online booking</span>
              <span className="font-medium text-slate-900">Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Timezone</span>
              <span className="font-medium text-slate-900">Asia/Manila</span>
            </div>
          </div>
        </section>
      </div>

      <section className="page-card p-5">
        <h2 className="text-lg font-semibold text-slate-900">Opening Hours</h2>
        <form
          onSubmit={saveBusinessHours}
          className="mt-4 grid gap-4 md:grid-cols-4"
        >
          <label className="text-sm font-medium text-slate-700">
            Open
            <input
              type="time"
              step="1800"
              value={openHour}
              onChange={(event) => setOpenHour(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Close
            <input
              type="time"
              step="1800"
              value={closeHour}
              onChange={(event) => setCloseHour(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Slots / hour
            <select
              value={slotsPerHour}
              onChange={(event) => setSlotsPerHour(Number(event.target.value))}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"
            >
              <option value={1}>1 slot</option>
              <option value={2}>2 slots</option>
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {busy ? "Saving..." : "Save hours"}
            </button>
          </div>
        </form>
        {status && <p className="mt-3 text-sm text-slate-600">{status}</p>}
      </section>

      <section className="page-card p-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Automation Center
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {categories.map((category) => (
            <div
              key={category.section}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wide text-slate-900">
                  {category.section}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                  {category.items.length}
                </span>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                {category.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                  >
                    <span>{item}</span>
                    <span className="h-2 w-2 rounded-full bg-slate-300" />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
