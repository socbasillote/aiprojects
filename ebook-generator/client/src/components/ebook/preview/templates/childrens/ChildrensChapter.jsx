const ChildrensChapter = ({ mode }) => {
  if (mode === "opening") {
    return (
      <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-white p-8 shadow-2xl">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            Chapter One
          </p>

          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-zinc-900">
            A New
            <br />
            Adventure
          </h1>

          <div className="mt-8 aspect-[4/3] overflow-hidden rounded-3xl bg-zinc-100">
            <ImagePlaceholder />
          </div>

          <p className="mt-6 text-sm leading-7 text-zinc-600">
            One sunny morning, something wonderful was waiting just around the
            corner.
          </p>
        </div>

        <PageNumber number="3" />
      </div>
    );
  }

  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-white p-8 shadow-2xl">
      <h2 className="text-2xl font-extrabold text-zinc-900">
        The Big Discovery
      </h2>

      <p className="mt-5 text-sm leading-7 text-zinc-600">
        Our little explorer looked carefully around the room. Everything seemed
        ordinary at first.
      </p>

      <div className="my-7 aspect-[4/3] overflow-hidden rounded-3xl bg-zinc-100">
        <ImagePlaceholder />
      </div>

      <p className="text-sm leading-7 text-zinc-600">
        "Look!" said our friend. "I think I've found something special."
      </p>

      <p className="mt-4 text-sm leading-7 text-zinc-600">
        And that was the beginning of a brand-new adventure.
      </p>

      <PageNumber number="4" />
    </div>
  );
};

const ImagePlaceholder = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-zinc-300">
          <span className="text-xs text-zinc-400">Image</span>
        </div>

        <p className="mt-3 text-xs text-zinc-400">Illustration placeholder</p>
      </div>
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

export default ChildrensChapter;
