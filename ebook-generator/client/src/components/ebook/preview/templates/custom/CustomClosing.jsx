const CustomClosing = () => {
  return (
    <div className="relative flex aspect-[3/4] flex-col items-center justify-center overflow-hidden rounded-xl bg-zinc-100 p-10 text-center shadow-2xl">
      <div className="flex h-24 w-24 items-center justify-center border border-dashed border-zinc-300">
        <span className="text-xs uppercase tracking-wide text-zinc-400">
          Image
        </span>
      </div>

      <h1 className="mt-8 text-3xl font-semibold text-zinc-950">Thank You</h1>

      <p className="mt-4 max-w-sm text-sm leading-7 text-zinc-500">
        Continue exploring, practicing, and applying what you've learned.
      </p>

      <div className="absolute bottom-7 left-10 right-10 flex justify-center border-t border-zinc-200 pt-3">
        <span className="text-xs text-zinc-400">5</span>
      </div>
    </div>
  );
};

export default CustomClosing;
