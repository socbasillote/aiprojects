export default function PaperHeader({ title, header }) {
  if (!header.enabled) {
    return null;
  }

  return (
    <header className="border-b border-slate-300 pb-4 text-center">
      {header.schoolName && (
        <div className="text-sm font-bold uppercase">{header.schoolName}</div>
      )}

      <h1 className="mt-1 text-xl font-bold">{title}</h1>

      {header.subject && <div className="mt-1 text-sm">{header.subject}</div>}

      <div className="mt-3 flex justify-between text-xs">
        <span>Teacher: {header.teacher || "____________"}</span>

        <span>Date: {header.date || "____________"}</span>

        <span>Duration: {header.duration || "____________"}</span>
      </div>
    </header>
  );
}
