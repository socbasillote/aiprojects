export const PAPER_SIZES = {
  A4: {
    width: 210,
    height: 297,
  },

  LETTER: {
    width: 215.9,
    height: 279.4,
  },
};

export function getPaperDimensions(pageSize, orientation) {
  const size = PAPER_SIZES[pageSize] || PAPER_SIZES.A4;

  if (orientation === "landscape") {
    return {
      width: size.height,
      height: size.width,
    };
  }

  return size;
}
