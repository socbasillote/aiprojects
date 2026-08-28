export function buildPaperBlocks({ questions, sections }) {
  const questionMap = new Map(
    questions.map((question) => [question.id, question]),
  );

  const blocks = [];

  let questionNumber = 0;

  sections.forEach((section) => {
    blocks.push({
      id: `section-${section.id}`,
      type: "section",
      sectionId: section.id,
      title: section.title || "Untitled Section",
      instructions: section.instructions || "",
      keepWithNext: true,
    });

    section.questionIds.forEach((questionId) => {
      const question = questionMap.get(questionId);

      if (!question) {
        return;
      }

      questionNumber += 1;

      blocks.push({
        id: question.id,
        type: "question",
        question,
        number: questionNumber,
        sectionId: section.id,
      });
    });
  });

  return blocks;
}

export function paginateBlocks({
  blocks,
  measurements,
  firstPageHeight,
  continuationPageHeight,
  columns = 1,
}) {
  const pages = [];

  let pageNumber = 1;

  let currentColumns = Array.from({ length: columns }, () => []);

  let columnHeights = Array.from({ length: columns }, () => 0);

  let currentColumn = 0;

  function getAvailableHeight() {
    return pageNumber === 1 ? firstPageHeight : continuationPageHeight;
  }

  function pushPage() {
    const hasBlocks = currentColumns.some((column) => column.length > 0);

    if (!hasBlocks) {
      return;
    }

    pages.push({
      number: pageNumber,
      columns: currentColumns,
    });

    pageNumber += 1;

    currentColumns = Array.from({ length: columns }, () => []);

    columnHeights = Array.from({ length: columns }, () => 0);

    currentColumn = 0;
  }

  function getBlockHeight(block) {
    return (measurements[block.id] ?? 0) + 2;
  }

  function canFit(blockHeight) {
    return columnHeights[currentColumn] + blockHeight <= getAvailableHeight();
  }

  blocks.forEach((block, index) => {
    const blockHeight = getBlockHeight(block);

    /*
     * If this is a section heading that
     * must stay with the next block,
     * calculate the combined height.
     */
    let requiredHeight = blockHeight;

    const nextBlock = blocks[index + 1];

    if (block.keepWithNext && nextBlock) {
      requiredHeight += getBlockHeight(nextBlock);
    }

    /*
     * Move to the next column if the
     * block (or section + first question)
     * cannot fit.
     */
    while (currentColumn < columns && !canFit(requiredHeight)) {
      currentColumn += 1;
    }

    /*
     * If there is no column left,
     * create a new page.
     */
    if (currentColumn >= columns) {
      pushPage();

      currentColumn = 0;
    }

    /*
     * Add the actual block.
     */
    currentColumns[currentColumn].push(block);

    columnHeights[currentColumn] += blockHeight;
  });

  pushPage();

  if (pages.length === 0) {
    pages.push({
      number: 1,
      columns: Array.from({ length: columns }, () => []),
    });
  }

  return pages;
}
