const PAPER_DIMENSIONS = {
  A4: {
    width: 210,
    height: 297,
  },

  Letter: {
    width: 215.9,
    height: 279.4,
  },

  A3: {
    width: 297,
    height: 420,
  },
};

export function getPaperDimensions(pageSize, orientation) {
  const base = PAPER_DIMENSIONS[pageSize] ?? PAPER_DIMENSIONS.A4;

  if (orientation === "landscape") {
    return {
      width: base.height,
      height: base.width,
    };
  }

  return {
    width: base.width,
    height: base.height,
  };
}

export function getPaperContentDimensions(pageSize, orientation, margins) {
  const page = getPaperDimensions(pageSize, orientation);

  return {
    width: page.width - margins.left - margins.right,

    height: page.height - margins.top - margins.bottom,
  };
}
