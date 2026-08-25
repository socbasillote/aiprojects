function LayerItem({ element, isSelected, onSelect }) {
  const label = getElementLabel(element);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs ${
        isSelected ? "bg-blue-50 text-blue-700" : "hover:bg-slate-100"
      }`}
    >
      <span className="w-5 text-center">{getElementIcon(element)}</span>

      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  );
}

function getElementLabel(element) {
  if (element.type === "text") {
    return element.content || "Text";
  }

  if (element.type === "image") {
    return "Image";
  }

  if (element.type === "shape") {
    return element.shape.charAt(0).toUpperCase() + element.shape.slice(1);
  }

  return "Element";
}

function getElementIcon(element) {
  if (element.type === "text") {
    return "T";
  }

  if (element.type === "image") {
    return "▧";
  }

  if (element.type === "shape") {
    return "□";
  }

  return "•";
}
