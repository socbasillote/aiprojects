import { useState } from "react";

const ImagesEditor = ({ ebook, onGenerate, onApprove, loading }) => {
  const images = ebook?.images || [];

  const [selectedImage, setSelectedImage] = useState(0);

  const imagesApproved = ebook?.imagesApproved === true;

  const hasImages = images.length > 0;

  if (!hasImages) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8">
        <h2 className="text-lg font-semibold text-zinc-900">
          Create image plan
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
          Create a visual plan based on the approved ebook specification and
          chapters.
        </p>

        <button
          type="button"
          onClick={onGenerate}
          disabled={loading}
          className="mt-6 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating image plan..." : "Generate image plan"}
        </button>
      </div>
    );
  }

  const image = images[selectedImage];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Ebook images</h2>

          <p className="mt-1 text-sm text-zinc-500">
            Review the visual plan before approving it.
          </p>
        </div>

        {!imagesApproved && (
          <button
            type="button"
            onClick={onApprove}
            disabled={loading}
            className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Approving..." : "Approve image plan"}
          </button>
        )}

        {imagesApproved && (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-700">
            Image plan approved
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-3">
          {images.map((item, index) => (
            <button
              key={item._id}
              type="button"
              onClick={() => setSelectedImage(index)}
              className={`w-full rounded-xl px-3 py-3 text-left ${
                selectedImage === index ? "bg-zinc-100" : "hover:bg-zinc-50"
              }`}
            >
              <div className="text-xs text-zinc-400">
                Image {item.imageNumber}
              </div>

              <div className="mt-1 text-sm font-medium text-zinc-900">
                {item.title}
              </div>

              <div className="mt-1 text-xs capitalize text-zinc-500">
                {item.type}
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="border-b border-zinc-200 pb-5">
            <div className="text-sm text-zinc-400">
              Image {image.imageNumber}
            </div>

            <h3 className="mt-1 text-2xl font-semibold text-zinc-900">
              {image.title}
            </h3>

            <div className="mt-3 flex gap-2">
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">
                {image.type}
              </span>

              {image.chapterNumber && (
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">
                  Chapter {image.chapterNumber}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-6 py-6">
            <div>
              <h4 className="text-sm font-semibold text-zinc-900">
                Description
              </h4>

              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {image.description}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-zinc-900">
                Image prompt
              </h4>

              <div className="mt-2 rounded-xl bg-zinc-50 p-4 text-sm leading-6 text-zinc-600">
                {image.prompt}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-zinc-900">Alt text</h4>

              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {image.altText}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-zinc-900">Status</h4>

              <p className="mt-2 text-sm capitalize text-zinc-500">
                {image.status}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagesEditor;
