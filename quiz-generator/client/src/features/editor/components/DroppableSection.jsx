import { useDroppable } from "@dnd-kit/core";

export default function DroppableSection({ sectionId, children }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `section-${sectionId}`,
    data: {
      type: "section",
      sectionId,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={[
        "min-h-10 rounded-md transition-colors",
        isOver ? "bg-blue-50 ring-1 ring-blue-300" : "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
