import { useLayoutEffect, useRef } from "react";

import PaperBlock from "./PaperBlock";
import PaperHeader from "./PaperHeader";
import PaperStudentInfo from "./PaperStudentInfo";
import PaperInstructions from "./PaperInstructions";
import PaperFooter from "./PaperFooter";

export default function PaperMeasurement({
  blocks,
  width,
  height,
  paper,
  title,
  onMeasure,
}) {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const measurements = {};

    const elements = container.querySelectorAll("[data-paper-block]");

    elements.forEach((element) => {
      const id = element.dataset.paperBlock;

      if (!id) {
        return;
      }

      const rect = element.getBoundingClientRect();

      measurements[id] = rect.height;
    });

    const header = container.querySelector("[data-paper-measure-header]");

    const studentInfo = container.querySelector(
      "[data-paper-measure-student-info]",
    );

    const instructions = container.querySelector(
      "[data-paper-measure-instructions]",
    );

    const footer = container.querySelector("[data-paper-measure-footer]");

    onMeasure({
      blocks: measurements,

      chrome: {
        header: header?.getBoundingClientRect().height ?? 0,

        studentInfo: studentInfo?.getBoundingClientRect().height ?? 0,

        instructions: instructions?.getBoundingClientRect().height ?? 0,

        footer: footer?.getBoundingClientRect().height ?? 0,
      },
    });
  }, [blocks, width, height, paper, title, onMeasure]);

  const isTwoColumns = paper.columns === 2;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-[-100000px] top-0 opacity-0"
      style={{
        width: `${width}px`,
        height: `${height}px`,

        boxSizing: "border-box",

        padding: `${paper.margins.top}px ${paper.margins.right}px ${paper.margins.bottom}px ${paper.margins.left}px`,

        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}

      <div className="shrink-0" data-paper-measure-header>
        <PaperHeader title={title} header={paper.header} />
      </div>

      {/* STUDENT INFO */}

      <div className="shrink-0" data-paper-measure-student-info>
        <PaperStudentInfo studentInfo={paper.studentInfo} />
      </div>

      {/* INSTRUCTIONS */}

      <div className="shrink-0" data-paper-measure-instructions>
        <PaperInstructions instructions={paper.instructions} />
      </div>

      {/* CONTENT */}

      <div className="min-h-0 flex-1" data-paper-measure-content>
        <div className={isTwoColumns ? "grid grid-cols-2 gap-x-8" : "block"}>
          {blocks.map((block) => (
            <PaperBlock key={block.id} block={block} />
          ))}
        </div>
      </div>

      {/* FOOTER */}

      <div className="shrink-0" data-paper-measure-footer>
        <PaperFooter footer={paper.footer} pageNumber={1} />
      </div>
    </div>
  );
}
