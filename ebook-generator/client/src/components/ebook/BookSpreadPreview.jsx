import { useEffect, useMemo, useState } from "react";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";

import PreviewPage from "./preview/PreviewPage.jsx";
import PreviewThumbnail from "./preview/PreviewThumbnail.jsx";

/*
|--------------------------------------------------------------------------
| Standard book preview
|--------------------------------------------------------------------------
*/

const STANDARD_PREVIEW_PAGES = [
  {
    id: "cover",
    label: "Cover",
    type: "cover",
  },
  {
    id: "toc",
    label: "Table of Contents",
    type: "toc",
  },
  {
    id: "chapter-opening",
    label: "Chapter 1",
    type: "chapter-opening",
  },
  {
    id: "chapter-content",
    label: "Chapter 1 — Content",
    type: "chapter-content",
  },
  {
    id: "closing",
    label: "Final Page",
    type: "closing",
  },
];

/*
|--------------------------------------------------------------------------
| Children's book preview
|--------------------------------------------------------------------------
|
| Children's books intentionally do NOT have a table of contents.
|
| Cover
| Title Page
| Story Spread 1
| Story Spread 2
| Story Spread 3
| Ending
| Back Cover
|
*/

const CHILDREN_PREVIEW_PAGES = [
  {
    id: "cover",
    label: "Front Cover",
    type: "cover",
  },
  {
    id: "title-page",
    label: "Title Page",
    type: "title-page",
  },
  {
    id: "story-spread-1",
    label: "Story Spread 1",
    type: "story-spread",
    spreadNumber: 1,
  },
  {
    id: "story-spread-2",
    label: "Story Spread 2",
    type: "story-spread",
    spreadNumber: 2,
  },
  {
    id: "story-spread-3",
    label: "Story Spread 3",
    type: "story-spread",
    spreadNumber: 3,
  },
  {
    id: "ending",
    label: "The End",
    type: "ending",
  },
  {
    id: "back-cover",
    label: "Back Cover",
    type: "back-cover",
  },
];

/*
|--------------------------------------------------------------------------
| Normalize template values
|--------------------------------------------------------------------------
*/

const normalizeTemplateValue = (value) => {
  if (!value) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/*
|--------------------------------------------------------------------------
| Get template identifier
|--------------------------------------------------------------------------
*/

const getTemplateId = (template) => {
  return normalizeTemplateValue(
    template?.id || template?.templateId || template?.slug || template?.name,
  );
};

/*
|--------------------------------------------------------------------------
| Get category
|--------------------------------------------------------------------------
*/

const getTemplateCategory = (template) => {
  return normalizeTemplateValue(template?.category || template?.contentType);
};

/*
|--------------------------------------------------------------------------
| Children's template detection
|--------------------------------------------------------------------------
*/

const isChildrensTemplate = (template) => {
  const templateId = getTemplateId(template);

  const category = getTemplateCategory(template);

  return (
    category === "childrens-books" ||
    category === "childrens-book" ||
    category === "children-books" ||
    category === "children-book" ||
    category.includes("children") ||
    templateId === "storybook" ||
    templateId === "playful-illustrated" ||
    templateId === "classroom"
  );
};

/*
|--------------------------------------------------------------------------
| Get children's template display name
|--------------------------------------------------------------------------
*/

const getChildrenTemplateName = (template) => {
  const templateId = getTemplateId(template);

  if (
    templateId === "playful-illustrated" ||
    templateId === "playful-illustrated-template"
  ) {
    return "Playful Illustrated";
  }

  if (templateId === "classroom" || templateId === "classroom-template") {
    return "Classroom";
  }

  if (templateId === "storybook" || templateId === "storybook-template") {
    return "Storybook";
  }

  /*
   * Fallback for Children's Books.
   */
  return template?.name || "Children's Book";
};

/*
|--------------------------------------------------------------------------
| Get preview description
|--------------------------------------------------------------------------
*/

const getTemplateDescription = (template) => {
  const templateId = getTemplateId(template);

  if (templateId === "storybook" || templateId === "storybook-template") {
    return "Preview the warm, spacious picture-book layout and story spreads.";
  }

  if (
    templateId === "playful-illustrated" ||
    templateId === "playful-illustrated-template"
  ) {
    return "Preview the playful illustrated layout with expressive artwork and fun story elements.";
  }

  if (templateId === "classroom" || templateId === "classroom-template") {
    return "Preview the structured educational layout designed for learning books.";
  }

  if (isChildrensTemplate(template)) {
    return "Preview the children's book layout and illustrated story spreads.";
  }

  return "Preview the visual style before using it for your ebook.";
};

/*
|--------------------------------------------------------------------------
| BookSpreadPreview
|--------------------------------------------------------------------------
*/

const BookSpreadPreview = ({ template, onClose, onSelect }) => {
  const [currentPage, setCurrentPage] = useState(0);

  /*
   * Determine which page structure this template uses.
   */
  const previewPages = useMemo(() => {
    if (isChildrensTemplate(template)) {
      return CHILDREN_PREVIEW_PAGES;
    }

    return STANDARD_PREVIEW_PAGES;
  }, [template]);

  /*
   * Keep current page valid if the template changes.
   */
  useEffect(() => {
    setCurrentPage((current) => {
      const maximumPage = previewPages.length - 1;

      if (current > maximumPage) {
        return Math.max(0, maximumPage);
      }

      return current;
    });
  }, [previewPages.length]);

  /*
   * Do not render without a template.
   */
  if (!template) {
    return null;
  }

  const currentPreviewPage = previewPages[currentPage];

  const isFirstPage = currentPage === 0;

  const isLastPage = currentPage === previewPages.length - 1;

  const childrenBook = isChildrensTemplate(template);

  const childrenTemplateName = getChildrenTemplateName(template);

  const templateDescription = getTemplateDescription(template);

  /*
   * Navigation
   */

  const handlePrevious = () => {
    setCurrentPage((current) => (current > 0 ? current - 1 : current));
  };

  const handleNext = () => {
    setCurrentPage((current) =>
      current < previewPages.length - 1 ? current + 1 : current,
    );
  };

  const handleSelectPage = (index) => {
    if (index < 0 || index >= previewPages.length) {
      return;
    }

    setCurrentPage(index);
  };

  /*
   * Keyboard controls
   */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
        return;
      }

      if (event.key === "ArrowLeft") {
        setCurrentPage((current) => (current > 0 ? current - 1 : current));

        return;
      }

      if (event.key === "ArrowRight") {
        setCurrentPage((current) =>
          current < previewPages.length - 1 ? current + 1 : current,
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, previewPages.length]);

  /*
   * Lock body scrolling.
   */

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="flex h-[95vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-zinc-100 shadow-2xl">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-base font-semibold text-zinc-900">
                {template.name || "Book preview"}
              </h2>

              {childrenBook && (
                <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                  {childrenTemplateName}
                </span>
              )}
            </div>

            <p className="mt-1 truncate text-xs text-zinc-500">
              {templateDescription}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="ml-4 shrink-0 rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <X size={20} />
          </button>
        </header>

        {/* ======================================================
            BODY
        ====================================================== */}

        <div className="flex min-h-0 flex-1">
          {/* ====================================================
              SIDEBAR
          ==================================================== */}

          <aside className="hidden w-60 shrink-0 overflow-y-auto border-r border-zinc-200 bg-white p-4 lg:block">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                {childrenBook
                  ? `${childrenTemplateName} preview`
                  : "Book preview"}
              </p>

              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {childrenBook
                  ? "Explore the cover, title page, story spreads, ending, and back cover."
                  : "Explore the main pages of this design."}
              </p>
            </div>

            <div className="space-y-3">
              {previewPages.map((previewPage, index) => {
                const active = currentPage === index;

                return (
                  <button
                    key={previewPage.id}
                    type="button"
                    onClick={() => handleSelectPage(index)}
                    className={`w-full rounded-xl p-2 text-left transition ${
                      active ? "bg-zinc-900" : "hover:bg-zinc-100"
                    }`}
                  >
                    <div
                      className={`aspect-[3/4] overflow-hidden rounded-lg border ${
                        active ? "border-zinc-700" : "border-zinc-200"
                      }`}
                    >
                      <PreviewThumbnail
                        page={previewPage}
                        template={template}
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between px-1">
                      <span
                        className={`truncate text-xs font-medium ${
                          active ? "text-white" : "text-zinc-700"
                        }`}
                      >
                        {previewPage.label}
                      </span>

                      <span
                        className={`text-[10px] ${
                          active ? "text-zinc-400" : "text-zinc-400"
                        }`}
                      >
                        {index + 1}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* ====================================================
              PREVIEW
          ==================================================== */}

          <main className="flex min-w-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-5 sm:p-8 lg:p-10">
              <div
                className={`flex w-full items-center justify-center gap-5 ${
                  childrenBook ? "max-w-7xl" : "max-w-6xl"
                }`}
              >
                {/* Previous */}

                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={isFirstPage}
                  aria-label="Previous page"
                  className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-30 md:flex"
                >
                  <ChevronLeft size={20} />
                </button>

                {/* Current page */}

                <div className="min-w-0 flex-1">
                  <div
                    className={`mx-auto w-full ${
                      childrenBook ? "max-w-6xl" : "max-w-[680px]"
                    }`}
                  >
                    <PreviewPage
                      page={currentPreviewPage}
                      template={template}
                    />
                  </div>
                </div>

                {/* Next */}

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isLastPage}
                  aria-label="Next page"
                  className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-30 md:flex"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* ==================================================
                MOBILE NAVIGATION
            ================================================== */}

            <div className="flex shrink-0 items-center justify-center gap-4 border-t border-zinc-200 bg-white px-4 py-3 md:hidden">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={isFirstPage}
                aria-label="Previous page"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 disabled:opacity-30"
              >
                <ChevronLeft size={17} />
              </button>

              <span className="text-xs text-zinc-500">
                Page {currentPage + 1} of {previewPages.length}
              </span>

              <button
                type="button"
                onClick={handleNext}
                disabled={isLastPage}
                aria-label="Next page"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 disabled:opacity-30"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </main>
        </div>

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <footer className="flex shrink-0 flex-col gap-3 border-t border-zinc-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-700">
              {currentPreviewPage.label}
            </p>

            <p className="mt-1 text-[11px] text-zinc-400">
              Page {currentPage + 1} of {previewPages.length}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => onSelect?.(template)}
              className="flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
            >
              <Check size={16} />
              Use this style
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default BookSpreadPreview;
