import { useEffect, useState } from "react";

const ChaptersEditor = ({ ebook, onGenerate, onApprove, loading }) => {
  const chapters = ebook?.chapters || [];

  const [selectedChapter, setSelectedChapter] = useState(0);

  useEffect(() => {
    if (selectedChapter >= chapters.length && chapters.length > 0) {
      setSelectedChapter(0);
    }
  }, [chapters.length, selectedChapter]);

  const hasChapters = chapters.length > 0;

  const isGenerating =
    ebook?.generationProgress?.stage === "chapters" &&
    ebook?.generationProgress?.status === "generating";

  const allGenerated =
    hasChapters && chapters.every((chapter) => chapter.status === "generated");

  const hasFailedChapter = chapters.some(
    (chapter) => chapter.status === "error",
  );

  /*
   * If the backend says generation is currently
   * running, don't show retry while the request
   * is actually active.
   *
   * If the page was refreshed while generation
   * was running, operationLoading is false.
   * In that situation we allow retry.
   */
  const canRetry =
    hasChapters &&
    !loading &&
    (hasFailedChapter ||
      isGenerating ||
      chapters.some((chapter) => chapter.status === "pending"));

  if (!hasChapters) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8">
        <h2 className="text-lg font-semibold text-zinc-900">
          Generate ebook chapters
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
          Generate the full chapter content from your approved specification and
          outline.
        </p>

        <button
          type="button"
          onClick={onGenerate}
          disabled={loading}
          className="mt-6 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Generating chapters..." : "Generate chapters"}
        </button>
      </div>
    );
  }

  const chapter = chapters[selectedChapter];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">
            Ebook chapters
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Review the generated chapter content before approving the ebook.
          </p>
        </div>

        <div className="flex gap-3">
          {canRetry && !allGenerated && (
            <button
              type="button"
              onClick={onGenerate}
              disabled={loading}
              className="rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Generating..." : "Retry chapter generation"}
            </button>
          )}

          {allGenerated && (
            <button
              type="button"
              onClick={onApprove}
              disabled={loading}
              className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Approving..." : "Approve chapters"}
            </button>
          )}
        </div>
      </div>

      {isGenerating && !loading && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-900">
            Chapter generation appears to have stopped.
          </p>

          <p className="mt-1 text-sm text-amber-700">
            You can retry the chapter generation above.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-3">
          {chapters.map((item, index) => (
            <button
              key={item._id}
              type="button"
              onClick={() => setSelectedChapter(index)}
              className={`w-full rounded-xl px-3 py-3 text-left ${
                selectedChapter === index ? "bg-zinc-100" : "hover:bg-zinc-50"
              }`}
            >
              <div className="text-xs text-zinc-400">
                Chapter {item.chapterNumber}
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
              Chapter {chapter.chapterNumber}
            </div>

            <h3 className="mt-1 text-2xl font-semibold text-zinc-900">
              {chapter.title}
            </h3>

            <p className="mt-3 text-sm text-zinc-500">
              {chapter.wordCount || 0} words
            </p>

            {chapter.status === "generating" && (
              <p className="mt-3 text-sm text-amber-600">
                Generation is in progress or needs to be retried.
              </p>
            )}

            {chapter.status === "pending" && (
              <p className="mt-3 text-sm text-zinc-500">
                Waiting to be generated.
              </p>
            )}

            {chapter.status === "error" && (
              <p className="mt-3 text-sm text-red-600">
                This chapter failed to generate.
              </p>
            )}
          </div>

          <div className="whitespace-pre-wrap py-6 text-sm leading-7 text-zinc-700">
            {chapter.content || "No chapter content has been generated yet."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChaptersEditor;
