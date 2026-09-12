import { Link } from "react-router-dom";

function SocialIcon({ label }: { label: string }) {
  const common =
    "h-9 w-9 rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-lime-300 hover:text-slate-950";

  if (label === "Instagram") {
    return (
      <svg
        className={common}
        viewBox="0 0 24 24"
        fill="none"
        aria-label="Instagram"
      >
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="5"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
        <circle cx="16.5" cy="7.5" r="1" fill="currentColor" />
      </svg>
    );
  }

  if (label === "Facebook") {
    return (
      <svg
        className={common}
        viewBox="0 0 24 24"
        fill="none"
        aria-label="Facebook"
      >
        <path
          d="M14 8h3V4h-3c-3 0-5 2-5 5v2H7v4h2v6h4v-6h3l1-4h-4V9c0-.6.4-1 1-1Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg
      className={common}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="LinkedIn"
    >
      <path
        d="M4 4h4v16H4zM10 4h4v3h.2c.7-1.3 2.3-2.6 4.8-2.6C20.4 4.4 21 7 21 9.2V20h-4v-18.8C17 10.2 16.7 10 16.2 10H14v10h-4z"
        fill="currentColor"
      />
    </svg>
  );
}

export function HomePage() {
  const navLinks = ["Club", "Courts", "Programs", "Events", "Reviews", "About"];

  const whyBook = [
    {
      title: "Easy booking",
      copy: "Pick your court, time, and format in minutes.",
      icon: "01",
    },
    {
      title: "Great courts",
      copy: "Play on smooth, well-lit, club-ready courts.",
      icon: "02",
    },
    {
      title: "Flexible schedules",
      copy: "Choose open play, league nights, or private sessions.",
      icon: "03",
    },
    {
      title: "Instant confirmation",
      copy: "Get a booking-ready experience from start to finish.",
      icon: "04",
    },
  ];

  const steps = [
    {
      title: "Choose",
      copy: "Choose your court and preferred session time.",
      icon: "01",
    },
    {
      title: "Book",
      copy: "Confirm your preferred date and booking details.",
      icon: "02",
    },
    {
      title: "Play",
      copy: "Show up ready for your pickleball match.",
      icon: "03",
    },
  ];

  const courts = [
    {
      name: "Riverside Courts",
      location: "Downtown",
      copy: "A bright indoor court space with flexible day and evening play.",
      image:
        "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1600&q=80",
    },
    {
      name: "Northline Club",
      location: "East Ridge",
      copy: "A social club with leagues, open play, and private coaching sessions.",
      image:
        "https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?auto=format&fit=crop&w=1600&q=80",
    },
    {
      name: "Court Garden",
      location: "Green District",
      copy: "A relaxed outdoor court courtyard built for casual and team play.",
      image:
        "https://images.unsplash.com/photo-1599058917765-a7801dff89ea?auto=format&fit=crop&w=1600&q=80",
    },
  ];

  const reviews = [
    {
      name: "Avery Morgan",
      text: "Really simple to book a court and the club crew is always friendly.",
    },
    {
      name: "Chris Rivera",
      text: "The court quality is excellent and I love the open play evenings.",
    },
  ];

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
            {navLinks.map((item) => (
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

      <main>
        <section className="relative overflow-hidden border-b border-emerald-900/10 bg-[#183f2e] text-white">
          <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-lime-300/20 blur-3xl" />
          <div className="absolute left-0 top-16 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />

          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 md:grid-cols-[1fr,0.95fr] md:py-20">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-lime-300" />
                <span className="text-xs font-black uppercase tracking-[0.26em] text-lime-200">
                  Pickleball Club
                </span>
              </div>

              <h1 className="mt-6 text-5xl font-black leading-none tracking-[-0.045em] md:text-7xl">
                Rally up your next match.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-emerald-50">
                Book your court, join open play, and enjoy a friendly club built
                around pickleball energy and connection.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/book/maria-studio"
                  className="rounded-2xl bg-lime-300 px-7 py-3 text-sm font-black text-slate-950 shadow-sm transition hover:bg-lime-200"
                >
                  Book a Court
                </Link>
                <a
                  href="#booking"
                  className="rounded-2xl border border-white/30 px-7 py-3 text-sm font-black text-white transition hover:bg-white/10"
                >
                  Find a Court
                </a>
              </div>

              <div className="mt-9 flex flex-wrap gap-6">
                {[
                  ["28+", "Indoor Courts"],
                  ["02", "Training Nights"],
                  ["7d", "Weekly Play"],
                ].map(([number, label]) => (
                  <div key={label}>
                    <div className="text-3xl font-black text-white">
                      {number}
                    </div>
                    <div className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-200">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="relative">
              <div className="rounded-4xl border border-lime-300/30 bg-white/8 p-2 shadow-2xl shadow-slate-950/50 backdrop-blur">
                <div className="rounded-[1.7rem] bg-[#eaf7d7] p-5 text-slate-900">
                  <div className="overflow-hidden rounded-[1.4rem]">
                    <img
                      src="https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1600&q=80"
                      className="h-64 w-full object-cover"
                      alt=""
                    />
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {[
                      ["Booked", "08"],
                      ["Open", "12"],
                      ["Players", "66"],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-emerald-900/10 bg-white p-3 text-center"
                      >
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

        <section className="mx-auto max-w-7xl px-5 py-16">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.26em] text-emerald-700">
                Why Book With Us
              </div>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.03em] text-slate-950">
                Book your next pickleball session.
              </h2>
            </div>
            <span className="rounded-full border border-emerald-900/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-700">
              Play easy • Play fast
            </span>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-[0.88fr,1.12fr]">
            <div className="rounded-4xl border border-emerald-900/10 bg-white p-8 shadow-sm">
              <div className="grid gap-4">
                {whyBook.map((feature) => (
                  <article
                    key={feature.title}
                    className="flex items-start gap-4 rounded-2xl border border-emerald-900/10 bg-[#eef6ed] p-4"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-950 text-xs font-black text-lime-300">
                      {feature.icon}
                    </span>
                    <div>
                      <div className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">
                        {feature.title}
                      </div>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        {feature.copy}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className="overflow-hidden rounded-4xl border border-emerald-900/10 bg-white shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1599058917765-a7801dff89ea?auto=format&fit=crop&w=1600&q=80"
                className="h-full min-h-105 w-full object-cover"
                alt=""
              />
            </div>
          </div>
        </section>

        <section className="bg-[#183f2e] py-16 text-white">
          <div className="mx-auto max-w-7xl px-5">
            <div className="mb-8">
              <div className="text-xs font-black uppercase tracking-[0.26em] text-lime-300">
                How It Works
              </div>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.03em]">
                Choose → Book → Play
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((step) => (
                <article
                  key={step.title}
                  className="rounded-3xl border border-white/10 bg-white/8 p-7"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-300 text-sm font-black text-slate-950">
                    {step.icon}
                  </span>
                  <div className="mt-6 text-2xl font-black text-white">
                    {step.title}
                  </div>
                  <p className="mt-3 text-sm leading-8 text-emerald-50">
                    {step.copy}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.26em] text-emerald-700">
                Featured Courts
              </div>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.03em] text-slate-950">
                Find your court community.
              </h2>
            </div>
            <Link
              to="/book/maria-studio"
              className="rounded-2xl border border-emerald-900/20 bg-white px-6 py-3 text-sm font-black text-slate-900 transition hover:bg-emerald-950 hover:text-white"
            >
              Find a Court
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {courts.map((court) => (
              <article
                key={court.name}
                className="overflow-hidden rounded-4xl border border-emerald-900/10 bg-white shadow-sm"
              >
                <img
                  src={court.image}
                  alt=""
                  className="h-56 w-full object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-black text-slate-950">
                      {court.name}
                    </div>
                    <span className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] bg-lime-100 text-emerald-700">
                      {court.location}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {court.copy}
                  </p>
                  <Link
                    to="/book/maria-studio"
                    className="mt-5 inline-flex rounded-2xl border border-emerald-900/20 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 transition hover:bg-emerald-950 hover:text-white"
                  >
                    View Court
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-5 py-16">
            <div className="grid gap-8 md:grid-cols-[0.95fr,1.05fr]">
              <div className="rounded-4xl border border-emerald-900/10 bg-[#eef6ed] p-8">
                <div className="text-xs font-black uppercase tracking-[0.26em] text-emerald-700">
                  Social proof
                </div>
                <h2 className="mt-4 text-4xl font-black tracking-[-0.03em] text-slate-950">
                  Players love the energy.
                </h2>
                <div className="mt-8 space-y-4">
                  {reviews.map((review) => (
                    <article
                      key={review.name}
                      className="rounded-2xl bg-white p-5"
                    >
                      <div className="flex items-center gap-1 text-lime-600">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <svg
                            key={index}
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 2l3 7 7 .8-5 5 1.5 7-5.5-3-5.5 3 1.5-7-5-5 7-.8z" />
                          </svg>
                        ))}
                      </div>
                      <p className="mt-4 text-sm leading-7 text-slate-600">
                        “{review.text}”
                      </p>
                      <div className="mt-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        {review.name}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
              <div className="overflow-hidden rounded-4xl border border-emerald-900/10">
                <img
                  src="https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1600&q=80"
                  className="h-full min-h-110 w-full object-cover"
                  alt=""
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#173f2d] py-16 text-white">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 md:grid-cols-[1fr,0.95fr]">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.26em] text-lime-300">
                Join the Club
              </div>
              <h2 className="mt-4 text-5xl font-black leading-none tracking-[-0.04em]">
                Your next court is waiting.
              </h2>
              <p className="mt-5 max-w-xl text-emerald-50 leading-8">
                Reserve your time, meet your playing group, and build a
                consistent pickleball routine with a club that runs well.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/book/maria-studio"
                  className="rounded-2xl bg-lime-300 px-7 py-3 text-sm font-black text-slate-950 transition hover:bg-lime-200"
                >
                  Book Your Court
                </Link>
                <a
                  href="#booking"
                  className="rounded-2xl border border-white/30 px-7 py-3 text-sm font-black text-white transition hover:bg-white/10"
                >
                  Find a Court
                </a>
              </div>
            </div>
            <div className="overflow-hidden rounded-4xl border border-lime-300/30">
              <img
                src="https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?auto=format&fit=crop&w=1600&q=80"
                className="h-105 w-full object-cover"
                alt=""
              />
            </div>
          </div>
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
              {navLinks.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="transition hover:text-lime-300"
                >
                  {link}
                </a>
              ))}
              <a href="#" className="transition hover:text-lime-300">
                About us
              </a>
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
                  <SocialIcon label={label} />
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
