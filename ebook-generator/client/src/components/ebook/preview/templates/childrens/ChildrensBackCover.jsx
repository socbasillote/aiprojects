const ChildrensBackCover = () => {
  return (
    <div className="relative flex aspect-[3/4] flex-col items-center justify-between overflow-hidden rounded-3xl bg-zinc-900 p-10 text-center text-white shadow-2xl">
      <div />

      <div>
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-white/30">
          <span className="text-xs text-white/40">Illustration</span>
        </div>

        <p className="mt-8 text-sm leading-7 text-white/60">
          A gentle story for curious minds, growing hearts, and little
          adventurers.
        </p>
      </div>

      <div>
        <div className="mx-auto h-8 w-32 rounded border border-white/20" />

        <p className="mt-4 text-[10px] text-white/30">
          Publisher / ISBN placeholder
        </p>
      </div>
    </div>
  );
};

export default ChildrensBackCover;
