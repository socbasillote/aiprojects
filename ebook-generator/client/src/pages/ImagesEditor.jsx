import { useState } from "react";

const ImagesEditor = ({
  ebook,
  onGenerate,
  onApprove,
  onGenerateImages,
  onApproveImages,
  loading,
}) => {
  const images = ebook?.images || [];

  const [selectedImage, setSelectedImage] = useState(0);

  /*
   * This means the IMAGE PLAN is approved.
   *
   * It does NOT mean the actual images
   * have been generated or approved.
   */
  const imagePlanApproved = ebook?.imagesApproved === true;

  const hasImages = images.length > 0;

  /*
   * Actual image generation state.
   *
   * A generated image must have:
   *
   * status === "generated"
   * AND
   * a URL.
   */
  const allGenerated =
    hasImages &&
    images.every((image) => image.status === "generated" && Boolean(image.url));

  const hasGeneratedImages = images.some(
    (image) => image.status === "generated" && Boolean(image.url),
  );

  const hasFailedImages = images.some((image) => image.status === "error");

  const imagesGenerating = images.some(
    (image) => image.status === "generating",
  );

  /*
   * Actual image approval.
   *
   * Do NOT use imagesApproved here because
   * that field belongs to the image PLAN.
   */
  const actualImagesApproved =
    hasImages &&
    images.every((image) => image.status === "approved" && Boolean(image.url));

  /*
   * No image plan exists yet.
   */
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

  const image = images[selectedImage] || images[0];

  /*
   * IMAGE PLAN REVIEW
   *
   * Plan exists but has not been approved.
   */
  if (!imagePlanApproved) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              Ebook image plan
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Review the visual plan before approving it.
            </p>
          </div>

          <button
            type="button"
            onClick={onApprove}
            disabled={loading}
            className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Approving..." : "Approve image plan"}
          </button>
        </div>

        <ImagePlanContent
          images={images}
          image={image}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
        />
      </div>
    );
  }

  /*
   * IMAGE PLAN APPROVED
   *
   * Actual images have not been generated yet.
   *
   * This is the state you were stuck in.
   */
  if (
    imagePlanApproved &&
    !hasGeneratedImages &&
    !imagesGenerating &&
    !actualImagesApproved
  ) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              Generate ebook images
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              The image plan has been approved. Generate the actual images for
              review.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-700">
              Image plan approved
            </div>

            <button
              type="button"
              onClick={onGenerateImages}
              disabled={loading}
              className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Generating images..."
                : hasFailedImages
                  ? "Retry image generation"
                  : "Generate images"}
            </button>
          </div>
        </div>

        <ImagePlanContent
          images={images}
          image={image}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
        />
      </div>
    );
  }

  /*
   * ACTUAL IMAGE GENERATION
   */
  if (imagesGenerating) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">
            Generating ebook images
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            The approved image plan is being converted into actual images.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />

            <div>
              <p className="text-sm font-medium text-zinc-900">
                Generating images...
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                Please wait while the image generation pipeline runs.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {images.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3"
              >
                <div>
                  <div className="text-xs text-zinc-400">
                    Image {item.imageNumber}
                  </div>

                  <div className="text-sm font-medium text-zinc-900">
                    {item.title}
                  </div>
                </div>

                <span className="text-xs capitalize text-zinc-500">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /*
   * ACTUAL IMAGE REVIEW
   */
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Ebook images</h2>

          <p className="mt-1 text-sm text-zinc-500">
            Review the generated images before approving them.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!allGenerated && !imagesGenerating && !actualImagesApproved && (
            <button
              type="button"
              onClick={onGenerateImages}
              disabled={loading}
              className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Generating images..."
                : hasFailedImages
                  ? "Retry image generation"
                  : "Generate images"}
            </button>
          )}

          {allGenerated && !actualImagesApproved && (
            <button
              type="button"
              onClick={onApproveImages}
              disabled={loading}
              className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Approving..." : "Approve images"}
            </button>
          )}

          {actualImagesApproved && (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-700">
              Images approved
            </div>
          )}
        </div>
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
                {item.status}
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

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">
                {image.type}
              </span>

              {image.chapterNumber && (
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">
                  Chapter {image.chapterNumber}
                </span>
              )}

              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs capitalize text-zinc-600">
                {image.status}
              </span>
            </div>
          </div>

          {image.url ? (
            <div className="mt-6">
              <img
                src={
                  image.url?.startsWith("http")
                    ? image.url
                    : `http://localhost:5000${image.url}`
                }
                alt={image.altText || image.title}
                className="w-full rounded-2xl border border-zinc-200 object-cover"
              />
            </div>
          ) : (
            <div className="mt-6 flex aspect-video items-center justify-center rounded-2xl bg-zinc-100">
              <p className="text-sm text-zinc-500">
                {image.status === "generating"
                  ? "Generating image..."
                  : image.status === "error"
                    ? "Image generation failed."
                    : "Image not generated yet."}
              </p>
            </div>
          )}

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

            {image.errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <h4 className="text-sm font-semibold text-red-900">
                  Generation error
                </h4>

                <p className="mt-2 text-sm leading-6 text-red-700">
                  {image.errorMessage}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ImagePlanContent = ({
  images,
  image,
  selectedImage,
  setSelectedImage,
}) => {
  return (
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
          <div className="text-sm text-zinc-400">Image {image.imageNumber}</div>

          <h3 className="mt-1 text-2xl font-semibold text-zinc-900">
            {image.title}
          </h3>

          <div className="mt-3 flex flex-wrap gap-2">
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
            <h4 className="text-sm font-semibold text-zinc-900">Description</h4>

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
  );
};

export default ImagesEditor;
