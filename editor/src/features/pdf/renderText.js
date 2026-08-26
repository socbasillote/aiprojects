import { rotatePointAroundCenter } from "./geometry";

import { PDF_FONTS } from "./fonts";

export function renderText(pdf, element) {
  const {
    fontSize = 16,
    fontFamily = "Roboto",
    fontWeight = 400,
    color,
    textAlign = "left",
    lineHeight = 1.2,
  } = element.style ?? {};

  const weight = normalizeFontWeight(fontWeight);

  const fontStyle = weight >= 700 ? "bold" : "normal";

  /*
   * Only use fonts that are actually
   * bundled and registered with jsPDF.
   *
   * For now that is Roboto.
   */
  const requestedFontFamily = fontFamily || "Roboto";

  const pdfFontFamily = PDF_FONTS[requestedFontFamily]
    ? requestedFontFamily
    : "Roboto";

  console.log("PDF TEXT FONT:", fontFamily, "→", pdfFontFamily, fontStyle);

  const textColor = hexToRgb(color);

  if (textColor) {
    pdf.setTextColor(...textColor);
  }

  pdf.setFontSize(fontSize);

  /*
   * Fonts have already been registered
   * by prepareFonts().
   */
  pdf.setFont(pdfFontFamily, fontStyle);

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

  const rotation = element.rotation || 0;

  const rotatedAnchor = rotatePointAroundCenter({
    x,
    y,
    centerX,
    centerY,
    degrees: rotation,
  });

  pdf.text(lines, rotatedAnchor.x, rotatedAnchor.y, {
    align: textAlign,
    angle: -rotation,
    lineHeightFactor: lineHeight,
  });
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

function normalizeFontWeight(weight) {
  if (weight === "bold") {
    return 700;
  }

  const numeric = Number(weight);

  return Number.isFinite(numeric) ? numeric : 400;
}
