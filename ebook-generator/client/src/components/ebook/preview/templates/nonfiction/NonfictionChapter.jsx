const NonfictionChapter = ({ mode }) => {
  if (mode === "opening") {
    return (
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-white p-10 shadow-2xl">
        <div className="flex h-full flex-col justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">
              Chapter 01
            </p>

            <h1 className="mt-6 max-w-lg text-4xl font-bold leading-tight tracking-tight text-zinc-950">
              Understanding
              <br />
              the Fundamentals
            </h1>

            <div className="mt-6 h-1 w-16 bg-zinc-900" />
          </div>

          <div>
            <div className="aspect-[16/9] overflow-hidden rounded-lg bg-zinc-100">
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-zinc-300">
                    <span className="text-xs text-zinc-400">Image</span>
                  </div>

                  <p className="mt-3 text-xs text-zinc-400">
                    Chapter illustration
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-6 max-w-lg text-sm leading-7 text-zinc-600">
              Before building advanced skills, it is important to understand the
              basic principles that make the entire system work.
            </p>
          </div>

          <PageNumber number="3" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-white p-10 shadow-2xl">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Chapter 01
          </span>

          <span className="text-[10px] text-zinc-400">The Art of Learning</span>
        </div>

        <h2 className="mt-7 text-2xl font-bold tracking-tight text-zinc-950">
          Start With the Fundamentals
        </h2>

        <p className="mt-5 text-sm leading-7 text-zinc-600">
          Effective learning begins with a clear understanding of the subject.
          Instead of immediately attempting complex material, start by
          identifying the foundational ideas.
        </p>

        <p className="mt-5 text-sm leading-7 text-zinc-600">
          These fundamentals provide the framework needed to understand more
          advanced concepts later.
        </p>

        {/* Image */}
        <div className="my-7 aspect-[16/9] overflow-hidden rounded-lg bg-zinc-100">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-zinc-300">
                <span className="text-[10px] text-zinc-400">Image</span>
              </div>

              <p className="mt-2 text-[10px] text-zinc-400">
                Diagram / illustration
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm leading-7 text-zinc-600">
          Once the foundation is clear, practice becomes more meaningful because
          each new idea has somewhere to connect.
        </p>

        <PageNumber number="4" />
      </div>
    </div>
  );
};

const PageNumber = ({ number }) => (
  <div className="absolute bottom-6 left-10 right-10 flex justify-center border-t border-zinc-200 pt-3">
    <span className="text-xs text-zinc-400">{number}</span>
  </div>
);

export default NonfictionChapter;
