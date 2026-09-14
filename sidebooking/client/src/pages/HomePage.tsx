import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import pickleballImage from "../assets/heropickle2.png";
import picklogo from "../assets/wesmontlogo3.png";

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const section = canvas.parentElement as HTMLElement | null;
    const court = section?.querySelector(".court") as HTMLDivElement | null;
    const context = canvas.getContext("2d");
    if (!section || !court || !context) {
      return undefined;
    }

    const resizeCanvas = () => {
      const rect = section.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(rect.width * ratio);
      canvas.height = Math.round(rect.height * ratio);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(ratio, ratio);
    };

    const getCourtRoutes = () => {
      const sectionRect = section.getBoundingClientRect();
      const courtRect = court.getBoundingClientRect();

      const left = courtRect.left - sectionRect.left;
      const right = courtRect.right - sectionRect.left;
      const top = courtRect.top - sectionRect.top;
      const bottom = courtRect.bottom - sectionRect.top;
      const centerX = courtRect.left - sectionRect.left + courtRect.width / 2;
      const centerY = courtRect.top - sectionRect.top + courtRect.height / 2;

      const routeA = [
        { x: centerX, y: centerY },
        { x: centerX, y: top },
        { x: right, y: top },
        { x: right, y: bottom },
        { x: centerX, y: bottom },
        { x: centerX, y: centerY },
      ];

      const routeB = [
        { x: centerX, y: centerY },
        { x: centerX, y: bottom },
        { x: left, y: bottom },
        { x: left, y: top },
        { x: centerX, y: top },
        { x: centerX, y: centerY },
      ];

      return { routeA, routeB };
    };

    const routeLength = (route: Array<{ x: number; y: number }>) => {
      let total = 0;
      for (let i = 1; i < route.length; i += 1) {
        total += Math.sqrt(
          (route[i].x - route[i - 1].x) ** 2 +
            (route[i].y - route[i - 1].y) ** 2,
        );
      }
      return total;
    };

    const distanceBetween = (
      from: { x: number; y: number },
      to: { x: number; y: number },
    ) => Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2);

    const pointOnSegment = (
      from: { x: number; y: number },
      to: { x: number; y: number },
      t: number,
    ) => ({
      x: from.x + (to.x - from.x) * clamp(t, 0, 1),
      y: from.y + (to.y - from.y) * clamp(t, 0, 1),
    });

    const clamp = (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), max);

    const colorToRgba = (hex: string, alpha: number) => {
      const value = hex.replace("#", "");
      const bigint = Number.parseInt(
        value.length === 3
          ? value
              .split("")
              .map((c) => c + c)
              .join("")
          : value,
        16,
      );
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const drawRoute = (
      route: Array<{ x: number; y: number }>,
      travelled: number,
      color: string,
    ) => {
      const routeTrack = routeLength(route);
      const highlightLength = routeTrack * 1;
      const start = Math.max(0, travelled - highlightLength);
      const end = Math.min(routeTrack, travelled);

      const segments: Array<{
        from: { x: number; y: number };
        to: { x: number; y: number };
        alpha: number;
      }> = [];
      let cursor = 0;

      for (let i = 1; i < route.length; i += 1) {
        const from = route[i - 1];
        const to = route[i];
        const len = distanceBetween(from, to);
        const segStart = cursor;
        const segEnd = cursor + len;

        if (segEnd < start || segStart > end) {
          cursor = segEnd;
          continue;
        }

        const overlapLeft = Math.max(segStart, start);
        const overlapRight = Math.min(segEnd, end);

        if (overlapLeft >= overlapRight) {
          cursor = segEnd;
          continue;
        }

        const tLeft = clamp(
          (overlapLeft - segStart) / Math.max(len, 0.0001),
          0,
          1,
        );
        const tRight = clamp(
          (overlapRight - segStart) / Math.max(len, 0.0001),
          0,
          1,
        );
        const edgeFrom = pointOnSegment(from, to, tLeft);
        const edgeTo = pointOnSegment(from, to, tRight);

        const alpha = clamp(
          ((overlapRight - start) / Math.max(highlightLength, 0.0001)) * 0.5,
          0,
          1,
        );

        segments.push({ from: edgeFrom, to: edgeTo, alpha });
        cursor = segEnd;
      }

      context.save();
      context.lineCap = "round";
      context.lineJoin = "round";
      context.shadowColor = color;
      context.shadowBlur = 8;
      context.lineWidth = 4;

      for (const seg of segments) {
        context.strokeStyle = colorToRgba(color, clamp(seg.alpha, 0, 1));
        context.beginPath();
        context.moveTo(seg.from.x, seg.from.y);
        context.lineTo(seg.to.x, seg.to.y);
        context.stroke();
      }

      context.restore();
    };

    resizeCanvas();

    const start = performance.now();
    const cycle = 5000;

    const animate = (now: number) => {
      const routeData = getCourtRoutes();
      const routeALength = routeLength(routeData.routeA);
      const routeBLength = routeLength(routeData.routeB);
      const cyclePosition = ((now - start) % cycle) / cycle;

      context.clearRect(0, 0, canvas.width, canvas.height);

      const distanceA = cyclePosition * routeALength;
      const distanceB = cyclePosition * routeBLength;

      drawRoute(routeData.routeA, distanceA, "#dfffd9");
      drawRoute(routeData.routeB, distanceB, "#d2ffe4");

      window.requestAnimationFrame(animate);
    };

    window.requestAnimationFrame(animate);
    window.addEventListener("resize", resizeCanvas);

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

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
            <img
              src={picklogo}
              alt="Logo"
              className="h-8 w-auto object-contain"
            />
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
        {/* HEADER + HERO = 100vh */}
        <section className="relative h-[calc(100vh-73px)] min-h-[600px] overflow-hidden border-b border-emerald-900/10 bg-[#183f2e] text-white">
          <canvas
            ref={canvasRef}
            className="court-canvas"
            aria-label="Pickleball court highlight path"
          />

          <div className="court" aria-hidden="true">
            <span className="kitchen-left" />
            <span className="kitchen-right" />
            <span className="service-left" />
            <span className="service-right" />
            <span className="center-line" />
          </div>

          <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-lime-300/20 blur-3xl" />
          <div className="absolute left-0 top-16 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />

          {/* HERO CONTENT */}
          <div className="relative mx-auto flex h-full max-w-7xl flex-col px-5 py-10 md:px-8 md:py-12">
            {/* TOP LEFT */}
            <div className="relative z-20 max-w-3xl">
              <span className="text-xs font-black uppercase tracking-[0.26em] text-lime-200">
                Pickleball Court
              </span>

              <h1 className="mt-6 text-left text-5xl font-black leading-[0.9] tracking-[-0.055em] md:text-7xl lg:text-8xl">
                Rally up your
                <br />
                next match.
              </h1>
            </div>

            {/* CENTER IMAGE */}
            <div className="group absolute left-1/2 top-1/2 z-10 w-[75%] max-w-3xl -translate-x-1/2 -translate-y-1/2 transition-[z-index] duration-300 hover:z-50 md:w-[60%] lg:w-[52%]">
              <img
                src={pickleballImage}
                alt="Pickleball court"
                className="h-auto w-full rounded-3xl transform transition-transform duration-500 ease-in-out group-hover:scale-110"
              />
            </div>

            {/* DESCRIPTION */}
            <p className="relative z-20 mt-auto max-w-xl pb-24 text-left text-lg leading-8 text-emerald-50 md:pb-20">
              Book your court, join open play, and enjoy a friendly club built
              around pickleball energy and connection.
            </p>

            {/* BOTTOM */}
            <div className="absolute bottom-8 left-5 right-5 z-30 flex items-end justify-between md:left-8 md:right-8">
              {/* CTA */}
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/book/maria-studio"
                  className="hero-button rounded-2xl bg-lime-300 px-7 py-3 text-sm font-black text-slate-950 shadow-sm transition hover:bg-lime-200"
                >
                  Book a Court
                </Link>

                <a
                  href="#booking"
                  className="hero-button rounded-2xl border border-white/30 px-7 py-3 text-sm font-black text-white transition hover:bg-white/10"
                >
                  Find a Court
                </a>
              </div>

              {/* DATA */}
              <div className="flex flex-wrap justify-end gap-x-10 gap-y-6 text-right">
                {[
                  ["3+", "Indoor Courts"],
                  ["24/7", "Open"],
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
          </div>
        </section>
        <section className="overflow-hidden bg-[#183f2e] py-6 text-white">
          <div className="flex w-max animate-[marquee_18s_linear_infinite]">
            {[1, 2, 3, 4].map((group) => (
              <div
                key={group}
                className="flex shrink-0 items-center gap-10 pr-10 whitespace-nowrap"
              >
                <span className="text-xl font-black uppercase tracking-wide">
                  BOOK NOW
                </span>

                <span className="text-xl font-black text-lime-300">✦</span>

                <span className="text-xl font-black uppercase tracking-wide">
                  ENJOY
                </span>

                <span className="text-xl font-black text-lime-300">✦</span>

                <span className="text-xl font-black uppercase tracking-wide">
                  SPECIAL PROMO
                </span>

                <span className="text-xl font-black text-lime-300">✦</span>

                <span className="text-xl font-black uppercase tracking-wide">
                  PLAY & SAVE
                </span>

                <span className="text-xl font-black text-lime-300">✦</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20">
          <div className="grid items-stretch gap-6 lg:grid-cols-[1.05fr,0.95fr]">
            {/* Left — Content */}
            <div className="flex flex-col justify-between rounded-[2.5rem] bg-[#eef6ed] p-8 md:p-10">
              <div>
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-lime-400" />
                  <div className="text-xs font-black uppercase tracking-[0.26em] text-emerald-800">
                    Why Book With Us
                  </div>
                </div>

                <h2 className="mt-5 max-w-xl text-4xl font-black leading-[0.95] tracking-[-0.04em] text-slate-950 md:text-5xl">
                  Your court.
                  <br />
                  Your game.
                  <br />
                  <span className="text-emerald-800">Your time.</span>
                </h2>

                <p className="mt-6 max-w-lg text-base leading-7 text-slate-600">
                  Everything you need for a great pickleball session — easy
                  booking, quality courts, convenient parking, and food and
                  drinks right where you play.
                </p>
              </div>

              {/* Features */}
              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {[
                  ...whyBook,
                  {
                    icon: "P",
                    title: "Easy Parking",
                    copy: "Convenient parking area available, so you can arrive, park, and get straight to the game.",
                  },
                  {
                    icon: "F",
                    title: "Food & Drinks",
                    copy: "Grab refreshing drinks and tasty food from our on-site store before or after your session.",
                  },
                ].map((feature, index) => (
                  <article
                    key={feature.title}
                    className="group rounded-2xl border border-emerald-900/10 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950 text-xs font-black text-lime-300">
                        {feature.icon}
                      </span>

                      <span className="text-xs font-black text-emerald-900/30">
                        0{index + 1}
                      </span>
                    </div>

                    <div className="mt-5 text-sm font-black uppercase tracking-[0.15em] text-slate-900">
                      {feature.title}
                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {feature.copy}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            {/* Right — Image */}
            <div className="group relative min-h-125 overflow-hidden rounded-[2.5rem] bg-emerald-950">
              <img
                src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1600&q=85"
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                alt="Pickleball court"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/10 to-transparent" />

              <div className="absolute left-6 top-6 rounded-full bg-white/95 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-950 backdrop-blur">
                Everything's here
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-7 md:p-9">
                <div className="text-xs font-black uppercase tracking-[0.22em] text-lime-300">
                  Play. Refresh. Repeat.
                </div>

                <h3 className="mt-3 max-w-md text-3xl font-black leading-tight tracking-[-0.03em] text-white md:text-4xl">
                  Get on the court.
                  <br />
                  Stay for the fun.
                </h3>

                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white backdrop-blur">
                    🅿️ Parking
                  </span>

                  <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white backdrop-blur">
                    🥤 Drinks
                  </span>

                  <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white backdrop-blur">
                    🍔 Food
                  </span>
                </div>

                <button
                  type="button"
                  className="mt-6 inline-flex items-center gap-3 rounded-full bg-lime-300 px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-emerald-950 transition hover:bg-white"
                >
                  Book a Court
                  <span className="text-lg">→</span>
                </button>
              </div>
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

        <section className="mx-auto max-w-7xl px-5 py-20">
          {/* Header */}
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-lime-400" />

                <div className="text-xs font-black uppercase tracking-[0.26em] text-emerald-700">
                  Pickleball Community
                </div>
              </div>

              <h2 className="mt-4 text-4xl font-black leading-[0.95] tracking-[-0.04em] text-slate-950 md:text-5xl">
                Find your people.
                <br />
                <span className="text-emerald-800">Find your game.</span>
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
                More than just a place to play. Meet players, join the
                community, enjoy friendly games, and discover your new favorite
                pickleball crew.
              </p>
            </div>

            <Link
              to="/book/maria-studio"
              className="group inline-flex items-center gap-3 rounded-full bg-emerald-950 px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-lime-300 hover:text-emerald-950"
            >
              Explore Clubs
              <span className="text-lg transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>

          {/* Club Feature */}
          <div className="mt-10 overflow-hidden rounded-[2.5rem] border border-emerald-900/10 bg-white shadow-sm">
            <div className="grid lg:grid-cols-[1.15fr,0.85fr]">
              {/* Image */}
              <div className="group relative min-h-105 overflow-hidden lg:min-h-130">
                <img
                  src="https://www.ronshoal.com/pickleball/images/slider/pickleball_beginner.jpg"
                  alt="Group of people playing pickleball together"
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent" />

                {/* Image Badge */}
                <div className="absolute left-6 top-6 rounded-full bg-white/95 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-950 backdrop-blur">
                  Community • Games • Friends
                </div>

                {/* Bottom Image Text */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-lime-300">
                    Play together
                  </div>

                  <div className="mt-2 text-3xl font-black tracking-[-0.03em] text-white md:text-4xl">
                    Good games.
                    <br />
                    Better company.
                  </div>
                </div>
              </div>

              {/* Club Information */}
              <div className="flex flex-col justify-between bg-[#eef6ed] p-8 md:p-10 lg:p-12">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-lime-200 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900">
                      Featured Club
                    </span>

                    <span className="text-xs font-black text-emerald-900/30">
                      01
                    </span>
                  </div>

                  <h3 className="mt-7 text-3xl font-black tracking-[-0.03em] text-slate-950 md:text-4xl">
                    Pickleball Club
                  </h3>

                  <p className="mt-5 text-sm leading-7 text-slate-600">
                    Whether you're picking up a paddle for the first time or
                    already love the game, there's always room for another
                    player. Join a welcoming community where games are
                    competitive, social, and fun.
                  </p>

                  {/* Club Features */}
                  <div className="mt-8 grid gap-3">
                    <div className="flex items-center gap-4 rounded-2xl bg-white p-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-950 text-lime-300">
                        ✦
                      </span>

                      <div>
                        <div className="text-sm font-black text-slate-900">
                          Meet New Players
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Make friends and find your next game.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-2xl bg-white p-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-950 text-lime-300">
                        +
                      </span>

                      <div>
                        <div className="text-sm font-black text-slate-900">
                          All Skill Levels
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Beginners and experienced players welcome.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-2xl bg-white p-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-950 text-lime-300">
                        ♥
                      </span>

                      <div>
                        <div className="text-sm font-black text-slate-900">
                          Play. Connect. Repeat.
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Come for the game, stay for the community.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Link
                  to="/book/maria-studio"
                  className="mt-8 flex items-center justify-center gap-3 rounded-2xl bg-emerald-950 px-6 py-4 text-sm font-black uppercase tracking-[0.15em] text-white transition hover:bg-lime-300 hover:text-emerald-950"
                >
                  Join the Club
                  <span className="text-lg">→</span>
                </Link>
              </div>
            </div>
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
