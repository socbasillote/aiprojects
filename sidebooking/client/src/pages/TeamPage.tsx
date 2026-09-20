import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "staff";
};

export function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function loadTeam() {
      try {
        const data = await apiRequest<{ users: TeamMember[] }>("/team/");
        setTeam(data.users ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load team");
      }
    }
    void loadTeam();
  }, []);

  async function addStaff(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      await apiRequest<{ user: TeamMember }>("/team/", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      setShowForm(false);
      event.currentTarget.reset();
      const data = await apiRequest<{ users: TeamMember[] }>("/team/");
      setTeam(data.users ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add staff");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Team
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Add Staff
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={addStaff}
          className="page-card grid gap-3 p-5 md:grid-cols-3"
        >
          <input
            name="name"
            required
            minLength={2}
            placeholder="Full name"
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
          />
          <input
            name="email"
            required
            type="email"
            placeholder="Email address"
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
          />
          <div className="flex gap-2">
            <input
              name="password"
              required
              minLength={8}
              type="password"
              placeholder="Temporary password"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
            />
            <button
              disabled={busy}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {busy ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {team.map((member) => (
          <div key={member.id} className="page-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                {member.name.slice(0, 1)}
              </div>
              <div>
                <div className="font-semibold text-slate-900">
                  {member.name}
                </div>
                <div className="text-sm text-slate-500">{member.role}</div>
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-600">{member.email}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
