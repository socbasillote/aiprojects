const CoverEditor = ({ ebook, onGenerate, onApprove, loading }) => {
  const cover = ebook?.cover ?? null;

  const coverStatus = cover?.status ?? null;
  const coverUrl = cover?.url ?? "";

  const hasCover = Boolean(coverUrl);

  /*
   * Defensive recovery:
   *
   * If the database says "generating" but a real cover URL
   * already exists, the cover has effectively been generated.
   *
   * This prevents the UI from showing "interrupted" for a
   * cover that actually exists.
   */
  const effectiveStatus =
    coverStatus === "generating" && hasCover ? "generated" : coverStatus;

  const isGenerating = effectiveStatus === "generating";

  const isGenerated = effectiveStatus === "generated" && hasCover;

  const isApproved = effectiveStatus === "approved" && hasCover;

  const hasError = effectiveStatus === "error";

  const isActiveGeneration = isGenerating && loading;

  const isInterruptedGeneration = isGenerating && !loading;

  /*
   * No cover record exists.
   */
  if (!cover) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8">
        <h2 className="text-lg font-semibold text-zinc-900">
          Create ebook cover
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
          Generate a professional cover based on your ebook content and approved
          visual direction.
        </p>

        <button
          type="button"
          onClick={onGenerate}
          disabled={loading}
          className="mt-6 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Generating cover..." : "Generate cover"}
        </button>
      </div>
    );
  }

  /*
   * Active generation in the current browser session.
   */
  if (isActiveGeneration) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />

          <div>
            <p className="text-sm font-medium text-zinc-900">
              Generating cover...
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Please wait while the cover is being created.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Ebook cover</h2>

          <p className="mt-1 text-sm text-zinc-500">
            Review the generated cover before approving it.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Interrupted generation */}
          {isInterruptedGeneration && (
            <button
              type="button"
              onClick={onGenerate}
              disabled={loading}
              className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Retrying..." : "Retry cover"}
            </button>
          )}

          {/* Failed generation */}
          {hasError && (
            <button
              type="button"
              onClick={onGenerate}
              disabled={loading}
              className="rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Retrying..." : "Retry cover"}
            </button>
          )}

          {/* Generated */}
          {isGenerated && (
            <button
              type="button"
              onClick={onApprove}
              disabled={loading}
              className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Approving..." : "Approve cover"}
            </button>
          )}

          {/* Approved */}
          {isApproved && (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-700">
              Cover approved
            </div>
          )}
        </div>
      </div>

      {/* Interrupted generation */}
      {isInterruptedGeneration && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-900">
            Cover generation was interrupted
          </p>

          <p className="mt-1 text-sm leading-6 text-amber-700">
            The previous cover generation did not finish. You can safely retry
            the cover.
          </p>
        </div>
      )}

      {/* Error */}
      {hasError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-semibold text-red-900">
            Cover generation failed
          </p>

          <p className="mt-1 text-sm leading-6 text-red-700">
            {cover.errorMessage || "The cover could not be generated."}
          </p>
        </div>
      )}

      {/* Cover preview */}
      {hasCover && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,680px)_1fr]">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <img
              src={
                coverUrl.startsWith("http")
                  ? coverUrl
                  : `http://localhost:5000${coverUrl}`
              }
              alt={cover.altText || `Cover for ${ebook.title}`}
              className="mx-auto w-full max-w-xl rounded-2xl border border-zinc-200 object-cover"
            />
          </div>

          {/* Cover information */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-zinc-900">
              Cover information
            </h3>

            <div className="mt-5 space-y-5">
              <div>
                <div className="text-xs text-zinc-400">Title</div>

                <div className="mt-1 text-sm font-medium text-zinc-900">
                  {ebook.title}
                </div>
              </div>

              {ebook.subtitle && (
                <div>
                  <div className="text-xs text-zinc-400">Subtitle</div>

                  <div className="mt-1 text-sm text-zinc-700">
                    {ebook.subtitle}
                  </div>
                </div>
              )}

              {ebook.authorName && (
                <div>
                  <div className="text-xs text-zinc-400">Author</div>

                  <div className="mt-1 text-sm text-zinc-700">
                    {ebook.authorName}
                  </div>
                </div>
              )}

              <div>
                <div className="text-xs text-zinc-400">Status</div>

                <div className="mt-1 text-sm capitalize text-zinc-700">
                  {effectiveStatus}
                </div>
              </div>

              {isApproved && (
                <div className="rounded-xl bg-zinc-50 p-4">
                  <p className="text-sm font-medium text-zinc-900">
                    Ebook completed
                  </p>

                  <p className="mt-1 text-sm leading-6 text-zinc-500">
                    The cover has been approved and all ebook generation stages
                    are complete.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cover record exists but no image */}
      {!hasCover && !isGenerating && !hasError && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8">
          <h3 className="text-sm font-semibold text-zinc-900">
            Cover not available
          </h3>

          <p className="mt-1 text-sm leading-6 text-zinc-500">
            The cover record exists, but no image is available.
          </p>

          <button
            type="button"
            onClick={onGenerate}
            disabled={loading}
            className="mt-5 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Generating cover..." : "Generate cover"}
          </button>
        </div>
      )}
    </section>
  );
};

export default CoverEditor;
