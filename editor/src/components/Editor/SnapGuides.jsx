export default function SnapGuides({ guides, pageWidth, pageHeight }) {
  return (
    <>
      {guides.map((guide, index) => {
        if (guide.type === "vertical") {
          return (
            <div
              key={`vertical-${index}`}
              className="pointer-events-none absolute top-0 z-50 border-l border-dashed border-blue-500"
              style={{
                left: guide.position,
                height: pageHeight,
              }}
            />
          );
        }

        return (
          <div
            key={`horizontal-${index}`}
            className="pointer-events-none absolute left-0 z-50 border-t border-dashed border-blue-500"
            style={{
              top: guide.position,
              width: pageWidth,
            }}
          />
        );
      })}
    </>
  );
}
