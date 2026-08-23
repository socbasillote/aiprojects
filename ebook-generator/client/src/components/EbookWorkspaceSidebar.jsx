const WORKSPACE_TABS = [
  ["overview", "Overview"],
  ["specification", "Specification"],
  ["outline", "Outline"],
  ["chapters", "Chapters"],
  ["images", "Images"],
  ["cover", "Cover"],
  ["assembly", "Assembly"],
  ["export", "Export"],
];

const EbookWorkspaceSidebar = ({ activeTab, onChange }) => {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-zinc-200 bg-white p-4 md:block">
      <nav className="space-y-1">
        {WORKSPACE_TABS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className={`w-full rounded-lg px-3 py-2.5 text-left text-sm ${
              activeTab === value
                ? "bg-zinc-100 font-medium"
                : "text-zinc-500 hover:bg-zinc-50"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default EbookWorkspaceSidebar;
