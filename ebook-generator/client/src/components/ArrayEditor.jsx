const ArrayEditor = ({ label, values = [], onChange }) => {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </label>

      <textarea
        value={values.join("\n")}
        onChange={(event) =>
          onChange(
            event.target.value
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean),
          )
        }
        rows={5}
        placeholder="One item per line"
        className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-900"
      />
    </div>
  );
};

export default ArrayEditor;
