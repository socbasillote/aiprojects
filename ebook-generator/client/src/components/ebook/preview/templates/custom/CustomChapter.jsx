const CustomChapter = ({ mode }) => {
  if (mode === "opening") {
    return (
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-white p-10 shadow-2xl">
        <div className="flex h-full flex-col justify-center">
          <span className="text-xs uppercase tracking-[0.25em] text-zinc-400">
            Chapter 01
          </span>

          <h1 className="mt-5 text-4xl font-semibold leading-tight text-zinc-950">
            Introduction
          </h1>

          <div className="mt-6 h-px w-24 bg-zinc-900" />

          <p className="mt-7 max-w-md text-sm leading-7 text-zinc-500">
            This chapter introduces the main ideas and establishes the
            foundation for everything that follows.
          </p>

          <div className="mt-10 aspect-[16/9] overflow-hidden bg-zinc-100">
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center border border-dashed border-zinc-300">
                  <span className="text-xs text-zinc-400">Image</span>
                </div>

                <p className="mt-3 text-xs text-zinc-400">Image placeholder</p>
              </div>
            </div>
          </div>
        </div>

        <PageNumber number="3" />
      </div>
    );
  }

  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-white p-10 shadow-2xl">
      <div className="border-b border-zinc-200 pb-4">
        <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
          Chapter 01
        </span>
      </div>

      <h2 className="mt-7 text-2xl font-semibold text-zinc-950">
        Understanding the Basics
      </h2>

      <p className="mt-5 text-sm leading-7 text-zinc-600">
        Start by identifying the core ideas that define the subject. A clear
        foundation makes it easier to understand the details that follow.
      </p>

      <p className="mt-5 text-sm leading-7 text-zinc-600">
        The goal is not to memorize everything immediately. Instead, focus on
        understanding how the different pieces connect.
      </p>

      <div className="my-7 aspect-[16/9] overflow-hidden bg-zinc-100">
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center border border-dashed border-zinc-300">
              <span className="text-[10px] text-zinc-400">Image</span>
            </div>

            <p className="mt-2 text-[10px] text-zinc-400">
              Illustration placeholder
            </p>
          </div>
        </div>
      </div>

      <p className="text-sm leading-7 text-zinc-600">
        Once the basic structure is clear, you can begin applying the ideas to
        real situations.
      </p>

      <PageNumber number="4" />
    </div>
  );
};

const PageNumber = ({ number }) => (
  <div className="absolute bottom-6 left-10 right-10 flex justify-center border-t border-zinc-200 pt-3">
    <span className="text-xs text-zinc-400">{number}</span>
  </div>
);

export default CustomChapter;
