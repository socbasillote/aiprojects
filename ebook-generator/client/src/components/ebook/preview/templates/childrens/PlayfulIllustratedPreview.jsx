const PlayfulIllustratedPreview = ({ page }) => {
  if (!page) {
    return null;
  }

  switch (page.type) {
    case "cover":
      return <PlayfulCover />;

    case "title-page":
      return <PlayfulTitlePage />;

    case "story-spread":
      return <PlayfulSpread spreadNumber={page.spreadNumber} />;

    case "ending":
      return <PlayfulEnding />;

    case "back-cover":
      return <PlayfulBackCover />;

    default:
      return null;
  }
};

const PlayfulCover = () => {
  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-[2.5rem] bg-zinc-900 p-5 shadow-2xl">
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-zinc-200" />
      <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-zinc-300" />

      <div className="relative flex h-full flex-col rounded-[2rem] bg-white p-7">
        <span className="w-fit rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-600">
          A Fun Story
        </span>

        <div className="mt-7 flex flex-1 items-center justify-center">
          <div className="flex h-48 w-48 rotate-3 items-center justify-center rounded-[3rem] border-2 border-dashed border-zinc-300 bg-zinc-50">
            <span className="text-xs text-zinc-400">Big illustration</span>
          </div>
        </div>

        <h1 className="text-center text-4xl font-black leading-tight text-zinc-900">
          The Little
          <br />
          Explorer!
        </h1>

        <p className="mt-3 text-center text-sm font-medium text-zinc-500">
          A playful adventure
        </p>

        <p className="mt-6 text-center text-xs font-semibold text-zinc-400">
          Author Name
        </p>
      </div>
    </div>
  );
};

const PlayfulTitlePage = () => {
  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-[2.5rem] bg-white p-7 shadow-2xl">
      <div className="flex h-full flex-col items-center justify-center text-center">
        <span className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-bold text-white">
          LET'S GO!
        </span>

        <div className="mt-8 flex h-36 w-36 rotate-[-4deg] items-center justify-center rounded-[2rem] border-2 border-dashed border-zinc-300 bg-zinc-50">
          <span className="text-xs text-zinc-400">Character art</span>
        </div>

        <h1 className="mt-8 text-4xl font-black text-zinc-900">
          The Little
          <br />
          Explorer!
        </h1>

        <p className="mt-4 text-sm font-medium text-zinc-500">
          Written by Author Name
        </p>
      </div>
    </div>
  );
};

const PlayfulSpread = ({ spreadNumber }) => {
  const spreads = {
    1: {
      title: "Look What We Found!",
      text: "Something amazing was waiting just around the corner.",
      badge: "WOW!",
    },
    2: {
      title: "Let's Find Out!",
      text: "Our friends had a big question and couldn't wait to discover the answer.",
      badge: "HMMM...",
    },
    3: {
      title: "We Did It!",
      text: "The adventure taught everyone that trying new things can be lots of fun.",
      badge: "YAY!",
    },
  };

  const spread = spreads[spreadNumber] || spreads[1];

  return (
    <div className="w-full overflow-hidden rounded-[2rem] bg-zinc-900 p-3 shadow-2xl">
      <div className="grid grid-cols-2 overflow-hidden rounded-[1.5rem] bg-white">
        <div className="relative min-h-[540px] border-r border-zinc-200 p-7">
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-black text-zinc-600">
            {spread.badge}
          </span>

          <h2 className="mt-6 text-2xl font-black leading-tight text-zinc-900">
            {spread.title}
          </h2>

          <p className="mt-5 text-sm font-medium leading-7 text-zinc-600">
            {spread.text}
          </p>

          <div className="absolute bottom-8 left-7 right-7 aspect-[4/3] rotate-[-2deg] rounded-[2rem] bg-zinc-100">
            <div className="flex h-full items-center justify-center">
              <span className="text-xs text-zinc-400">Illustration</span>
            </div>
          </div>
        </div>

        <div className="relative min-h-[540px] bg-zinc-50 p-7">
          <div className="flex h-[58%] items-center justify-center">
            <div className="flex h-48 w-48 rotate-3 items-center justify-center rounded-[3rem] border-2 border-dashed border-zinc-300 bg-white">
              <span className="text-xs text-zinc-400">
                Character illustration
              </span>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold leading-7 text-zinc-700">
              "What do you think we'll discover next?"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlayfulEnding = () => {
  return (
    <div className="relative flex aspect-[3/4] flex-col items-center justify-center overflow-hidden rounded-[2.5rem] bg-white p-8 text-center shadow-2xl">
      <span className="rounded-full bg-zinc-900 px-5 py-2 text-xs font-black text-white">
        THE END!
      </span>

      <div className="mt-8 flex h-40 w-40 items-center justify-center rounded-[3rem] border-2 border-dashed border-zinc-300 bg-zinc-50">
        <span className="text-xs text-zinc-400">Happy ending</span>
      </div>

      <h1 className="mt-8 text-5xl font-black text-zinc-900">Hooray!</h1>

      <p className="mt-4 text-sm font-medium text-zinc-500">
        What an adventure!
      </p>
    </div>
  );
};

const PlayfulBackCover = () => {
  return (
    <div className="relative flex aspect-[3/4] flex-col items-center justify-center overflow-hidden rounded-[2.5rem] bg-zinc-900 p-10 text-center text-white shadow-2xl">
      <div className="flex h-32 w-32 rotate-3 items-center justify-center rounded-[2.5rem] border-2 border-dashed border-white/30">
        <span className="text-xs text-white/40">Character</span>
      </div>

      <p className="mt-8 max-w-xs text-sm font-medium leading-7 text-white/70">
        A fun adventure filled with curiosity, imagination, and discovery.
      </p>

      <div className="absolute bottom-8 text-[10px] text-white/40">
        Publisher / ISBN
      </div>
    </div>
  );
};

export default PlayfulIllustratedPreview;
