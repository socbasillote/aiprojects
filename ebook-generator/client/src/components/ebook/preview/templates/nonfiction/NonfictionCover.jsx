const NonfictionCover = ({ template }) => {
  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-white shadow-2xl">
      {/* Image area */}
      <div className="absolute inset-0 bg-zinc-100">
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-lg border border-dashed border-zinc-300">
              <span className="text-xs uppercase tracking-wide text-zinc-400">
                Cover Image
              </span>
            </div>

            <p className="mt-4 text-xs text-zinc-400">
              Professional image placeholder
            </p>
          </div>
        </div>
      </div>

      {/* Overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-white/95 px-8 py-10">
        <div className="mb-4 h-1 w-12 bg-zinc-900" />

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          {template?.name || "Non-Fiction"}
        </p>

        <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-zinc-950">
          The Art of
          <br />
          Learning
        </h1>

        <p className="mt-4 max-w-md text-sm leading-6 text-zinc-500">
          A practical guide to understanding ideas, building skills, and making
          knowledge useful.
        </p>

        <div className="mt-8 border-t border-zinc-200 pt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Author Name
          </p>
        </div>
      </div>
    </div>
  );
};

export default NonfictionCover;
