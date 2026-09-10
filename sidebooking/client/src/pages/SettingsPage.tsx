export function SettingsPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your studio profile and preferences.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="page-card p-5">
          <h2 className="text-lg font-semibold text-slate-900">Business Profile</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between"><span>Studio name</span><span className="font-medium text-slate-900">Maria Studio</span></div>
            <div className="flex items-center justify-between"><span>Booking page</span><span className="font-medium text-slate-900">/book/maria-studio</span></div>
            <div className="flex items-center justify-between"><span>Currency</span><span className="font-medium text-slate-900">PHP</span></div>
          </div>
        </section>

        <section className="page-card p-5">
          <h2 className="text-lg font-semibold text-slate-900">Preferences</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between"><span>Appointment reminders</span><span className="font-medium text-slate-900">Enabled</span></div>
            <div className="flex items-center justify-between"><span>Online booking</span><span className="font-medium text-slate-900">Enabled</span></div>
            <div className="flex items-center justify-between"><span>Timezone</span><span className="font-medium text-slate-900">Asia/Manila</span></div>
          </div>
        </section>
      </div>
    </div>
  );
}
