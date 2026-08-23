export const BOOK_CATEGORIES = [
  "Fiction",
  "Children's Books",
  "Non-Fiction",
  "Specialized / Lifestyle",
  "Professional & Practical",
];

const SelectField = ({
  label,
  value,
  onChange,
  options = BOOK_CATEGORIES,
  placeholder = "Select an option",
}) => {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </label>

      <select
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-zinc-900"
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
