const PX_PER_MM = 96 / 25.4;

export function mmToPx(mm) {
  return mm * PX_PER_MM;
}

export function getPaperGeometry({ dimensions, margins }) {
  const width = mmToPx(dimensions.width);
  const height = mmToPx(dimensions.height);

  const marginTop = mmToPx(margins.top);
  const marginRight = mmToPx(margins.right);
  const marginBottom = mmToPx(margins.bottom);
  const marginLeft = mmToPx(margins.left);

  return {
    width,
    height,

    margins: {
      top: marginTop,
      right: marginRight,
      bottom: marginBottom,
      left: marginLeft,
    },

    contentWidth: width - marginLeft - marginRight,

    contentHeight: height - marginTop - marginBottom,
  };
}
