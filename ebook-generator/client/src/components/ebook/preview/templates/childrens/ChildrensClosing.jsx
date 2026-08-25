const ChildrensClosing = () => {
  return (
    <div className="relative flex aspect-[3/4] flex-col items-center justify-center overflow-hidden rounded-3xl bg-zinc-900 p-10 text-center text-white shadow-2xl">
      <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-white/30">
        <span className="text-xs text-white/50">Image</span>
      </div>

      <h1 className="mt-8 text-4xl font-extrabold">The End!</h1>

      <p className="mt-4 max-w-sm text-sm leading-7 text-white/60">
        Every adventure teaches us something new.
      </p>

      <p className="mt-8 text-sm font-semibold">Keep exploring!</p>

      <div className="absolute bottom-6 text-xs text-white/40">5</div>
    </div>
  );
};

export default ChildrensClosing;
