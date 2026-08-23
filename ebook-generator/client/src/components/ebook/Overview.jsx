const Overview = ({ ebook, onGenerateSpecification, operationLoading }) => (
  <section>
    <h2 className="text-2xl font-semibold">Ebook overview</h2>

    <p className="mt-2 text-sm text-zinc-500">
      Move through the planning stages before generating chapters.
    </p>

    <div className="mt-8 grid gap-5 sm:grid-cols-3">
      <Stat label="Status" value={ebook.status?.replace(/_/g, " ")} />

      <Stat label="Chapters" value={ebook.chapterCount || 0} />

      <Stat label="Words" value={ebook.wordCount || 0} />
    </div>

    {!ebook.specification && (
      <button
        onClick={onGenerateSpecification}
        disabled={operationLoading}
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {operationLoading && <Loader2 size={16} className="animate-spin" />}
        Generate specification
      </button>
    )}
  </section>
);

const Stat = ({ label, value }) => (
  <div className="rounded-xl border border-zinc-200 bg-white p-5">
    <p className="text-xs uppercase tracking-wide text-zinc-400">{label}</p>

    <p className="mt-2 text-xl font-semibold capitalize">{value}</p>
  </div>
);

export default Overview;
