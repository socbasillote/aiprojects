const ChildrensStorySpread = ({ spreadNumber = 1 }) => {
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
      leftTitle: "The Discovery",
      leftText:
        "Together they followed the path through the garden, looking carefully at everything along the way.",
      rightTitle: "A Curious Question",
      rightText:
        "There were so many things to discover. But one question kept coming back again and again.",
    },

    3: {
      leftTitle: "The Big Adventure",
      leftText:
        "They learned that trying something new could be exciting, even when they did not know exactly what would happen.",
      rightTitle: "A Happy Ending",
      rightText:
        "By the end of the day, they had discovered something wonderful: the best adventures are the ones we share.",
    },
  };

  const spread = spreads[spreadNumber] || spreads[1];

  return (
    <div className="w-full overflow-hidden rounded-3xl bg-zinc-200 p-3 shadow-2xl">
      <div className="grid grid-cols-2 overflow-hidden rounded-2xl bg-white">
        {/* ==================================================
            LEFT PAGE
        ================================================== */}

        <StoryPage
          title={spread.leftTitle}
          text={spread.leftText}
          imagePosition="top"
          pageNumber={spreadNumber * 2 + 1}
        />

        {/* ==================================================
            RIGHT PAGE
        ================================================== */}

        <StoryPage
          title={spread.rightTitle}
          text={spread.rightText}
          imagePosition="bottom"
          pageNumber={spreadNumber * 2 + 2}
          right
        />
      </div>
    </div>
  );
};

const StoryPage = ({
  title,
  text,
  imagePosition,
  pageNumber,
  right = false,
}) => {
  return (
    <div
      className={`relative flex min-h-[520px] flex-col p-6 sm:p-8 ${
        right ? "border-l border-zinc-200" : ""
      }`}
    >
      {imagePosition === "top" && <ImagePlaceholder />}

      <div className={imagePosition === "top" ? "mt-6" : "flex-1"}>
        <h2 className="text-xl font-black leading-tight text-zinc-900">
          {title}
        </h2>

        <p className="mt-4 text-sm leading-7 text-zinc-600">{text}</p>
      </div>

      {imagePosition === "bottom" && (
        <div className="mt-6">
          <ImagePlaceholder />
        </div>
      )}

      <div
        className={`absolute bottom-4 ${
          right ? "right-5" : "left-5"
        } text-[10px] text-zinc-400`}
      >
        {pageNumber}
      </div>
    </div>
  );
};

const ImagePlaceholder = () => {
  return (
    <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-zinc-100">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-zinc-300">
          <span className="text-[10px] text-zinc-400">Image</span>
        </div>

        <p className="mt-2 text-[10px] text-zinc-400">Story illustration</p>
      </div>
    </div>
  );
};

export default ChildrensStorySpread;
