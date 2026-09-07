export default function QuestionAssets({ assets = [] }) {
  const images = assets.filter((asset) => asset.type === "image" && asset.url);

  if (!images.length) {
    return null;
  }

  return (
    <div className="my-4 space-y-3" data-question-assets>
      {images.map((asset) => (
        <figure
          key={asset.id}
          className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
        >
          <img
            src={asset.url}
            alt={asset.altText || "Question visual"}
            className="max-h-80 w-full object-contain"
          />
          {asset.altText && (
            <figcaption className="px-3 py-2 text-xs text-slate-500">
              {asset.altText}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
