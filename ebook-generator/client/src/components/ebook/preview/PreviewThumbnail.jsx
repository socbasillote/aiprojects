const PreviewThumbnail = ({ page, template }) => {
  const category = template?.category;

  if (category === "childrens-book") {
    return <ChildrensThumbnail type={page.type} />;
  }

  return <DefaultThumbnail type={page.type} />;
};

const ChildrensThumbnail = ({ type }) => {
  if (type === "cover") {
    return (
      <div className="flex h-full flex-col items-center justify-end bg-zinc-100 p-3">
        <div className="mb-3 h-14 w-14 rounded-full border-2 border-dashed border-zinc-300" />

        <div className="text-center text-[8px] font-bold">
          My First
          <br />
          Adventure
        </div>
      </div>
    );
  }

  if (type === "toc") {
    return (
      <div className="h-full bg-white p-3">
        <div className="mx-auto h-1 w-8 rounded bg-zinc-900" />

        <div className="mt-3 text-center text-[7px] font-bold">
          What's Inside?
        </div>

        <div className="mt-4 space-y-2">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-zinc-800" />

              <div className="h-1 flex-1 rounded bg-zinc-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "chapter-opening" || type === "chapter-content") {
    return (
      <div className="h-full bg-white p-3">
        <div className="text-center text-[7px] font-bold">A New Adventure</div>

        <div className="mt-3 aspect-[4/3] rounded-xl bg-zinc-100" />

        <div className="mt-3 space-y-1">
          <div className="h-1 w-full bg-zinc-200" />
          <div className="h-1 w-5/6 bg-zinc-200" />
          <div className="h-1 w-4/5 bg-zinc-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center bg-zinc-900 text-white">
      <span className="text-[7px] font-bold">THE END</span>
    </div>
  );
};

const DefaultThumbnail = ({ type }) => (
  <div className="flex h-full items-center justify-center bg-zinc-100">
    <span className="text-[7px] uppercase text-zinc-400">{type}</span>
  </div>
);

export default PreviewThumbnail;
