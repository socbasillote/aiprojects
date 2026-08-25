const StorybookPreview = ({ page }) => {
  if (!page) {
    return null;
  }

  switch (page.type) {
    case "cover":
      return <StorybookCover />;

    case "title-page":
      return <StorybookTitlePage />;

    case "story-spread":
      return <StorybookSpread spreadNumber={page.spreadNumber} />;

    case "ending":
      return <StorybookEnding />;

    case "back-cover":
      return <StorybookBackCover />;

    default:
      return null;
  }
};

const StorybookCover = () => {
  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-[#f4eee4] shadow-2xl">
      <div className="absolute inset-5 overflow-hidden rounded-[2rem] bg-[#e8ded0]">
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-full border-2 border-dashed border-zinc-400/60">
              <span className="text-xs text-zinc-500">
                Full-page illustration
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-[#f4eee4]/95 px-8 py-10 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-500">
          A Children's Story
        </p>

        <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-zinc-900">
          The Little
          <br />
          Adventure
        </h1>

        <p className="mt-4 font-serif text-sm italic text-zinc-600">
          A story about curiosity and wonder
        </p>

        <p className="mt-7 text-xs text-zinc-500">Written by Author Name</p>
      </div>
    </div>
  );
};

const StorybookTitlePage = () => {
  return (
    <div className="relative flex aspect-[3/4] flex-col items-center justify-center overflow-hidden rounded-3xl bg-[#f9f5ee] p-10 text-center shadow-2xl">
      <div className="flex h-36 w-36 items-center justify-center rounded-full border border-zinc-300 bg-[#eee5d8]">
        <span className="text-xs text-zinc-500">Illustration</span>
      </div>

      <p className="mt-10 font-serif text-xs uppercase tracking-[0.3em] text-zinc-500">
        A Story
      </p>

      <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-zinc-900">
        The Little
        <br />
        Adventure
      </h1>

      <div className="mt-8 h-px w-16 bg-zinc-300" />

      <p className="mt-6 font-serif text-sm italic text-zinc-600">Written by</p>

      <p className="mt-1 text-sm font-semibold text-zinc-800">Author Name</p>
    </div>
  );
};

const StorybookSpread = ({ spreadNumber }) => {
  const spreads = {
    1: {
      leftTitle: "A Sunny Morning",
      leftText:
        "One bright morning, our little explorer woke up and noticed something unusual outside the window.",
      rightTitle: "Something Special",
      rightText:
        '"Come and see!" said a friendly voice. A brand-new adventure was about to begin.',
    },

    2: {
      leftTitle: "Into the Garden",
      leftText:
        "Together they followed the winding path through the garden, looking carefully at every little thing.",
      rightTitle: "A Curious Question",
      rightText:
        "There were so many things to discover. But one question kept coming back again and again.",
    },

    3: {
      leftTitle: "The Big Adventure",
      leftText:
        "They learned that trying something new could be exciting, even when they did not know what would happen.",
      rightTitle: "A Happy Ending",
      rightText:
        "By the end of the day, they had discovered something wonderful: adventures are better when shared.",
    },
  };

  const spread = spreads[spreadNumber] || spreads[1];

  return (
    <div className="w-full overflow-hidden rounded-3xl bg-[#d9cdbd] p-3 shadow-2xl">
      <div className="grid grid-cols-2 overflow-hidden rounded-2xl bg-[#fdfaf5]">
        <StorybookPage
          title={spread.leftTitle}
          text={spread.leftText}
          imageFirst
          pageNumber={spreadNumber * 2 + 1}
        />

        <StorybookPage
          title={spread.rightTitle}
          text={spread.rightText}
          pageNumber={spreadNumber * 2 + 2}
          right
        />
      </div>
    </div>
  );
};

const StorybookPage = ({
  title,
  text,
  imageFirst = false,
  pageNumber,
  right = false,
}) => {
  return (
    <div
      className={`relative flex min-h-[540px] flex-col p-7 sm:p-9 ${
        right ? "border-l border-[#ddd3c5]" : ""
      }`}
    >
      {imageFirst && <StoryImage />}

      <div className={imageFirst ? "mt-7" : "flex-1"}>
        <h2 className="font-serif text-xl font-bold text-zinc-900">{title}</h2>

        <p className="mt-5 font-serif text-sm leading-8 text-zinc-700">
          {text}
        </p>
      </div>

      {!imageFirst && (
        <div className="mt-7">
          <StoryImage />
        </div>
      )}

      <span className="absolute bottom-4 text-[10px] text-zinc-400">
        {pageNumber}
      </span>
    </div>
  );
};

const StoryImage = () => (
  <div className="flex aspect-[4/3] items-center justify-center rounded-[2rem] bg-[#e9dfd2]">
    <span className="text-xs text-zinc-500">Story illustration</span>
  </div>
);

const StorybookEnding = () => {
  return (
    <div className="relative flex aspect-[3/4] flex-col items-center justify-center overflow-hidden rounded-3xl bg-[#f9f5ee] p-10 text-center shadow-2xl">
      <div className="flex h-36 w-36 items-center justify-center rounded-full bg-[#e9dfd2]">
        <span className="text-xs text-zinc-500">Final illustration</span>
      </div>

      <h1 className="mt-10 font-serif text-5xl font-bold text-zinc-900">
        The End
      </h1>

      <p className="mt-5 max-w-xs font-serif text-sm italic leading-7 text-zinc-600">
        And so the adventure came to a happy end.
      </p>

      <p className="mt-8 font-serif text-sm text-zinc-500">
        Until the next adventure...
      </p>
    </div>
  );
};

const StorybookBackCover = () => {
  return (
    <div className="relative flex aspect-[3/4] flex-col items-center justify-between overflow-hidden rounded-3xl bg-[#e8ded0] p-10 text-center shadow-2xl">
      <div />

      <div>
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-zinc-400/60">
          <span className="text-xs text-zinc-500">Illustration</span>
        </div>

        <p className="mt-8 max-w-xs font-serif text-sm leading-7 text-zinc-700">
          A gentle story for curious minds, growing hearts, and little
          adventurers.
        </p>
      </div>

      <div className="text-[10px] text-zinc-500">Publisher / ISBN</div>
    </div>
  );
};

export default StorybookPreview;
