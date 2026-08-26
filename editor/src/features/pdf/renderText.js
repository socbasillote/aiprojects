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

  /*
   * Resolve the requested family.
   *
   * If the document contains an unsupported
   * or legacy font, fall back to Roboto.
   */
  const requestedFontFamily = fontFamily || "Roboto";

  const pdfFontFamily = PDF_FONTS[requestedFontFamily]
    ? requestedFontFamily
    : "Roboto";

  /*
   * Find the closest bundled weight.
   */
  const resolved = resolvePdfFont(pdfFontFamily, weight);

  const textColor = hexToRgb(color);

  if (textColor) {
    pdf.setTextColor(...textColor);
  }

  pdf.setFontSize(fontSize);

  /*
   * Each weight is registered as its
   * own jsPDF font family:
   *
   * Roboto-400
   * Roboto-500
   * Roboto-600
   * Roboto-700
   */
  pdf.setFont(resolved.pdfFontFamily, "normal");

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

function resolvePdfFont(fontFamily, requestedWeight) {
  const family = PDF_FONTS[fontFamily];

  if (!family) {
    return {
      pdfFontFamily: "Roboto-400",
      weight: 400,
    };
  }

  const availableWeights = Object.keys(family)
    .map(Number)
    .filter(Number.isFinite);

  if (availableWeights.length === 0) {
    return {
      pdfFontFamily: "Roboto-400",
      weight: 400,
    };
  }

  const resolvedWeight = availableWeights.includes(requestedWeight)
    ? requestedWeight
    : availableWeights.reduce((closest, current) => {
        return Math.abs(current - requestedWeight) <
          Math.abs(closest - requestedWeight)
          ? current
          : closest;
      });

  return {
    pdfFontFamily: `${fontFamily}-${resolvedWeight}`,

    weight: resolvedWeight,
  };
}
