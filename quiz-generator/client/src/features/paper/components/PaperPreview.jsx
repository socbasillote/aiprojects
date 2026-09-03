import { useCallback, useMemo, useRef, useState } from "react";

import { useSelector } from "react-redux";

import PaperPage from "./PaperPage";
import PaperMeasurement from "./PaperMeasurement";
import EditorToolbar from "../../editor/components/EditorToolbar";

import { paginateBlocks } from "../../editor/pagination";
import { buildPaperPages } from "../../../editor/paperPageModel";
import { buildPaperLayout } from "../../../editor/buildPaperLayout";

import { getPaperDimensions } from "../paperUtils";

export default function PaperPreview({ previewRef }) {
  const workspaceRef = useRef(null);
  const panRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [handMode, setHandMode] = useState(false);
  const [activeEditor, setActiveEditor] = useState(null);
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

  function handlePointerDown(event) {
    if (!handMode || event.button !== 0 || !workspaceRef.current) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    panRef.current = {
      x: event.clientX,
      y: event.clientY,
      scrollLeft: workspaceRef.current.scrollLeft,
      scrollTop: workspaceRef.current.scrollTop,
    };
  }

  function handlePointerMove(event) {
    if (!panRef.current || !workspaceRef.current) {
      return;
    }

    workspaceRef.current.scrollLeft =
      panRef.current.scrollLeft - (event.clientX - panRef.current.x);
    workspaceRef.current.scrollTop =
      panRef.current.scrollTop - (event.clientY - panRef.current.y);
  }

  function stopPanning(event) {
    if (panRef.current) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      panRef.current = null;
    }
  }

  return (
    <div
      ref={workspaceRef}
      className={`paper-workspace relative flex-1 overflow-auto bg-slate-100 p-10 ${
        handMode ? "cursor-grab active:cursor-grabbing" : ""
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopPanning}
      onPointerCancel={stopPanning}
    >
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

      {activeEditor?.editor && (
        <div className="sticky top-0 z-20 mx-auto mb-4 w-fit max-w-full rounded-b-lg border border-t-0 border-slate-200 bg-white shadow-lg">
          <EditorToolbar
            editor={activeEditor.editor}
            onAddImage={activeEditor.addImage}
          />
        </div>
      )}

      {/*
       * ------------------------------------------------
       * VISIBLE PAPER
       * ------------------------------------------------
       */}
      <div ref={previewRef} data-paper-preview className="space-y-10">
        {pages.map((page) => (
          <div
            key={page.number}
            className="flex justify-center"
            style={{
              width: `${paperWidthPx * zoom}px`,
              height: `${paperHeightPx * zoom}px`,
              marginInline: "auto",
            }}
          >
            <div
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
                width: `${paperWidthPx}px`,
                height: `${paperHeightPx}px`,
              }}
            >
              <PaperPage
                pageNumber={page.number}
                columns={page.columnsContent}
                title={title}
                paper={paper}
                header={page.header}
                studentInfo={page.studentInfo}
                instructions={page.instructions}
                footer={page.footer}
                onEditorReady={setActiveEditor}
              />
            </div>
          </div>
        ))}
      </div>

      <div
        className="fixed bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setZoom((value) => Math.max(0.5, value - 0.1))}
          aria-label="Zoom out"
          title="Zoom out"
          className="h-8 w-8 rounded text-lg text-slate-600 hover:bg-slate-100"
        >
          −
        </button>
        <span className="min-w-12 text-center text-xs font-medium text-slate-600">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom((value) => Math.min(2, value + 0.1))}
          aria-label="Zoom in"
          title="Zoom in"
          className="h-8 w-8 rounded text-lg text-slate-600 hover:bg-slate-100"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => setHandMode((value) => !value)}
          aria-label={handMode ? "Disable hand tool" : "Enable hand tool"}
          title={handMode ? "Disable hand tool" : "Hand tool"}
          aria-pressed={handMode}
          className={`ml-1 h-8 w-8 rounded text-base ${
            handMode
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          ✋
        </button>
      </div>
    </div>
  );
}
