const DesignTemplateCard = ({ template, selected, onPreview, onSelect }) => {
  return (
    <div
      className={[
        "overflow-hidden rounded-2xl border bg-white transition",
        selected
          ? "border-zinc-900 ring-2 ring-zinc-900 ring-offset-2"
          : "border-zinc-200",
      ].join(" ")}
    >
      {/* Placeholder preview */}
      <div className="aspect-[4/3] bg-zinc-100">
        <div className="flex h-full items-center justify-center p-8">
          <div className="h-full w-3/5 rounded-md bg-white p-4 shadow-sm">
            <div className="h-2 w-2/3 rounded bg-zinc-300" />

            <div className="mt-4 space-y-2">
              <div className="h-1.5 w-full rounded bg-zinc-200" />
              <div className="h-1.5 w-full rounded bg-zinc-200" />
              <div className="h-1.5 w-4/5 rounded bg-zinc-200" />
            </div>

            <div className="mt-6 h-20 rounded bg-zinc-100" />
          </div>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-zinc-900">{template.name}</h3>

        <p className="mt-1 text-sm leading-5 text-zinc-500">
          {template.description}
        </p>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => onPreview(template)}
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Preview
          </button>

          <button
            type="button"
            onClick={() => onSelect(template)}
            className={[
              "flex-1 rounded-lg px-3 py-2 text-sm font-medium",
              selected
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
            ].join(" ")}
          >
            {selected ? "Selected" : "Use this style"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesignTemplateCard;
