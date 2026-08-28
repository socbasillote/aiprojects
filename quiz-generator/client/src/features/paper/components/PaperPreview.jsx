import { useCallback, useMemo, useState } from "react";

import { useSelector } from "react-redux";

import PaperPage from "./PaperPage";
import PaperMeasurement from "./PaperMeasurement";

import { buildPaperBlocks, paginateBlocks } from "../../editor/pagination";

import { getPaperDimensions } from "../paperUtils";

export default function PaperPreview() {
  const title = useSelector((state) => state.editor.title);

  const questions = useSelector((state) => state.editor.questions);

  const sections = useSelector((state) => state.editor.sections);

  const paper = useSelector((state) => state.editor.paper);

  const dimensions = getPaperDimensions(paper.pageSize, paper.orientation);

  /*
   * Build the logical paper blocks.
   *
   * Example:
   *
   * section-1
   * question-1
   * question-2
   * question-3
   * section-2
   * question-4
   */
  const blocks = useMemo(
    () =>
      buildPaperBlocks({
        questions,
        sections,
      }),
    [questions, sections],
  );

  /*
   * Actual measurements returned
   * by PaperMeasurement.
   *
   * {
   *   blocks: {
   *     "question-1": 82,
   *     "question-2": 54,
   *   },
   *
   *   chrome: {
   *     header: 72,
   *     studentInfo: 58,
   *     instructions: 24,
   *     footer: 31,
   *   }
   * }
   */
  const [measurement, setMeasurement] = useState(null);

  const handleMeasure = useCallback((result) => {
    setMeasurement(result);
  }, []);

  /*
   * CSS pixels per millimeter.
   *
   * 96 CSS pixels = 1 inch
   * 25.4mm = 1 inch
   */
  const mmToPx = useCallback((mm) => mm * (96 / 25.4), []);

  const paperWidthPx = mmToPx(dimensions.width);

  const paperHeightPx = mmToPx(dimensions.height);

  const marginTopPx = mmToPx(paper.margins.top);

  const marginBottomPx = mmToPx(paper.margins.bottom);

  /*
   * Total height available inside
   * the paper margins.
   */
  const contentAreaHeight = paperHeightPx - marginTopPx - marginBottomPx;

  /*
   * The first page contains:
   *
   * Header
   * Student information
   * Instructions
   * Questions
   * Footer
   *
   * Therefore questions can only
   * occupy the remaining height.
   */
  const firstPageAvailableHeight =
    contentAreaHeight -
    (measurement?.chrome?.header ?? 0) -
    (measurement?.chrome?.studentInfo ?? 0) -
    (measurement?.chrome?.instructions ?? 0) -
    (measurement?.chrome?.footer ?? 0);

  /*
   * Continuation pages currently don't
   * contain the first-page header/student
   * information/instructions.
   *
   * They still need to reserve footer space.
   */
  const continuationPageAvailableHeight =
    contentAreaHeight - (measurement?.chrome?.footer ?? 0);

  /*
   * Measurement is not ready yet.
   *
   * Render everything temporarily on page 1.
   * Once measurement completes, pagination
   * immediately recalculates.
   */
  const hasMeasurements =
    measurement &&
    measurement.blocks &&
    blocks.every((block) => typeof measurement.blocks[block.id] === "number");

  const pages = hasMeasurements
    ? paginateBlocks({
        blocks,
        measurements: measurement.blocks,
        firstPageHeight: firstPageAvailableHeight,
        continuationPageHeight: continuationPageAvailableHeight,
        columns: paper.columns,
      })
    : [
        {
          number: 1,
          columns: [blocks],
        },
      ];

  return (
    <div className="paper-workspace flex-1 overflow-auto bg-slate-100 p-10">
      {/*
       * Hidden measurement copy.
       *
       * It uses the same paper width,
       * dimensions, typography and content
       * as the real paper.
       */}
      <PaperMeasurement
        blocks={blocks}
        width={paperWidthPx}
        height={paperHeightPx}
        paper={paper}
        title={title}
        onMeasure={handleMeasure}
      />

      {/*
       * Actual visible paper pages.
       */}
      <div className="space-y-10">
        {pages.map((page) => (
          <PaperPage
            key={page.number}
            pageNumber={page.number}
            columns={page.columns}
          />
        ))}
      </div>
    </div>
  );
}
