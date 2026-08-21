const ExportEditor = ({ ebook, onExportPdf, onExportEpub, loading }) => {
  const pdf = ebook?.export?.pdf;
  const epub = ebook?.export?.epub;

  const pdfReady = pdf?.status === "ready" && Boolean(pdf?.url);
  const epubReady = epub?.status === "ready" && Boolean(epub?.url);

  const pdfGenerating = pdf?.status === "generating";
  const epubGenerating = epub?.status === "generating";

  const pdfError = pdf?.status === "error";
  const epubError = epub?.status === "error";

  const canExport =
    ebook?.status === "ready_for_export" ||
    ebook?.status === "exporting" ||
    ebook?.status === "completed";

  if (!canExport) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8">
        <h2 className="text-lg font-semibold text-zinc-900">Export ebook</h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
          Your ebook must be fully assembled and approved before it can be
          exported.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Export ebook</h2>

        <p className="mt-1 text-sm text-zinc-500">
          Your ebook is approved and ready to export.
        </p>
      </div>

      {/* Ebook summary */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-zinc-900">
              {ebook.title}
            </h3>

            {ebook.subtitle && (
              <p className="mt-1 text-sm text-zinc-500">{ebook.subtitle}</p>
            )}
          </div>

          <div className="flex gap-3 text-sm text-zinc-500">
            <span>
              {ebook.chapterCount ||
                ebook.assembly?.chapterCount ||
                ebook.assembly?.chapters?.length ||
                0}{" "}
              chapters
            </span>

            <span>•</span>

            <span>
              {ebook.wordCount || ebook.assembly?.wordCount || 0} words
            </span>
          </div>
        </div>
      </div>

      {/* Export formats */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* PDF */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900">PDF</h3>

              {pdfReady && (
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                  Ready
                </span>
              )}

              {pdfGenerating && (
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                  Generating
                </span>
              )}

              {pdfError && (
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                  Error
                </span>
              )}
            </div>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              A print-ready PDF version of your completed ebook.
            </p>
          </div>

          <div className="mt-6">
            {pdfReady ? (
              <a
                href={
                  pdf.url.startsWith("http")
                    ? pdf.url
                    : `http://localhost:5000${pdf.url}`
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white"
              >
                Download PDF
              </a>
            ) : (
              <button
                type="button"
                onClick={onExportPdf}
                disabled={loading || pdfGenerating}
                className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pdfGenerating
                  ? "Generating PDF..."
                  : pdfError
                    ? "Retry PDF"
                    : "Export PDF"}
              </button>
            )}
          </div>

          {pdfError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-900">
                PDF export failed
              </p>

              <p className="mt-1 text-sm leading-6 text-red-700">
                {pdf.errorMessage || "The PDF could not be generated."}
              </p>
            </div>
          )}
        </div>

        {/* EPUB */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900">EPUB</h3>

              {epubReady && (
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                  Ready
                </span>
              )}

              {epubGenerating && (
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                  Generating
                </span>
              )}

              {epubError && (
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                  Error
                </span>
              )}
            </div>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              An ebook format designed for e-readers and ebook applications.
            </p>
          </div>

          <div className="mt-6">
            {epubReady ? (
              <a
                href={
                  epub.url.startsWith("http")
                    ? epub.url
                    : `http://localhost:5000${epub.url}`
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white"
              >
                Download EPUB
              </a>
            ) : (
              <button
                type="button"
                onClick={onExportEpub}
                disabled={loading || epubGenerating}
                className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {epubGenerating
                  ? "Generating EPUB..."
                  : epubError
                    ? "Retry EPUB"
                    : "Export EPUB"}
              </button>
            )}
          </div>

          {epubError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-900">
                EPUB export failed
              </p>

              <p className="mt-1 text-sm leading-6 text-red-700">
                {epub.errorMessage || "The EPUB could not be generated."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Final status */}
      {pdfReady && epubReady && (
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
          <h3 className="text-sm font-semibold text-zinc-900">
            Ebook export complete
          </h3>

          <p className="mt-1 text-sm leading-6 text-zinc-500">
            Both PDF and EPUB versions of your ebook are ready.
          </p>
        </div>
      )}
    </div>
  );
};

export default ExportEditor;
