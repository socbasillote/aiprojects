const NonfictionClosing = () => {
  return (
    <div className="relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-xl bg-zinc-950 p-10 text-white shadow-2xl">
      <div>
        <div className="h-1 w-12 bg-white" />

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
          Final Thoughts
        </p>
      </div>

      <div>
        <h1 className="text-4xl font-bold leading-tight">
          Keep Learning.
          <br />
          Keep Growing.
        </h1>

        <p className="mt-6 max-w-md text-sm leading-7 text-white/60">
          The most valuable knowledge is the knowledge you continue to apply.
        </p>
      </div>

      <div className="flex items-end justify-between border-t border-white/10 pt-4">
        <span className="text-xs text-white/40">The Art of Learning</span>

        <span className="text-xs text-white/40">5</span>
      </div>
    </div>
  );
};

export default NonfictionClosing;
