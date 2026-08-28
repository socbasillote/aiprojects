import { useSelector } from "react-redux";

import { getPaperDimensions } from "../paperUtils";

import PaperBlock from "./PaperBlock";
import PaperHeader from "./PaperHeader";
import PaperStudentInfo from "./PaperStudentInfo";
import PaperInstructions from "./PaperInstructions";
import PaperFooter from "./PaperFooter";

export default function PaperPage({ columns = [[]], pageNumber = 1 }) {
  const title = useSelector((state) => state.editor.title);

  const paper = useSelector((state) => state.editor.paper);

  const dimensions = getPaperDimensions(paper.pageSize, paper.orientation);

  const isFirstPage = pageNumber === 1;

  return (
    <div
      className="paper-page mx-auto bg-white shadow-xl"
      style={{
        width: `${dimensions.width}mm`,
        height: `${dimensions.height}mm`,
        padding: `${paper.margins.top}mm ${paper.margins.right}mm ${paper.margins.bottom}mm ${paper.margins.left}mm`,
        boxSizing: "border-box",

        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* FIRST PAGE HEADER */}

      {isFirstPage && (
        <>
          <div data-paper-chrome="header">
            <PaperHeader title={title} header={paper.header} />
          </div>

          <div data-paper-chrome="student-info">
            <PaperStudentInfo studentInfo={paper.studentInfo} />
          </div>

          <div data-paper-chrome="instructions">
            <PaperInstructions instructions={paper.instructions} />
          </div>
        </>
      )}

      {/* CONTENT */}

      <main className="min-h-0 flex-1" data-paper-content>
        <div
          className={
            columns.length === 2 ? "grid h-full grid-cols-2 gap-x-8" : "block"
          }
        >
          {columns.map((column, columnIndex) => (
            <div key={columnIndex} className="min-w-0">
              {column.map((block) => (
                <PaperBlock key={block.id} block={block} />
              ))}
            </div>
          ))}
        </div>
      </main>

      {/* FOOTER */}

      <div className="shrink-0" data-paper-chrome="footer">
        <PaperFooter footer={paper.footer} pageNumber={pageNumber} />
      </div>
    </div>
  );
}
