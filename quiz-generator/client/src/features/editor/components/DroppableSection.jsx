import { useDroppable } from "@dnd-kit/core";

export default function DroppableSection({ sectionId, children, unsectioned }) {
  const { setNodeRef, isOver } = useDroppable({
    id: unsectioned ? "unsectioned" : `section-${sectionId}`,
    data: {
      type: unsectioned ? "unsectioned" : "section",
      sectionId: unsectioned ? null : sectionId,
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
