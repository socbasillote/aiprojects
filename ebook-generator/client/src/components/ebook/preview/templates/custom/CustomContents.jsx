const CustomContents = () => {
  const chapters = [
    "Introduction",
    "Getting Started",
    "Understanding the Basics",
    "Putting It Into Practice",
    "Next Steps",
  ];

  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-white p-10 shadow-2xl">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
        Contents
      </p>

      <h1 className="mt-4 text-3xl font-semibold text-zinc-950">
        Table of Contents
      </h1>

      <div className="mt-10 space-y-5">
        {chapters.map((title, index) => (
          <div key={title} className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">{index + 1}</span>

            <div className="h-px flex-1 bg-zinc-200" />

            <span className="max-w-[55%] text-right text-sm text-zinc-700">
              {title}
            </span>
          </div>
        ))}
      </div>

      <div className="absolute bottom-7 left-10 right-10 flex justify-between border-t border-zinc-200 pt-3">
        <span className="text-[10px] text-zinc-400">Your Ebook</span>

        <span className="text-xs text-zinc-400">2</span>
      </div>
    </div>
  );
};

export default CustomContents;
