const ChildrensContents = () => {
  const chapters = [
    "A New Adventure",
    "The Big Discovery",
    "A Curious Question",
    "Learning Something New",
    "The Happy Ending",
  ];

  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-white p-10 shadow-2xl">
      <div className="mx-auto h-2 w-16 rounded-full bg-zinc-900" />

      <h1 className="mt-8 text-center text-3xl font-extrabold text-zinc-900">
        What's Inside?
      </h1>

      <p className="mt-2 text-center text-sm text-zinc-400">
        Let's explore together!
      </p>

      <div className="mt-10 space-y-4">
        {chapters.map((chapter, index) => (
          <div
            key={chapter}
            className="flex items-center gap-4 rounded-2xl bg-zinc-50 p-4"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white">
              {index + 1}
            </div>

            <span className="text-sm font-semibold text-zinc-800">
              {chapter}
            </span>
          </div>
        ))}
      </div>

      <PageNumber number="2" />
    </div>
  );
};

const PageNumber = ({ number }) => {
  return (
    <div className="absolute bottom-6 left-0 right-0 text-center text-xs text-zinc-400">
      {number}
    </div>
  );
};

export default ChildrensContents;
