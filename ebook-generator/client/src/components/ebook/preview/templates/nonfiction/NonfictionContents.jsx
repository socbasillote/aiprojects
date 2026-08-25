const NonfictionContents = () => {
  const chapters = [
    "Understanding the Fundamentals",
    "Building a Strong Foundation",
    "Developing Practical Skills",
    "Applying What You Learn",
    "Creating a Sustainable System",
  ];

  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-white p-10 shadow-2xl">
      <div className="border-b border-zinc-900 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
          Contents
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950">
          Table of Contents
        </h1>
      </div>

      <div className="mt-8">
        {chapters.map((title, index) => (
          <div
            key={title}
            className="flex items-baseline gap-4 border-b border-zinc-100 py-4"
          >
            <span className="w-8 text-sm font-semibold text-zinc-400">
              {String(index + 1).padStart(2, "0")}
            </span>

            <span className="flex-1 text-sm font-medium text-zinc-800">
              {title}
            </span>

            <span className="text-xs text-zinc-400">{index + 4}</span>
          </div>
        ))}
      </div>

      <div className="absolute bottom-7 left-10 right-10 flex justify-between border-t border-zinc-200 pt-3">
        <span className="text-[10px] uppercase tracking-widest text-zinc-400">
          The Art of Learning
        </span>

        <span className="text-xs text-zinc-400">2</span>
      </div>
    </div>
  );
};

export default NonfictionContents;
