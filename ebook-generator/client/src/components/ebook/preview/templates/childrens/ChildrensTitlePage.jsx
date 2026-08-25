const ChildrensTitlePage = ({ template }) => {
  return (
    <div className="relative flex aspect-[3/4] flex-col items-center justify-center overflow-hidden rounded-3xl bg-white p-10 text-center shadow-2xl">
      {/* Illustration placeholder */}

      <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-dashed border-zinc-300 bg-zinc-50">
        <span className="text-xs text-zinc-400">Illustration</span>
      </div>

      <p className="mt-8 text-xs font-bold uppercase tracking-[0.25em] text-zinc-400">
        A Storybook
      </p>

      <h1 className="mt-4 text-4xl font-black leading-tight text-zinc-900">
        The Little
        <br />
        Adventure
      </h1>

      <div className="mt-8 h-px w-16 bg-zinc-200" />

      <p className="mt-6 text-sm text-zinc-500">Written by</p>

      <p className="mt-1 text-sm font-semibold text-zinc-800">Author Name</p>

      <p className="absolute bottom-6 text-xs text-zinc-400">
        {template?.name || "Children's Storybook"}
      </p>
    </div>
  );
};

export default ChildrensTitlePage;
