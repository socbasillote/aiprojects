const EditorField = ({
  label,
  value,
  onChange,
  textarea = false,
  type = "text",
}) => {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </label>

      {textarea ? (
        <textarea
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className="w-full resize-y rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-900"
        />
      ) : (
        <input
          type={type}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-900"
        />
      )}
    </div>
  );
};

export default EditorField;
