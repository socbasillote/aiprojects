import { useState } from "react";

const AssemblyEditor = ({ ebook, onGenerate, onApprove, loading }) => {
  const assembly = ebook?.assembly;

  const [selectedChapter, setSelectedChapter] = useState(0);

  /*
   * No assembly exists yet.
   */
  if (!assembly) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8">
        <h2 className="text-lg font-semibold text-zinc-900">
          Assemble your ebook
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
          Combine your approved chapters, images, and cover into the final ebook
          for review.
        </p>

        <button
          type="button"
          onClick={onGenerate}
          disabled={loading}
          className="mt-6 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Assembling ebook..." : "Assemble ebook"}
        </button>
      </div>
    );
  }

  const chapters = assembly.chapters || [];

  const isAssembling = assembly.status === "assembling";
  const isReadyForReview = assembly.status === "ready_for_review";
  const isApproved = assembly.status === "approved";
  const hasError = assembly.status === "error";

  /*
   * An assembly can be rebuilt after it has already been generated
   * or approved.
   *
   * This is useful when the assembly structure changes, such as
   * attaching images to chapters.
   */
  const canReassemble = isReadyForReview || isApproved || hasError;

  const chapter = chapters[selectedChapter];

  /*
   * Active assembly.
   */
  if (isAssembling && loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />

          <div>
            <p className="text-sm font-medium text-zinc-900">
              Assembling ebook...
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Combining your chapters, images, and cover.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
   * Assembly was left in an active state,
   * but there is no request currently running.
   */
  const staleAssembly = isAssembling && !loading;

  /*
   * Count all images in the assembled ebook.
   */
  const imageCount =
    assembly.imageCount ??
    chapters.reduce(
      (total, chapterItem) => total + (chapterItem.images?.length || 0),
      0,
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Ebook preview</h2>

          <p className="mt-1 text-sm text-zinc-500">
            Review the complete ebook before approving it.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Stale assembly */}
          {staleAssembly && (
            <button
              type="button"
              onClick={onGenerate}
              disabled={loading}
              className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Retrying..." : "Retry assembly"}
            </button>
          )}

          {/* Re-assemble */}
          {canReassemble && (
            <button
              type="button"
              onClick={onGenerate}
              disabled={loading}
              className="rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Re-assembling..." : "Re-assemble ebook"}
            </button>
          )}

          {/* Approve */}
          {isReadyForReview && (
            <button
              type="button"
              onClick={onApprove}
              disabled={loading}
              className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Approving..." : "Approve ebook"}
            </button>
          )}

          {/* Approved */}
          {isApproved && (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-700">
              Ebook approved
            </div>
          )}
        </div>
      </div>

      {/* Stale assembly */}
      {staleAssembly && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-900">
            Ebook assembly was interrupted
          </p>

          <p className="mt-1 text-sm leading-6 text-amber-700">
            The ebook is marked as assembling, but there is no active assembly
            request. You can safely retry the assembly.
          </p>
        </div>
      )}

      {/* Error */}
      {hasError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-semibold text-red-900">
            Ebook assembly failed
          </p>

          <p className="mt-1 text-sm leading-6 text-red-700">
            {assembly.errorMessage || "The ebook could not be assembled."}
          </p>

          <button
            type="button"
            onClick={onGenerate}
            disabled={loading}
            className="mt-4 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-900 disabled:opacity-50"
          >
            {loading ? "Retrying..." : "Retry assembly"}
          </button>
        </div>
      )}

      {/* Ebook */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        {/* Cover */}
        {assembly.coverUrl && (
          <div className="border-b border-zinc-200 bg-zinc-50 p-8">
            <img
              src={
                assembly.coverUrl.startsWith("http")
                  ? assembly.coverUrl
                  : `http://localhost:5000${assembly.coverUrl}`
              }
              alt={`Cover for ${assembly.title}`}
              className="mx-auto w-full max-w-md rounded-2xl border border-zinc-200 shadow-sm"
            />
          </div>
        )}

        {/* Book header */}
        <div className="px-6 py-10 text-center sm:px-12">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            {assembly.title}
          </h1>

          {assembly.subtitle && (
            <p className="mt-3 text-lg text-zinc-500">{assembly.subtitle}</p>
          )}

          {assembly.authorName && (
            <p className="mt-6 text-sm font-medium text-zinc-600">
              {assembly.authorName}
            </p>
          )}
        </div>

        {/* Table of contents */}
        <div className="border-y border-zinc-200 bg-zinc-50 px-6 py-8 sm:px-12">
          <h2 className="text-xl font-semibold text-zinc-900">
            Table of Contents
          </h2>

          <div className="mt-5 space-y-2">
            {(assembly.tableOfContents || []).map((item) => (
              <button
                key={item.chapterNumber}
                type="button"
                onClick={() => {
                  const index = chapters.findIndex(
                    (chapterItem) =>
                      chapterItem.chapterNumber === item.chapterNumber,
                  );

                  if (index !== -1) {
                    setSelectedChapter(index);
                  }
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm hover:bg-white"
              >
                <span className="w-8 text-zinc-400">{item.chapterNumber}.</span>

                <span className="font-medium text-zinc-800">{item.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chapter navigation */}
        {chapter && (
          <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
            {/* Sidebar */}
            <div className="border-r border-zinc-200 bg-zinc-50 p-3">
              {chapters.map((item, index) => {
                const chapterImageCount = item.images?.length || 0;

                return (
                  <button
                    key={item.chapterNumber}
                    type="button"
                    onClick={() => setSelectedChapter(index)}
                    className={`w-full rounded-xl px-3 py-3 text-left ${
                      selectedChapter === index
                        ? "bg-white shadow-sm"
                        : "hover:bg-white/70"
                    }`}
                  >
                    <div className="text-xs text-zinc-400">
                      Chapter {item.chapterNumber}
                    </div>

                    <div className="mt-1 text-sm font-medium text-zinc-900">
                      {item.title}
                    </div>

                    {chapterImageCount > 0 && (
                      <div className="mt-2 text-xs text-zinc-400">
                        {chapterImageCount}{" "}
                        {chapterImageCount === 1 ? "image" : "images"}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Chapter content */}
            <article className="min-w-0 px-6 py-10 sm:px-10 lg:px-12">
              <div className="max-w-3xl">
                <div className="text-sm text-zinc-400">
                  Chapter {chapter.chapterNumber}
                </div>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
                  {chapter.title}
                </h2>

                {chapter.summary && (
                  <p className="mt-4 border-l-2 border-zinc-300 pl-4 text-sm italic leading-6 text-zinc-500">
                    {chapter.summary}
                  </p>
                )}

                <div className="mt-8 whitespace-pre-wrap text-[15px] leading-8 text-zinc-700">
                  {chapter.content}
                </div>

                {/* Chapter images */}
                {chapter.images?.length > 0 && (
                  <div className="mt-10 space-y-10">
                    {chapter.images.map((image) => (
                      <figure key={image.imageNumber}>
                        <img
                          src={
                            image.url.startsWith("http")
                              ? image.url
                              : `http://localhost:5000${image.url}`
                          }
                          alt={image.altText || image.title}
                          className="w-full rounded-2xl border border-zinc-200"
                        />

                        <figcaption className="mt-3 text-center text-sm text-zinc-500">
                          {image.title}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                )}

                {/* No images */}
                {(!chapter.images || chapter.images.length === 0) && (
                  <div className="mt-10 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-400">
                    No images assigned to this chapter.
                  </div>
                )}
              </div>
            </article>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="text-xs text-zinc-400">Chapters</div>

          <div className="mt-2 text-2xl font-semibold text-zinc-900">
            {assembly.chapterCount ?? chapters.length}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="text-xs text-zinc-400">Words</div>

          <div className="mt-2 text-2xl font-semibold text-zinc-900">
            {Number(assembly.wordCount || 0).toLocaleString()}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="text-xs text-zinc-400">Images</div>

          <div className="mt-2 text-2xl font-semibold text-zinc-900">
            {imageCount}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="text-xs text-zinc-400">Status</div>

          <div className="mt-2 text-2xl font-semibold capitalize text-zinc-900">
            {String(assembly.status || "").replaceAll("_", " ")}
          </div>
        </div>
      </div>

      {/* Approved */}
      {isApproved && (
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
          <p className="text-sm font-semibold text-zinc-900">
            Ebook generation complete
          </p>

          <p className="mt-1 text-sm leading-6 text-zinc-500">
            Your ebook has been assembled and approved. It is now ready for
            export.
          </p>
        </div>
      )}
    </div>
  );
};

export default AssemblyEditor;
