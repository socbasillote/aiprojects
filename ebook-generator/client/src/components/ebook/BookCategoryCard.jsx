const BookCategoryCard = ({ category, selected, onSelect }) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(category)}
      aria-pressed={selected}
      className={[
        "group overflow-hidden rounded-2xl border bg-white text-left transition",
        "hover:-translate-y-0.5 hover:shadow-md",
        selected
          ? "border-zinc-900 ring-2 ring-zinc-900 ring-offset-2"
          : "border-zinc-200",
      ].join(" ")}
    >
      {/* Image placeholder */}
      <div className="aspect-[4/3] w-full bg-zinc-100">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-zinc-400 shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-6 w-6"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
              </div>

              <p className="mt-2 text-xs font-medium text-zinc-400">
                Category image
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Card content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-zinc-900">
              {category.name}
            </h3>

            <p className="mt-1 text-sm leading-5 text-zinc-500">
              {category.description}
            </p>
          </div>

          <div
            className={[
              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
              selected
                ? "border-zinc-900 bg-zinc-900"
                : "border-zinc-300 bg-white",
            ].join(" ")}
          >
            {selected && (
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className="h-3.5 w-3.5 text-white"
              >
                <path
                  d="m5 10 3 3 7-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

export default BookCategoryCard;
