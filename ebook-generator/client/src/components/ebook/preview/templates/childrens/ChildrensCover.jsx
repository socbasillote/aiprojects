const ChildrensCover = ({ template }) => {
  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-white shadow-2xl">
      {/* Illustration area */}
      <div className="absolute inset-0 bg-zinc-100">
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full border-2 border-dashed border-zinc-300">
              <span className="text-sm text-zinc-400">Cover Illustration</span>
            </div>

            <p className="mt-4 text-xs text-zinc-400">
              Children's artwork placeholder
            </p>
          </div>
        </div>
      </div>

      {/* Soft overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-white/90 px-8 py-10 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-400">
          A Children's Story
        </p>

        <h1 className="mt-4 text-4xl font-black leading-tight text-zinc-900">
          The Little
          <br />
          Adventure
        </h1>

        <p className="mt-4 text-sm text-zinc-600">
          A story about curiosity, friendship, and discovery.
        </p>

        <p className="mt-7 text-xs font-medium text-zinc-400">Author Name</p>
      </div>
    </div>
  );
};

export default ChildrensCover;
