export default function PaperHeader({ title, header }) {
  if (!header.enabled) {
    return null;
  }

  return (
    <header className="border-b border-slate-300 pb-4 text-center">
      {header.showSchoolName !== false && header.schoolName && (
        <div className="text-sm font-bold uppercase">{header.schoolName}</div>
      )}

      <h1 className="mt-1 text-xl font-bold">{title}</h1>

      {header.showSubject !== false && header.subject && (
        <div className="mt-1 text-sm">{header.subject}</div>
      )}

      <div className="mt-3 flex justify-between text-xs">
        {header.showTeacher !== false && (
          <span>Teacher: {header.teacher || "____________"}</span>
        )}

        {header.showDate !== false && (
          <span>Date: {header.date || "____________"}</span>
        )}

        {header.showDuration !== false && (
          <span>Duration: {header.duration || "____________"}</span>
        )}
      </div>
    </header>
  );
}
