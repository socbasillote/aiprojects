import PaperBlock from "./PaperBlock";
import PaperHeader from "./PaperHeader";
import PaperStudentInfo from "./PaperStudentInfo";
import PaperInstructions from "./PaperInstructions";
import PaperFooter from "./PaperFooter";

import { getPaperDimensions } from "../paperUtils";

export default function PaperPage({
  columns = [[]],
  pageNumber = 1,
  title,
  paper,
  header = paper.header,
  studentInfo = paper.studentInfo,
  instructions = paper.instructions,
  footer = paper.footer,
}) {
  const dimensions = getPaperDimensions(paper.pageSize, paper.orientation);

  const isFirstPage = pageNumber === 1;

  return (
    <div
      className="paper-page overflow-hidden bg-white shadow-xl"
      style={{
        width: `${dimensions.width}mm`,
        height: `${dimensions.height}mm`,

        padding: `${paper.margins.top}mm ${paper.margins.right}mm ${paper.margins.bottom}mm ${paper.margins.left}mm`,

        boxSizing: "border-box",

        display: "flex",
        flexDirection: "column",
      }}
    >
      {isFirstPage && (
        <>
          <div className="shrink-0" data-paper-chrome="header">
            <PaperHeader title={title} header={header} />
          </div>

          <div className="shrink-0" data-paper-chrome="student-info">
            <PaperStudentInfo studentInfo={studentInfo} />
          </div>

          <div className="shrink-0" data-paper-chrome="instructions">
            <PaperInstructions instructions={instructions} />
          </div>
        </>
      )}

      <main className="min-h-0 min-w-0 flex-1" data-paper-content>
        {columns.length === 2 ? (
          <div className="grid min-h-0 grid-cols-2 gap-x-8">
            {columns.map((column, columnIndex) => (
              <div key={columnIndex} className="min-w-0">
                {column.map((block) => (
                  <PaperBlock key={block.id} block={block} />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="min-h-0">
            {columns[0]?.map((block) => (
              <PaperBlock key={block.id} block={block} />
            ))}
          </div>
        )}
      </main>

      <div className="shrink-0" data-paper-chrome="footer">
        <PaperFooter footer={footer} pageNumber={pageNumber} />
      </div>
    </div>
  );
}
