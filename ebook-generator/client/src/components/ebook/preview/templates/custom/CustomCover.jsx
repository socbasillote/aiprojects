const CustomCover = ({ template }) => {
  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-white shadow-2xl">
      {/* Main image */}
      <div className="absolute inset-0 bg-zinc-100">
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex h-32 w-32 items-center justify-center border border-dashed border-zinc-300">
              <span className="text-xs uppercase tracking-wide text-zinc-400">
                Cover Image
              </span>
            </div>

            <p className="mt-4 text-xs text-zinc-400">
              Custom artwork placeholder
            </p>
          </div>
        </div>
      </div>

      {/* Simple typography */}
      <div className="absolute inset-x-8 top-10">
        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
          {template?.name || "Custom Style"}
        </p>
      </div>

      <div className="absolute bottom-0 inset-x-0 bg-white/95 px-8 py-9">
        <h1 className="text-4xl font-semibold leading-tight text-zinc-950">
          Your Ebook
          <br />
          Title
        </h1>

        <p className="mt-4 max-w-md text-sm leading-6 text-zinc-500">
          A flexible visual style that can adapt to different kinds of books.
        </p>

        <div className="mt-7">
          <p className="text-xs font-medium text-zinc-500">Author Name</p>
        </div>
      </div>
    </div>
  );
};

export default CustomCover;
