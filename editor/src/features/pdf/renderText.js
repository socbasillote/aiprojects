import { withElementTransform } from "./withElementTransform";
import { rotatePointAroundCenter } from "./geometry";

export function renderText(pdf, element) {
  const {
    fontSize = 16,
    fontFamily,
    fontWeight,
    color,
    textAlign = "left",
    lineHeight = 1.2,
  } = element.style;

  const textColor = hexToRgb(color);

  if (textColor) {
    pdf.setTextColor(...textColor);
  }

  pdf.setFontSize(fontSize);

  pdf.setFont(resolveFontFamily(fontFamily), resolveFontStyle(fontWeight));

  const lines = pdf.splitTextToSize(element.content || "", element.width);

  let x = element.x;

  if (textAlign === "center") {
    x = element.x + element.width / 2;
  }

  if (textAlign === "right") {
    x = element.x + element.width;
  }

  const y = element.y + fontSize;

  const centerX = element.x + element.width / 2;

  const centerY = element.y + element.height / 2;

  const rotatedAnchor = rotatePointAroundCenter({
    x,
    y,
    centerX,
    centerY,
    degrees: element.rotation || 0,
  });

  pdf.text(lines, rotatedAnchor.x, rotatedAnchor.y, {
    align: textAlign,

    angle: -(element.rotation || 0),

    lineHeightFactor: lineHeight,
  });
}

function resolveFontFamily(fontFamily) {
  switch (fontFamily) {
    case "Arial":
      return "helvetica";

    case "Times New Roman":
      return "times";

    case "Courier New":
      return "courier";

    default:
      return "helvetica";
  }
}

function resolveFontStyle(fontWeight) {
  if (fontWeight === "bold" || Number(fontWeight) >= 700) {
    return "bold";
  }

  return "normal";
}

export function hexToRgb(color) {
  if (!color || color === "transparent") {
    return null;
  }

  const hex = color.replace("#", "");

  if (hex.length !== 6) {
    return null;
  }

  return [
    parseInt(hex.slice(0, 2), 16),

    parseInt(hex.slice(2, 4), 16),

    parseInt(hex.slice(4, 6), 16),
  ];
}
