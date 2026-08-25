const ChildrensEnding = () => {
  return (
    <div className="relative flex aspect-[3/4] flex-col items-center justify-center overflow-hidden rounded-3xl bg-white p-10 text-center shadow-2xl">
      <div className="flex h-36 w-36 items-center justify-center rounded-full bg-zinc-100">
        <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-zinc-300">
          <span className="text-xs text-zinc-400">Illustration</span>
        </div>
      </div>

      <h1 className="mt-10 text-5xl font-black text-zinc-900">The End</h1>

      <p className="mt-5 max-w-xs text-sm leading-7 text-zinc-500">
        And so our adventure came to a happy end.
      </p>

      <p className="mt-8 text-sm font-semibold text-zinc-700">
        Until the next adventure...
      </p>
    </div>
  );
};

export default ChildrensEnding;
