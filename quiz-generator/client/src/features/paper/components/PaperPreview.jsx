import { useCallback, useMemo, useState } from "react";

import { useSelector } from "react-redux";

import PaperPage from "./PaperPage";
import PaperMeasurement from "./PaperMeasurement";

import { paginateBlocks } from "../../editor/pagination";
import { buildPaperPages } from "../../../editor/paperPageModel";
import { buildPaperLayout } from "../../../editor/buildPaperLayout";

import { getPaperDimensions } from "../paperUtils";

export default function PaperPreview() {
  const title = useSelector((state) => state.editor.title);

  const questions = useSelector((state) => state.editor.questions);

  const sections = useSelector((state) => state.editor.sections);

  const paper = useSelector((state) => state.editor.paper);

  const dimensions = getPaperDimensions(paper.pageSize, paper.orientation);

  /*
   * --------------------------------------------------
   * PAPER LAYOUT
   * --------------------------------------------------
   *
   * Converts Redux editor state into a normalized
   * document structure.
   */
  const layout = useMemo(
    () =>
      buildPaperLayout({
        title,
        questions,
        sections,
        paper,
      }),
    [title, questions, sections, paper],
  );

  const blocks = layout.blocks;

  /*
   * --------------------------------------------------
   * MEASUREMENT
   * --------------------------------------------------
   *
   * PaperMeasurement renders an invisible copy of
   * the paper and measures the actual block heights.
   */
  const [measurement, setMeasurement] = useState(null);

  const handleMeasure = useCallback((result) => {
    setMeasurement(result);
  }, []);

  /*
   * --------------------------------------------------
   * PAPER DIMENSIONS
   * --------------------------------------------------
   *
   * CSS:
   *
   * 96px = 1 inch
   * 25.4mm = 1 inch
   */
  const mmToPx = useCallback((mm) => mm * (96 / 25.4), []);

  const paperWidthPx = mmToPx(dimensions.width);

  const paperHeightPx = mmToPx(dimensions.height);

  const marginTopPx = mmToPx(paper.margins.top);

  const marginBottomPx = mmToPx(paper.margins.bottom);

  /*
   * --------------------------------------------------
   * CONTENT HEIGHT
   * --------------------------------------------------
   *
   * This is the physical area between the top and
   * bottom paper margins.
   */
  const contentAreaHeight = paperHeightPx - marginTopPx - marginBottomPx;

  /*
   * --------------------------------------------------
   * AVAILABLE HEIGHT
   * --------------------------------------------------
   *
   * Page 1 contains:
   *
   * Header
   * Student information
   * Instructions
   * Questions
   * Footer
   *
   * Continuation pages currently contain:
   *
   * Questions
   * Footer
   */
  const firstPageAvailableHeight = Math.max(
    0,
    contentAreaHeight -
      (measurement?.chrome?.header ?? 0) -
      (measurement?.chrome?.studentInfo ?? 0) -
      (measurement?.chrome?.instructions ?? 0) -
      (measurement?.chrome?.footer ?? 0),
  );

  const continuationPageAvailableHeight = Math.max(
    0,
    contentAreaHeight - (measurement?.chrome?.footer ?? 0),
  );

  /*
   * --------------------------------------------------
   * CHECK MEASUREMENTS
   * --------------------------------------------------
   *
   * Every block must have a measured height before
   * we trust the pagination result.
   */
  const hasMeasurements = Boolean(
    measurement?.blocks &&
    blocks.length > 0 &&
    blocks.every((block) => typeof measurement.blocks[block.id] === "number"),
  );

  /*
   * --------------------------------------------------
   * PAGINATION
   * --------------------------------------------------
   *
   * Do this only once.
   *
   * Before measurement is ready, show a temporary
   * page so the user doesn't see an empty preview.
   */
  const pages = useMemo(() => {
    if (!hasMeasurements) {
      return [
        {
          number: 1,
          columns: [blocks],
        },
      ];
    }

    const paginatedPages = paginateBlocks({
      blocks,
      measurements: measurement.blocks,

      firstPageHeight: firstPageAvailableHeight,

      continuationPageHeight: continuationPageAvailableHeight,

      columns: paper.columns,
    });

    /*
     * Convert the raw pagination result into
     * our formal PaperPage model.
     */
    return buildPaperPages({
      pages: paginatedPages,
      layout,
      dimensions,
    });
  }, [
    blocks,
    measurement,
    hasMeasurements,
    firstPageAvailableHeight,
    continuationPageAvailableHeight,
    paper.columns,
    layout,
    dimensions,
  ]);

  return (
    <div className="paper-workspace flex-1 overflow-auto bg-slate-100 p-10">
      {/*
       * ------------------------------------------------
       * HIDDEN MEASUREMENT PAPER
       * ------------------------------------------------
       *
       * Uses the same width, dimensions, paper settings,
       * title and blocks as the visible paper.
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
       * ------------------------------------------------
       * VISIBLE PAPER
       * ------------------------------------------------
       */}
      <div className="space-y-10">
        {pages.map((page) => (
          <PaperPage
            key={page.number}
            pageNumber={page.number}
            columns={page.columnsContent}
            title={title}
            paper={paper}
            header={page.header}
            studentInfo={page.studentInfo}
            instructions={page.instructions}
            footer={page.footer}
          />
        ))}
      </div>
    </div>
  );
}
