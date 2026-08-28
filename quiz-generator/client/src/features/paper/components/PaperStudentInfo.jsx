export default function PaperStudentInfo({ studentInfo }) {
  if (!studentInfo.enabled) {
    return null;
  }

  return (
    <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3 border-b border-slate-300 pb-5 text-sm">
      {studentInfo.name && (
        <div>
          Name: <span className="inline-block w-48 border-b border-slate-400" />
        </div>
      )}

      {studentInfo.gradeSection && (
        <div>
          Grade / Section:{" "}
          <span className="inline-block w-32 border-b border-slate-400" />
        </div>
      )}

      {studentInfo.date && (
        <div>
          Date: <span className="inline-block w-32 border-b border-slate-400" />
        </div>
      )}

      {studentInfo.score && (
        <div>
          Score:{" "}
          <span className="inline-block w-20 border-b border-slate-400" />
        </div>
      )}
    </div>
  );
}
